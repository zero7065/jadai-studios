const fs = require('fs');

for (const f of ['lib/data/book-of-lies-anthology.ts', 'lib/data/book-of-lies-30-tales.ts']) {
  const c = fs.readFileSync(f, 'utf8');
  console.log('\n== ' + f + ' ==');
  // chapter comments
  const commentMatches = [...c.matchAll(/\/\/ --- ([^-]+?) ---/g)];
  commentMatches.forEach((m) => console.log('  // ' + m[1].trim()));
  const slugs = [...c.matchAll(/slug: '([^']+)'[\s\S]{0,400}?sin_category: '([^']+)'[\s\S]{0,200}?act: (\d)/g)];
  [...c.matchAll(/id: '(bol-\d+)',\s*\n\s*slug: '([^']+)'/g)].forEach((m, i) => {
    const seg = c.slice(m.index, m.index + 700);
    const sin = (seg.match(/sin_category: '([^']+)'/) || [])[1];
    const act = (seg.match(/act: (\d)/) || [])[1];
    const title = (seg.match(/title: '([^']+)'/) || [])[1];
    console.log(`${m[1]} a${act} ${sin} :: ${m[2]} :: ${title}`);
  });
}
