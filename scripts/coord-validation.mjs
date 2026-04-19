/**
 * coord-validation.mjs
 *
 * Shared coordinate plausibility validation for UAP sighting records.
 *
 * Used by:
 *   scripts/import-from-sqlite.mjs  — validates at import time
 *   scripts/cleanup-bad-coords.mjs  — one-time and periodic Supabase cleanup
 *
 * Validation strategy
 * -------------------
 * Point-in-polygon (PIP) against Natural Earth vector boundaries was evaluated
 * but rejected: at both 110m and 50m resolution, coastal city geocodes (NYC
 * at 40.7,-74.0; Miami at 25.77,-80.19) fall in harbor/bay polygons and return
 * false, producing unacceptable false-rejection rates for the highest-frequency
 * UAP reporting regions.
 *
 * Bounding-box validation is used instead.  A bbox that covers a country's
 * full extent naturally includes its harbors and territorial waters, so it has
 * zero false-rejection rate for coastal coordinates while still catching the
 * gross geographic mismatches the validation is designed to eliminate (e.g.
 * country=US, coords=(51.5, 10.0) — clearly Germany).
 *
 * Coverage: 70+ country codes covering ~98% of the corpus.  Unknown/unlisted
 * country codes pass through unchecked (safe default — don't reject what we
 * can't verify).
 *
 * Bounds format: [minLat, maxLat, minLng, maxLng]
 */

// ── Country bounding boxes ────────────────────────────────────────────────────

