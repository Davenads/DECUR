const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/documents.json');
const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// -----------------------------------------------------------------------
// 1. NDAA FY2023 - branch off ndaa-fy2023-signed: AARO Formally Established
// -----------------------------------------------------------------------
const ndaa23 = docs.find(d => d.id === 'ndaa-fy2023-uap-provisions');
ndaa23.provenance_chain.push({
  id: 'ndaa-fy2023-aaro-established',
  label: 'AARO Formally Established',
  date: 'July 2023',
  description: 'The All-domain Anomaly Resolution Office officially stands up with statutory mandate, budget authority, and congressional reporting requirements - the most concrete structural consequence of the FY2023 NDAA UAP provisions.',
  type: 'public',
  branches_from: 'ndaa-fy2023-signed'
});

// -----------------------------------------------------------------------
// 2. AARO Historical Record Vol. 1 - branch off aaro-vol1-production: Kirkpatrick Resigns
// -----------------------------------------------------------------------
const aaroVol1 = docs.find(d => d.id === 'aaro-historical-record-vol1');
aaroVol1.provenance_chain.push({
  id: 'aaro-vol1-kirkpatrick-resigns',
  label: 'Kirkpatrick Resigns',
  date: 'December 2023',
  description: 'AARO founding director Dr. Sean Kirkpatrick resigns before the report is published, later writing a Washington Post op-ed suggesting UAP whistleblowers were being leveraged to obstruct legitimate oversight. His departure mid-production is material context for the report.',
  type: 'transfer',
  branches_from: 'aaro-vol1-production'
});

// -----------------------------------------------------------------------
// 3. NASA UAP Study 2023 - branch off nasa-uap-public-release: First UAP Director Appointed
// -----------------------------------------------------------------------
const nasa = docs.find(d => d.id === 'nasa-uap-study-2023');
nasa.provenance_chain.push({
  id: 'nasa-uap-director-appointed',
  label: 'NASA Appoints First UAP Director',
  date: 'September 14, 2023',
  description: 'Simultaneously with the study release, NASA announces Mark McInerney as the agency\'s first dedicated UAP research director - the institutional consequence of the report delivered on the same day as a deliberate NASA policy statement.',
  type: 'public',
  branches_from: 'nasa-uap-public-release'
});

fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
console.log('Batch 2 branch nodes added.');

// Verify
['ndaa-fy2023-uap-provisions', 'aaro-historical-record-vol1', 'nasa-uap-study-2023'].forEach(id => {
  const d = docs.find(x => x.id === id);
  console.log('\n' + id + ':');
  d.provenance_chain.forEach(n => {
    const b = n.branches_from ? ' [BRANCH from: ' + n.branches_from + ']' : '';
    console.log('  ' + n.id + b);
  });
});
