const docs = require('../data/documents.json');
const target = ['aaro-historical-record-vol1','nasa-uap-study-2023','dia-iran-f4-1976','ndaa-fy2023-uap-provisions','blue-book-special-report-14','condon-report-1969','project-sign-estimate-1948','aaro-historical-record-vol2-2024','pentacle-memorandum','hottel-memo','ndaa-fy2024-uap-provisions','dni-annual-report-uap-2024'];
const validTypes = new Set(['creation','classification','transfer','declassification','foia','leak','public','archive']);
let ok = true;
for (const id of target) {
  const doc = docs.find(d => d.id === id);
  if (!doc) { console.log('MISSING DOC:', id); ok = false; continue; }
  if (!doc.provenance_chain || doc.provenance_chain.length === 0) { console.log('NO CHAIN:', id); ok = false; continue; }
  for (const node of doc.provenance_chain) {
    const missing = ['id','label','date','description','type'].filter(f => !node[f]);
    if (missing.length) { console.log('MISSING FIELDS in', id, node.id, missing); ok = false; }
    if (!validTypes.has(node.type)) { console.log('INVALID TYPE in', id, node.id, node.type); ok = false; }
    if (node.description && node.description.length > 200) { console.log('LONG DESC (' + node.description.length + ' chars) in', id, node.id); }
  }
  console.log('OK:', id, '-', doc.provenance_chain.length, 'nodes');
}
if (ok) console.log('\nAll validations passed.');