export const COUNTRY_BOUNDS = {
  // North America
  'us': [18.9,  72.0, -180.0,  -66.0],   // CONUS + Alaska + Hawaii
  'ca': [41.7,  83.1, -141.0,  -52.6],   // Canada
  'mx': [14.5,  32.7, -117.1,  -86.7],   // Mexico
  'pr': [17.9,  18.5,  -67.3,  -65.6],   // Puerto Rico
  'gt': [13.7,  17.8,  -92.3,  -88.2],   // Guatemala
  'hn': [13.0,  16.5,  -89.4,  -83.1],   // Honduras
  'sv': [13.1,  14.4,  -90.1,  -87.7],   // El Salvador
  'ni': [10.7,  15.0,  -87.7,  -83.1],   // Nicaragua
  'cr': [ 8.0,  11.2,  -85.9,  -82.6],   // Costa Rica
  'pa': [ 7.2,   9.6,  -83.0,  -77.1],   // Panama
  'do': [17.5,  20.0,  -72.0,  -68.3],   // Dominican Republic
  'ht': [17.9,  20.1,  -74.5,  -71.6],   // Haiti
  'jm': [17.7,  18.5,  -78.4,  -76.2],   // Jamaica
  'tt': [10.0,  11.3,  -61.9,  -60.5],   // Trinidad and Tobago
  'bb': [13.0,  13.3,  -59.7,  -59.4],   // Barbados
  // Europe
  'gb': [49.9,  60.9,   -8.2,    1.8],   // Great Britain
  'uk': [49.9,  60.9,   -8.2,    1.8],   // UK alias
  'de': [47.3,  55.1,    5.9,   15.1],   // Germany
  'fr': [41.3,  51.1,   -5.2,    9.6],   // France
  'es': [27.6,  43.8,  -18.2,    4.3],   // Spain (incl. Canary Islands)
  'it': [35.5,  47.1,    6.6,   18.5],   // Italy
  'nl': [50.8,  53.6,    3.4,    7.2],   // Netherlands
  'se': [55.3,  69.1,   11.1,   24.2],   // Sweden
  'no': [57.9,  71.2,    4.5,   31.2],   // Norway
  'fi': [59.8,  70.1,   20.6,   31.6],   // Finland
  'pl': [49.0,  54.9,   14.1,   24.2],   // Poland
  'ru': [41.2,  77.7,   19.6,  180.0],   // Russia (antimeridian — lat-only check)
  'ie': [51.4,  55.4,  -10.5,   -6.0],   // Ireland
  'ch': [45.8,  47.8,    5.9,   10.5],   // Switzerland
  'be': [49.5,  51.5,    2.5,    6.4],   // Belgium
  'at': [46.4,  49.0,    9.5,   17.2],   // Austria
  'pt': [32.6,  42.2,  -31.3,   -6.2],   // Portugal (incl. Azores)
  'gr': [34.8,  41.8,   19.4,   29.6],   // Greece
  'cz': [48.6,  51.1,   12.1,   18.9],   // Czech Republic
  'sk': [47.7,  49.6,   16.8,   22.6],   // Slovakia
  'hu': [45.7,  48.6,   16.1,   22.9],   // Hungary
  'ro': [43.6,  48.3,   20.3,   29.7],   // Romania
  'ua': [44.4,  52.4,   22.1,   40.2],   // Ukraine
  'by': [51.3,  56.2,   23.2,   32.8],   // Belarus
  'dk': [54.6,  57.8,    8.1,   15.2],   // Denmark
  'hr': [42.4,  46.6,   13.5,   19.5],   // Croatia
  'rs': [42.2,  46.2,   18.8,   23.0],   // Serbia
  'bg': [41.2,  44.2,   22.4,   28.6],   // Bulgaria
  'lv': [55.7,  58.1,   20.9,   28.2],   // Latvia
  'lt': [53.9,  56.5,   21.0,   26.8],   // Lithuania
  'ee': [57.5,  59.7,   21.8,   28.2],   // Estonia
  'si': [45.4,  46.9,   13.4,   16.6],   // Slovenia
  'ba': [42.6,  45.3,   15.7,   19.6],   // Bosnia and Herzegovina
  'me': [41.9,  43.6,   18.4,   20.4],   // Montenegro
  'mk': [40.9,  42.4,   20.4,   23.0],   // North Macedonia
  'al': [39.6,  42.7,   19.3,   21.1],   // Albania
  'md': [45.5,  48.5,   26.6,   30.2],   // Moldova
  // Oceania
  'au': [-43.7, -10.7,  113.0,  153.8],  // Australia
  'nz': [-47.3, -34.4,  166.4,  178.6],  // New Zealand
  // Asia-Pacific
  'jp': [24.0,  45.7,  122.9,  153.6],   // Japan
  'cn': [18.2,  53.6,   73.4,  134.8],   // China
  'in': [ 8.1,  37.1,   68.2,   97.4],   // India
  'kr': [33.1,  38.6,  125.1,  129.6],   // South Korea
  'kp': [37.7,  43.0,  124.3,  130.7],   // North Korea
  'ph': [ 4.6,  21.1,  116.9,  126.6],   // Philippines
  'tw': [21.9,  25.3,  120.0,  122.0],   // Taiwan
  'th': [ 5.6,  20.5,   97.3,  105.7],   // Thailand
  'sg': [ 1.2,   1.5,  103.6,  104.1],   // Singapore
  'my': [ 0.9,   7.4,   99.6,  119.3],   // Malaysia
  'id': [-8.8,   5.9,   95.0,  141.0],   // Indonesia
  'vn': [ 8.5,  23.4,  102.1,  109.5],   // Vietnam
  'pk': [23.7,  37.1,   60.9,   77.8],   // Pakistan
  'bd': [20.7,  26.6,   88.0,   92.7],   // Bangladesh
  'lk': [ 5.9,   9.8,   79.7,   81.9],   // Sri Lanka
  'mm': [10.0,  28.5,   92.2,  101.2],   // Myanmar
  'np': [26.4,  30.4,   80.1,   88.2],   // Nepal
  'kh': [10.4,  14.7,  102.3,  107.6],   // Cambodia
  'la': [13.9,  22.5,  100.1,  107.6],   // Laos
  // Latin America
  'br': [-33.8,  5.3,  -73.9,  -34.8],   // Brazil
  'ar': [-55.1, -21.8, -73.6,  -53.6],   // Argentina
  'cl': [-55.9, -17.5, -75.7,  -66.4],   // Chile
  'co': [ -4.2,  13.4, -79.0,  -66.9],   // Colombia
  've': [  0.7,  12.2, -73.4,  -59.8],   // Venezuela
  'pe': [-18.4,  -0.1, -81.4,  -68.7],   // Peru
  'bo': [-22.9,  -9.7, -69.7,  -57.5],   // Bolivia
  'ec': [ -5.0,   1.5, -81.0,  -75.2],   // Ecuador
  'py': [-27.6, -19.3, -62.6,  -54.3],   // Paraguay
  'uy': [-34.9, -30.1, -58.5,  -53.1],   // Uruguay
  'cu': [19.8,  23.2,  -85.0,  -74.2],   // Cuba
  // Africa
  'za': [-34.8, -22.1,  16.5,   32.9],   // South Africa
  'eg': [22.0,  31.7,  24.7,   37.1],    // Egypt
  'ng': [ 4.3,  13.9,   2.7,   14.7],    // Nigeria
  'ke': [-4.7,   5.0,  33.9,   42.0],    // Kenya
  'gh': [ 4.7,  11.2,  -3.3,    1.2],    // Ghana
  'et': [ 3.4,  15.0,  33.0,   48.0],    // Ethiopia
  'ma': [27.7,  35.9, -13.2,   -1.0],    // Morocco
  'tz': [-11.7,  -1.0,  29.3,   40.4],   // Tanzania
  'dz': [18.9,  37.1,  -8.7,    9.0],    // Algeria
  'ly': [19.5,  33.2,   9.4,   25.2],    // Libya
  'tn': [30.2,  37.5,   7.5,   11.6],    // Tunisia
  'sd': [ 8.7,  22.2,  21.8,   38.7],    // Sudan
  'ao': [-18.1,  -4.4,  11.7,   24.1],   // Angola
  'mz': [-26.9,  -10.5,  30.2,   40.9],  // Mozambique
  'zm': [-18.1,  -8.2,  21.9,   33.7],   // Zambia
  'zw': [-22.4, -15.6,  25.2,   33.1],   // Zimbabwe
  'cd': [-13.5,   5.4,  12.2,   31.3],   // DR Congo
  'cm': [ 1.7,  13.1,   8.5,   16.2],    // Cameroon
  'ci': [ 4.3,  10.7,  -8.6,   -2.5],    // Ivory Coast
  'sn': [12.3,  16.7, -17.5,  -11.4],    // Senegal
  // Middle East
  'il': [29.5,  33.3,  34.3,   35.9],    // Israel
  'tr': [35.8,  42.1,  25.7,   44.8],    // Turkey
  'sa': [16.4,  32.2,  34.6,   55.7],    // Saudi Arabia
  'ae': [22.6,  26.1,  51.6,   56.4],    // UAE
  'ir': [25.1,  39.8,  44.0,   63.3],    // Iran
  'iq': [29.1,  37.4,  38.8,   48.8],    // Iraq
  'jo': [29.2,  33.4,  34.9,   39.3],    // Jordan
  'lb': [33.1,  34.7,  35.1,   36.6],    // Lebanon
  'sy': [32.3,  37.3,  35.7,   42.4],    // Syria
  'ye': [12.1,  19.0,  42.5,   54.5],    // Yemen
  'om': [16.6,  26.4,  51.8,   59.9],    // Oman
  'kw': [28.5,  30.1,  46.6,   48.4],    // Kuwait
  'qa': [24.5,  26.2,  50.7,   51.6],    // Qatar
  'bh': [25.8,  26.3,  50.4,   50.7],    // Bahrain
  // Central Asia
  'kz': [41.0,  55.4,  51.0,   87.4],    // Kazakhstan
  'uz': [37.2,  45.6,  56.0,   73.1],    // Uzbekistan
  'tm': [35.1,  42.8,  52.4,   66.7],    // Turkmenistan
  'tj': [36.7,  41.0,  67.3,   75.2],    // Tajikistan
  'kg': [39.2,  43.3,  69.3,   80.3],    // Kyrgyzstan
  'af': [29.4,  38.5,  60.5,   74.9],    // Afghanistan
};

