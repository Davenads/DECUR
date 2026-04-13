/**
 * seed-collection.mjs
 * Seeds the "Congressional Disclosure Arc" collection into local Supabase.
 * Run with: node scripts/seed-collection.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.SUPABASE_URL      ?? 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_KEY; // required - set via env var (local: supabase service_role key)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Collection contents ───────────────────────────────────────────────────────

const ITEMS = [
  // Figures
  { type: 'figure',   id: 'luis-elizondo',                  name: 'Luis Elizondo',                        pos: 1  },
  { type: 'figure',   id: 'david-grusch',                   name: 'David Grusch',                         pos: 2  },
  { type: 'figure',   id: 'karl-nell',                      name: 'Karl Nell',                            pos: 3  },
  { type: 'figure',   id: 'chris-mellon',                   name: 'Chris Mellon',                         pos: 4  },
  { type: 'figure',   id: 'ryan-graves',                    name: 'Ryan Graves',                          pos: 5  },
  { type: 'figure',   id: 'jake-barber',                    name: 'Jake Barber',                          pos: 6  },
  // Programs
  { type: 'program',  id: 'aatip',                          name: 'AATIP',                                pos: 7  },
  { type: 'program',  id: 'aawsap',                         name: 'AAWSAP',                               pos: 8  },
  { type: 'program',  id: 'uap-task-force',                 name: 'UAP Task Force',                       pos: 9  },
  { type: 'program',  id: 'aaro',                           name: 'AARO',                                 pos: 10 },
  // Documents
  { type: 'document', id: 'elizondo-resignation-letter-2017', name: 'Elizondo Resignation Letter (2017)', pos: 11 },
  { type: 'document', id: 'uaptf-preliminary-assessment',    name: 'UAPTF Preliminary Assessment (2021)', pos: 12 },
  { type: 'document', id: 'ndaa-fy2023-uap-provisions',      name: 'NDAA FY2023 UAP Provisions',          pos: 13 },
  { type: 'document', id: 'grusch-icig-determination-2023',  name: 'Grusch ICIG Determination (2023)',    pos: 14 },
  // Case
  { type: 'case',     id: 'nimitz-tic-tac',                 name: 'USS Nimitz / Tic Tac Encounter',       pos: 15 },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== DECUR Collection Seed Script ===\n');

  // 1. Create archive user (or fetch if already exists)
  const ARCHIVE_EMAIL = 'archive@decur.org';
  let archiveUserId;

  console.log('Step 1: Resolving archive user...');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existing = users.find(u => u.email === ARCHIVE_EMAIL);

  if (existing) {
    archiveUserId = existing.id;
    console.log(`  Found existing: ${archiveUserId}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ARCHIVE_EMAIL,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { display_name: 'DECUR Archive' },
    });
    if (error) { console.error('  Failed to create user:', error.message); process.exit(1); }
    archiveUserId = data.user.id;
    console.log(`  Created: ${archiveUserId}`);
  }

  // 2. Ensure profile row exists with correct display name
  console.log('Step 2: Upserting profile display name...');
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: archiveUserId, display_name: 'DECUR Archive' }, { onConflict: 'id' });
  if (profileErr) console.warn('  Profile upsert warning:', profileErr.message);
  else console.log('  display_name = "DECUR Archive"');

  // 3. Check if collection already exists
  console.log('Step 3: Checking for existing collection...');
  const { data: existingCol } = await supabase
    .from('collections')
    .select('id')
    .eq('user_id', archiveUserId)
    .eq('slug', 'congressional-disclosure-arc')
    .maybeSingle();

  if (existingCol) {
    console.log(`  Collection already exists (${existingCol.id}). Exiting - delete it first to re-seed.`);
    process.exit(0);
  }

  // 4. Create the collection
  console.log('Step 4: Creating collection...');
  const { data: col, error: colErr } = await supabase
    .from('collections')
    .insert({
      user_id:     archiveUserId,
      title:       'The Congressional Disclosure Arc',
      description: 'How UAP went from classified programs to congressional record. The key figures, programs, documents, and incidents that drove the 2017-2023 disclosure movement.',
      slug:        'congressional-disclosure-arc',
      is_public:   true,
    })
    .select('id')
    .single();
  if (colErr) { console.error('  Failed:', colErr.message); process.exit(1); }
  console.log(`  Collection ID: ${col.id}`);

  // 5. Insert bookmarks
  console.log('Step 5: Inserting bookmarks...');
  const { data: bookmarks, error: bmErr } = await supabase
    .from('bookmarks')
    .insert(ITEMS.map(item => ({
      user_id:      archiveUserId,
      content_type: item.type,
      content_id:   item.id,
      content_name: item.name,
    })))
    .select('id, content_id');
  if (bmErr) { console.error('  Failed:', bmErr.message); process.exit(1); }
  console.log(`  Inserted ${bookmarks.length} bookmarks`);

  // 6. Map bookmark IDs to positions
  const bmMap = Object.fromEntries(bookmarks.map(b => [b.content_id, b.id]));

  // 7. Insert collection_items
  console.log('Step 6: Linking items to collection...');
  const { error: ciErr } = await supabase
    .from('collection_items')
    .insert(ITEMS.map(item => ({
      collection_id: col.id,
      bookmark_id:   bmMap[item.id],
      position:      item.pos,
    })));
  if (ciErr) { console.error('  Failed:', ciErr.message); process.exit(1); }
  console.log(`  Linked ${ITEMS.length} items`);

  console.log('\n=== Done ===');
  console.log(`View at: http://localhost:3000/collections/${col.id}`);
  console.log(`Public collections list: http://localhost:3000/collections`);
}

main().catch(err => { console.error(err); process.exit(1); });
