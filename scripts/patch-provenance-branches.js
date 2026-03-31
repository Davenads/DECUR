const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/documents.json');
const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// -----------------------------------------------------------------------
// 1. Pentagon UAP Videos - add NYT coverage branch off ttsa-release
// -----------------------------------------------------------------------
const pentagon = docs.find(d => d.id === 'pentagon-uap-video-release-2020');
pentagon.provenance_chain.push({
  id: 'nyt-coverage-2017',
  label: 'New York Times Coverage',
  date: 'December 16, 2017',
  description: 'The New York Times publishes "Glowing Auras and Black Money" by Cooper, Blumenthal, and Kean, simultaneously releasing the FLIR1 video. First mainstream coverage forcing an institutional response and public awareness of the footage.',
  type: 'public',
  branches_from: 'ttsa-release'
});

// -----------------------------------------------------------------------
// 2. Grusch ICIG - move DNI Declination to a branch off ICIG Investigation
// Remove it from its current sequential position (index 3), add branches_from
// -----------------------------------------------------------------------
const grusch = docs.find(d => d.id === 'grusch-icig-determination-2023');
// Remove grusch-dni-declination from main chain (index 3)
grusch.provenance_chain = grusch.provenance_chain.filter(n => n.id !== 'grusch-dni-declination');
// Re-add it as a branch node
grusch.provenance_chain.push({
  id: 'grusch-dni-declination',
  label: 'DNI Declination',
  date: 'Spring 2023',
  description: 'Director of National Intelligence declined to forward the complaint to Congress, citing classification concerns - triggering the ICIG\'s independent transmission authority over the DNI\'s objection.',
  type: 'transfer',
  branches_from: 'grusch-icig-investigation'
});

// -----------------------------------------------------------------------
// 3. SOBEPS Belgian Wave - add 2 branch nodes
// Branch 1: Belgian AF radar monitoring off sobeps-initial-reports
// Branch 2: De Brouwer press conference off sobeps-f16-intercept
// -----------------------------------------------------------------------
const sobeps = docs.find(d => d.id === 'sobeps-belgian-ufo-wave-1991');
sobeps.provenance_chain.push({
  id: 'sobeps-baf-monitoring',
  label: 'Belgian Air Force Radar Monitoring',
  date: '1989-1990',
  description: 'Belgian Air Force independently tracks anomalous radar contacts over Belgian airspace during the wave. Military monitoring runs parallel to SOBEPS civilian collection before the formal partnership is established.',
  type: 'classification',
  branches_from: 'sobeps-initial-reports'
});
sobeps.provenance_chain.push({
  id: 'sobeps-debrouwer-presser',
  label: 'Gen. De Brouwer Press Conference',
  date: 'April 1990',
  description: 'Belgian Air Force Chief of Staff General Wilfried De Brouwer holds a public press conference releasing the F-16 radar film and confirming the objects remain unidentified. One of the few instances of a sitting military commander publicly acknowledging anomalous aerial phenomena.',
  type: 'public',
  branches_from: 'sobeps-f16-intercept'
});

// -----------------------------------------------------------------------
// 4. UAP Disclosure Act - add "Provisions Stripped" dead-end branch
// -----------------------------------------------------------------------
const uapAct = docs.find(d => d.id === 'uap-disclosure-act-2023');
uapAct.provenance_chain.push({
  id: 'uap-act-stripped-provisions',
  label: 'Provisions Stripped',
  date: 'December 2023',
  description: 'Conference committee removes the independent Review Board authority and the private contractor material transfer (seizure) provisions - the two provisions most significant for mandatory disclosure from private aerospace programs.',
  type: 'archive',
  branches_from: 'uap-act-conference-weakening'
});

fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
console.log('Done. Provenance branch nodes added to 4 documents.');