// ── Validation functions ──────────────────────────────────────────────────────

/**
 * Returns false when lat/lng are impossible for the stated country.
 * Returns true when country code is unrecognised — safe default (don't reject
 * what we cannot verify).
 *
 * @param {number|null} lat
 * @param {number|null} lng
 * @param {string|null} country  — raw country string from source data
 * @returns {boolean}
 */
export function isCoordPlausible(lat, lng, country) {
  if (lat == null || lng == null || !country) return true;
  const code = country.toLowerCase().trim().replace(/[^a-z]/g, '');
  const bounds = COUNTRY_BOUNDS[code];
  if (!bounds) return true; // unknown country — pass through
  const [minLat, maxLat, minLng, maxLng] = bounds;
  // Russia wraps the antimeridian; lat-only check is sufficient to catch
  // a Russian record geocoded to Western Europe or the Americas.
  if (code === 'ru') return lat >= minLat && lat <= maxLat;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/**
 * Returns true when a coordinate pair should be nulled out.
 * Already-null coordinates return false (safe to call on any record).
 *
 * Checks (in order):
 *   1. Out-of-range  — physically impossible values (corrupt source data)
 *   2. Null Island   — (0, 0) is a geocoding default, not a real location
 *   3. Country bbox  — coordinates fall outside the stated country's bounds
 *
 * @param {number|null} lat
 * @param {number|null} lng
 * @param {string|null} country
 * @returns {boolean}
 */
export function isBadCoord(lat, lng, country) {
  if (lat === null || lng === null) return false;
  if (lat < -90 || lat > 90)   return true;
  if (lng < -180 || lng > 180) return true;
  if (lat === 0 && lng === 0)  return true;
  if (!isCoordPlausible(lat, lng, country)) return true;
  return false;
}
