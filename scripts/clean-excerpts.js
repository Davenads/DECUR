const fs = require('fs');
const entries = JSON.parse(fs.readFileSync('C:/Projects/DECUR/data/ufotimeline.json'));

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

let fixed = 0;
const cleaned = entries.map(e => {
  const cleanExcerpt = stripHtml(e.excerpt);
  if (cleanExcerpt !== e.excerpt) fixed++;
  return { ...e, excerpt: cleanExcerpt };
});

fs.writeFileSync('C:/Projects/DECUR/data/ufotimeline.json', JSON.stringify(cleaned, null, 2));
console.log('Fixed', fixed, 'excerpts with HTML tags');
const sample = cleaned.find(e => e.source === 'openminds');
console.log('Sample openminds excerpt:', sample && sample.excerpt.slice(0, 120));
