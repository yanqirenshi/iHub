// Babel が変換しないファイル (CSS) を、src/ から dist/ へ、同じ相対パスでコピーする。
// (README.md などの文書は、配布しない)
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

let count = 0;

for (const d of readdirSync(SRC, { recursive: true, withFileTypes: true })) {
    if (!d.isFile() || !d.name.endsWith('.css'))
        continue;

    const from = join(d.parentPath, d.name);
    const to = join(DIST, relative(SRC, from));

    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
    count++;
}

console.log(`Copied ${count} CSS file(s) to dist.`);
