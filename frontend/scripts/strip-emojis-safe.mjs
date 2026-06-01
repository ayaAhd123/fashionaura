import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const frontendRoot = process.cwd();
const srcRoot = path.join(frontendRoot, 'src');
const emojiRe = /(\p{Regional_Indicator}{2})|(\p{Extended_Pictographic}\uFE0F?)/gu;

function stripEmojis(text) {
  return text.replace(emojiRe, '');
}

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(jsx?|tsx?|json)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(srcRoot)) {
  const relFromRepo = `frontend/${path.relative(frontendRoot, file).replace(/\\/g, '/')}`;
  const current = fs.readFileSync(file, 'utf8');
  const next = stripEmojis(current);
  if (next !== current) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('updated:', path.relative(srcRoot, file));
  }
}

console.log('files changed:', changed);
