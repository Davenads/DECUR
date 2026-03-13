const data = JSON.parse(require('fs').readFileSync('./data/ufotimeline.json'));
const byDecade = {};
data.forEach(e => {
  if (!e.year) return;
  const d = Math.floor(e.year/10)*10+'s';
  byDecade[d] = (byDecade[d]||0)+1;
});
const sorted = Object.keys(byDecade).sort();
sorted.forEach(d => console.log(d + ':', byDecade[d]));
console.log('Total:', data.length);
