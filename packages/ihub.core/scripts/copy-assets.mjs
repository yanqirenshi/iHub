// Babel が変換しないファイルを、dist/ と examples/app/ に用意する。
//
// 1. CSS を、src/ から dist/ へ、同じ相対パスでコピーする。(README.md などの文書は、配布しない)
// 2. 雛形のアプリ (examples/app/) の src/ と public/ を、リポジトリのルートの参照アプリから作る。
//    参照アプリがそのまま雛形になるので、雛形だけが古くなることはない。(examples/app/src と examples/app/public は git に入れない)
//    `ihub-srv init --app` が、これをコピーする。
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
const APP = join(ROOT, 'examples', 'app');
// 参照アプリ (リポジトリのルート)
const REF = join(ROOT, '..', '..');

// 1. CSS
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

// 2. 雛形のアプリ
// 参照アプリの src/ のうち、アプリに固有のもの。(service worker と setupTests は、CRA の雛形のものなので、入れない)
const REF_SRC = [
    'index.js', 'index.css', 'Router.js', 'setupProxy.js',
    'config', 'operators', 'wbs',
    'js/serviceWorkerRegistration.js', 'js/reportWebVitals.js',
];

if (existsSync(join(REF, 'src', 'index.js')) && existsSync(join(REF, 'public'))) {
    rmSync(join(APP, 'src'), { recursive: true, force: true });
    rmSync(join(APP, 'public'), { recursive: true, force: true });

    for (const rel of REF_SRC)
        cpSync(join(REF, 'src', rel), join(APP, 'src', rel), { recursive: true });

    cpSync(join(REF, 'public'), join(APP, 'public'), { recursive: true });

    console.log('Prepared examples/app (src, public) from the reference app.');
} else if (!existsSync(join(APP, 'src'))) {
    console.warn('The reference app was not found; examples/app/src was not prepared.');
}
