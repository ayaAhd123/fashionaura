import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(jsx?|json)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk('src')) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  text = text.replace(/placeholder=" /g, 'placeholder="');
  text = text.replace(/placeholder=' /g, "placeholder='");
  text = text.replace(/>( Imprimer| Répondre| Signaler| Rechercher)/g, (_, label) => `>${label.trim()}`);
  if (text !== orig) {
    fs.writeFileSync(file, text);
    changed++;
    console.log('trimmed:', path.relative('src', file));
  }
}
console.log('files trimmed:', changed);
