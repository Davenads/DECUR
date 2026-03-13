#!/usr/bin/env node
/**
 * Geocodes ufotimeline.json entries that have extractable locations.
 * Targets:
 *   1. NICAP entries (source: "nicap") - location in title pattern "{year} {Location} UFO Incident"
 *   2. famous-cases entries - well-known locations from title
 *
 * Uses Nominatim (OpenStreetMap) - free, no API key, 1 req/sec rate limit.
 * Writes lat/lng back into ufotimeline.json.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TIMELINE_FILE = path.join(__dirname, '..', 'data', 'ufotimeline.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function nominatimGeocode(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'DECUR-UAP-Research/1.0 (educational research platform)',
        'Accept-Language': 'en',
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), display: results[0].display_name });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(10000, () => { req.abort(); resolve(null); });
  });
}

function extractNicapLocation(title) {
  // Pattern: "1952 Fairchild AFB, Wash. UFO Incident" -> "Fairchild AFB, Washington"
  // Strip year prefix and " UFO Incident" suffix
  let loc = title
    .replace(/^\d{4}\s+/, '')  // Remove leading year
    .replace(/\s+UFO Incident\s*$/i, '')  // Remove trailing "UFO Incident"
    .replace(/\s+UFO\s*$/i, '')
    .trim();

  // Skip vague ocean/region entries
  const SKIP_PATTERNS = [
    /\b(ocean|sea|gulf|pacific|atlantic|miles? (off|from|south|north|east|west))\b/i,
    /\b(location not given|unknown|date unknown)\b/i,
    /\b(nr\.|near)\b.*\d/i,  // "Nr. Prohlandynt" style vague
    /^\d+\s+mi/i,  // "50 miles from..."
    /^E of /i,  // "E of South Korea"
    /^[NESW] of /i,
  ];
  for (const p of SKIP_PATTERNS) {
    if (p.test(loc)) return null;
  }

  // Normalize state abbreviations for better geocoding
  const STATE_FIXES = {
    'Wash\\.': 'Washington', 'Calif\\.': 'California', 'Mass\\.': 'Massachusetts',
    'Tex\\.': 'Texas', 'N\\.Y\\.': 'New York', 'N\\.J\\.': 'New Jersey',
    'N\\.M\\.': 'New Mexico', 'N\\.C\\.': 'North Carolina', 'N\\.D\\.': 'North Dakota',
    'S\\.C\\.': 'South Carolina', 'S\\.D\\.': 'South Dakota', 'Va\\.': 'Virginia',
    'W\\.Va\\.': 'West Virginia', 'Pa\\.': 'Pennsylvania', 'Fla\\.': 'Florida',
    'Ga\\.': 'Georgia', 'Ill\\.': 'Illinois', 'Ind\\.': 'Indiana', 'Mich\\.': 'Michigan',
    'Minn\\.': 'Minnesota', 'Mo\\.': 'Missouri', 'Mont\\.': 'Montana', 'Neb\\.': 'Nebraska',
    'Nev\\.': 'Nevada', 'Ohio': 'Ohio', 'Okla\\.': 'Oklahoma', 'Ore\\.': 'Oregon',
    'Tenn\\.': 'Tennessee', 'Wis\\.': 'Wisconsin', 'Wyo\\.': 'Wyoming',
    'Ala\\.': 'Alabama', 'Ariz\\.': 'Arizona', 'Ark\\.': 'Arkansas', 'Colo\\.': 'Colorado',
    'Conn\\.': 'Connecticut', 'Del\\.': 'Delaware', 'Idaho': 'Idaho', 'Iowa': 'Iowa',
    'Kans\\.': 'Kansas', 'Ky\\.': 'Kentucky', 'La\\.': 'Louisiana', 'Md\\.': 'Maryland',
    'Maine': 'Maine', 'Miss\\.': 'Mississippi',
  };
  for (const [abbr, full] of Object.entries(STATE_FIXES)) {
    loc = loc.replace(new RegExp(abbr, 'g'), full);
  }

  // Remove parenthetical suffixes like "(near ...)"
  loc = loc.replace(/\s*\([^)]{0,40}\)\s*$/, '').trim();

  // Trim trailing punctuation
  loc = loc.replace(/[,;.\s]+$/, '').trim();

  return loc.length > 3 ? loc : null;
}

function extractFamousCaseLocation(title, excerpt) {
  // For non-NICAP famous cases, try to extract location from title
  // Many follow patterns like "Battle Of Los Angeles", "Rendlesham Forest Incident"
  // or have location info in the excerpt

  // Strip common non-location prefixes
  const clean = title
    .replace(/^\d{4}\s+/,'')
    .replace(/\s*(incident|sighting|wave|event|case|crash|abduction|encounter|phenomenon)\s*$/i, '')
    .trim();

  // Known high-value titles with extractable locations
  const LOCATION_MAP = {
    'UFOs Over Nuremberg': 'Nuremberg, Germany',
    'Celestial Phenomenon Over Basel': 'Basel, Switzerland',
    'Air Battle Of Stralsund': 'Stralsund, Germany',
    'Aurora, Texas, UFO Incident': 'Aurora, Texas',
    'Miracle Of The Sun': 'Fatima, Portugal',
    'Magenta, Italy UFO Crash': 'Magenta, Italy',
    'Battle Of Los Angeles': 'Los Angeles, California',
    'Scandinavian Ghost Rockets': 'Sweden',
    'Kenneth Arnold UFO Sighting': 'Mount Rainier, Washington',
    'Maury Island UFO Incident': 'Maury Island, Washington',
    'Roswell UFO Incident': 'Roswell, New Mexico',
    'Roswell Crash': 'Roswell, New Mexico',
    'Thomas Mantell UFO': 'Fort Knox, Kentucky',
    'Gorman Dogfight': 'Fargo, North Dakota',
    'Chiles-Whitted UFO Encounter': 'Montgomery, Alabama',
    'Lubbock Lights': 'Lubbock, Texas',
    'Flatwoods Monster': 'Flatwoods, West Virginia',
    'Washington D.C. UFO': 'Washington DC',
    'Washington UFO': 'Washington DC',
    'Kelly-Hopkinsville': 'Kelly, Kentucky',
    'Levelland UFO': 'Levelland, Texas',
    'Kecksburg': 'Kecksburg, Pennsylvania',
    'Shag Harbour': 'Shag Harbour, Nova Scotia',
    'Rendlesham Forest': 'Rendlesham Forest, Suffolk, England',
    'Cash-Landrum': 'Dayton, Texas',
    'Trans-en-Provence': 'Trans-en-Provence, France',
    'Bentwaters': 'RAF Bentwaters, Suffolk, England',
    'Westall UFO': 'Melbourne, Australia',
    'Portage County': 'Portage County, Ohio',
    'Socorro': 'Socorro, New Mexico',
    'Kaikoura': 'Kaikoura, New Zealand',
    'JAL Flight': 'Alaska',
    'Malmstrom': 'Great Falls, Montana',
    'Coyne Helicopter': 'Mansfield, Ohio',
    'Tehran UFO': 'Tehran, Iran',
    'Colares UFO': 'Colares, Brazil',
    'Zimbabwe': 'Ruwa, Zimbabwe',
    'Ariel School': 'Ruwa, Zimbabwe',
    'Travis Walton': 'Snowflake, Arizona',
    'Frederick Valentich': 'Bass Strait, Australia',
  };

  for (const [key, loc] of Object.entries(LOCATION_MAP)) {
    if (title.includes(key)) return loc;
  }

  return null;
}

async function main() {
  const timeline = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));

  // Find entries that need geocoding (no existing lat/lng)
  const needsGeocode = timeline.filter(e => {
    if (e.lat && e.lng) return false;  // Already has coordinates
    if (e.source === 'nicap') return true;
    if (e.categories && e.categories.includes('famous-cases')) return true;
    return false;
  });

  console.log(`Entries to attempt geocoding: ${needsGeocode.length}`);

  const results = { success: 0, skipped: 0, failed: 0 };
  const coordMap = {};  // id -> {lat, lng}

  for (let i = 0; i < needsGeocode.length; i++) {
    const entry = needsGeocode[i];

    let locationQuery = null;
    if (entry.source === 'nicap') {
      locationQuery = extractNicapLocation(entry.title);
    } else {
      locationQuery = extractFamousCaseLocation(entry.title, entry.excerpt || '');
    }

    if (!locationQuery) {
      results.skipped++;
      if (i % 20 === 0) process.stdout.write('.');
      continue;
    }

    process.stdout.write(`\n  [${i+1}/${needsGeocode.length}] "${locationQuery}" ... `);

    const coords = await nominatimGeocode(locationQuery);
    if (coords) {
      coordMap[entry.id] = { lat: coords.lat, lng: coords.lng };
      process.stdout.write(`OK (${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)})`);
      results.success++;
    } else {
      process.stdout.write('no result');
      results.failed++;
    }

    // Nominatim requires 1 req/sec
    await sleep(1100);
  }

  console.log(`\n\nResults: ${results.success} geocoded, ${results.skipped} skipped (no location), ${results.failed} failed`);

  // Apply coordinates back to timeline
  let updated = 0;
  const enriched = timeline.map(e => {
    if (coordMap[e.id]) {
      updated++;
      return { ...e, lat: coordMap[e.id].lat, lng: coordMap[e.id].lng };
    }
    return e;
  });

  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(enriched, null, 2));
  console.log(`✓ Updated ${updated} entries with coordinates`);

  // Summary of what we now have
  const withCoords = enriched.filter(e => e.lat && e.lng);
  console.log(`Total timeline entries with coordinates: ${withCoords.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
