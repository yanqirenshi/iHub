import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/ihub-srv.mjs', import.meta.url));
const EXAMPLE = fileURLToPath(new URL('../../ihub.core/examples/data/', import.meta.url));

const CORE_PKG = fileURLToPath(new URL('../../ihub.core/package.json', import.meta.url));
const SRV_PKG = fileURLToPath(new URL('../package.json', import.meta.url));
const APP_TEMPLATE = fileURLToPath(new URL('../../ihub.core/examples/app/package.template.json', import.meta.url));

const run = (...args)=> spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8' });
const versionOf = (file)=> JSON.parse(readFileSync(file, 'utf8')).version;

test('雛形の package.template.json の iHub の版は、パッケージの版とそろっている', ()=> {
    const deps = JSON.parse(readFileSync(APP_TEMPLATE, 'utf8')).dependencies;

    assert.equal(versionOf(CORE_PKG), versionOf(SRV_PKG));
    assert.equal(deps['@yanqirenshi/ihub.core'], `^${versionOf(CORE_PKG)}`);
    assert.equal(deps['@yanqirenshi/ihub.srv'], `^${versionOf(SRV_PKG)}`);
});

test('check は、正しいデータで 0、壊れたデータで 1 で終わり、メッセージを出す', ()=> {
    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-'));

    cpSync(EXAMPLE, dir, { recursive: true });
    assert.equal(run('check', dir).status, 0);

    writeFileSync(join(dir, 'er', 'entities.json'), '[{"bad":1}]');

    const result = run('check', dir);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /er\/entities\/0/);
});

test('init は、雛形をコピーし、同じ名前のファイルがあれば何も書かずに 1 で終わる', ()=> {
    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-'));

    assert.equal(run('init', dir).status, 0);
    assert.ok(existsSync(join(dir, 'er', 'entities.json')));
    assert.equal(run('check', dir).status, 0);
    assert.equal(run('init', dir).status, 1);
});

// 雛形のアプリは、@yanqirenshi/ihub.core のビルド (npm run build -w @yanqirenshi/ihub.core) で、参照アプリから作られる。
test('init --app は、アプリのファイルを作り、package.json が無ければ作る', ()=> {
    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-app-'));
    const result = run('init', '--app', dir);

    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(dir, 'src', 'index.js')));
    assert.ok(existsSync(join(dir, 'src', 'config', 'ACCOUNT_MENUS.js')));
    assert.ok(existsSync(join(dir, 'src', 'wbs', 'NotFoundWbsNodeData.js')));

    // 自分で作る部品を置くフォルダ。(中身は README.md だけ)
    for (const sub of ['assemblies', 'pages', 'panels', 'parts'])
        assert.ok(existsSync(join(dir, 'src', 'components', sub, 'README.md')), `src/components/${sub}/`);

    // 自分で作るデータのマネージャを置くフォルダ。(中身は README.md だけ)
    assert.ok(existsSync(join(dir, 'src', 'manegers', 'README.md')));

    assert.ok(existsSync(join(dir, 'public', 'index.html')));
    assert.ok(existsSync(join(dir, '.gitignore')));

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

    assert.equal(pkg.scripts['start:api'], 'ihub-srv --data data');
    assert.equal(pkg.overrides, undefined);

    // iHub のパッケージは、init に使った版にする。(0.x の ^ は、minor が違う版を入れないため)
    assert.equal(pkg.dependencies['@yanqirenshi/ihub.core'], `^${versionOf(CORE_PKG)}`);
    assert.equal(pkg.dependencies['@yanqirenshi/ihub.srv'], `^${versionOf(SRV_PKG)}`);

    // 同じ名前のファイルがあれば、何も書かずに 1 で終わる。--force なら上書きする。
    assert.equal(run('init', '--app', dir).status, 1);
    assert.equal(run('init', '--app', '--force', dir).status, 0);
});

test('init --app は、package.json があれば、足りない項目だけを足す', ()=> {
    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-app-'));

    writeFileSync(join(dir, 'package.json'), JSON.stringify({
        name: 'mine',
        dependencies: { react: '^18.2.0' },
        scripts: { start: 'echo mine' },
    }));

    assert.equal(run('init', '--app', dir).status, 0);

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

    assert.equal(pkg.name, 'mine');
    assert.equal(pkg.scripts.start, 'echo mine');
    assert.equal(pkg.dependencies.react, '^18.2.0');
    assert.equal(pkg.scripts['start:api'], 'ihub-srv --data data');
    assert.ok(pkg.dependencies['react-scripts']);
    assert.equal(pkg.dependencies['@yanqirenshi/ihub.core'], `^${versionOf(CORE_PKG)}`);
});

test('convert-legacy と migrate-er は、引数が足りなければ 1 で終わる', ()=> {
    assert.equal(run('convert-legacy').status, 1);
    assert.equal(run('migrate-er').status, 1);

    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-'));

    cpSync(EXAMPLE, dir, { recursive: true });

    // 階層形式のデータは、変換済みなので、止まる。
    const result = run('migrate-er', dir);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /変換済み/);
});
