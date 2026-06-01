import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIAGRAMS_DIR = path.join(__dirname, '..', 'docs', 'diagrams');
const MMDC = path.join(__dirname, '..', 'node_modules', '.bin', 'mmdc');

const files = fs.readdirSync(DIAGRAMS_DIR).filter((f) => f.endsWith('.mmd'));

console.log(`Génération de ${files.length} diagrammes…`);

for (const file of files) {
  const input = path.join(DIAGRAMS_DIR, file);
  const output = path.join(DIAGRAMS_DIR, file.replace('.mmd', '.png'));
  const cmd = `npx --yes @mermaid-js/mermaid-cli -i "${input}" -o "${output}" -w 1600 -H 900 -b white -q`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log('  OK', file.replace('.mmd', '.png'));
  } catch (err) {
    console.error('  ERREUR', file, err.stderr?.toString() || err.message);
    process.exitCode = 1;
  }
}

console.log('Terminé.');
