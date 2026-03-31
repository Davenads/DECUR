const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/documents.json');
const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// -----------------------------------------------------------------------
// 1. Blue Book Special Report 14
// Branch off bb14-battelle-production: USAF misrepresented the 21.5% unknowns
// -----------------------------------------------------------------------
const bb14 = docs.find(d => d.id === 'blue-book-special-report-14');
bb14.provenance_chain.push({
  id: 'bb14-usaf-spin',
  label: 'USAF Press Release Misrepresents Findings',
  date: 'October 1955',
  description: 'USAF issued a press release claiming the report showed only 3% unknowns. The actual Battelle data showed 21.5% unknowns - a statistical misrepresentation that shaped public perception for decades.',
  type: 'public',
  branches_from: 'bb14-battelle-production'
});

// -----------------------------------------------------------------------
// 2. Condon Report
// Branch off condon-low-memo: Saunders and Levine were fired
// -----------------------------------------------------------------------
const condon = docs.find(d => d.id === 'condon-report-1969');
condon.provenance_chain.push({
  id: 'condon-saunders-levine-fired',
  label: 'Saunders and Levine Dismissed',
  date: 'February 1968',
  description: 'Principal investigators David Saunders and Norman Levine were fired after the Low memo leaked. Their dismissal confirmed to critics that the project had been structured to reach a predetermined debunking conclusion.',
  type: 'transfer',
  branches_from: 'condon-low-memo'
});

// -----------------------------------------------------------------------
// 3. Project SIGN Estimate 1948
// Branch off sign-vandenberg-rejection: Project GRUDGE established with debunking mandate
// -----------------------------------------------------------------------
const sign = docs.find(d => d.id === 'project-sign-estimate-1948');
sign.provenance_chain.push({
  id: 'sign-grudge-established',
  label: 'Project GRUDGE Established',
  date: 'February 1949',
  description: 'SIGN was reorganized into Project GRUDGE with an explicit mandate to debunk rather than investigate UAP reports. The name change reflected the institutional reversal triggered by Vandenberg\'s rejection of the ETH conclusion.',
  type: 'creation',
  branches_from: 'sign-vandenberg-rejection'
});

fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
console.log('Batch 1 branch nodes added.');

// Verify
[bb14, condon, sign].forEach(d => {
  console.log('\n' + d.id + ':');
  d.provenance_chain.forEach(n => {
    const b = n.branches_from ? ' [BRANCH from: ' + n.branches_from + ']' : '';
    console.log('  ' + n.id + b);
  });
});
