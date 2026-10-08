const fs = require('fs');
const BT = String.fromCharCode(96);

function audit(file) {
  const c = fs.readFileSync(file, 'utf8');
  const titles = [...c.matchAll(/title:\s*'([^']+?)'/g)].map((m) => m[1]);
  const texts = [...c.matchAll(new RegExp('full_text:\\s*' + BT + '([\\s\\S]*?)' + BT, 'g'))].map((m) => m[1]);
  console.log('\n== ' + file + ' ==');
  console.log('titles:', titles.length, ' texts:', texts.length);
  texts.forEach((t, i) => {
    const words = t.trim().split(/\s+/).length;
    console.log(`  [${i + 1}] ${words}w :: ${titles[i] || '?'} :: ${JSON.stringify(t.trim().slice(0, 110))}`);
  });
}

audit('lib/data/book-of-lies-anthology.ts');
audit('lib/data/book-of-lies-30-tales.ts');
