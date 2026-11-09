#!/usr/bin/env node
// ihub-srv … iHub の API サーバーの CLI。
//   ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]  … 起動する
//   ihub-srv check <dir>... [--schemas <dir>]               … データのフォルダを検証する
//   ihub-srv init [dir] [--app] [--force]                   … 雛形から data/ (--app のときは、アプリの src/・public/ など) を作る
//   ihub-srv convert-legacy <src/data> <data> [--force]     … 古い形式のデータ (src/data/*.js) を data/ の JSON に変換する
//   ihub-srv migrate-er <data>                              … ER のデータを、フラット形式から階層形式に変換する
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

import { createApp, serve } from '../src/index.mjs';
import { createValidation } from '../src/validation/index.mjs';
import { convertLegacy } from '../src/tools/convert-legacy-data.mjs';
import { migrateDir } from '../src/tools/migrate-er-hierarchical.mjs';

const USAGE = `使い方:
  ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]
      API サーバーを起動します。(--data の既定は data、--port の既定は環境変数 IHUB_API_PORT か 4000)
      --app-name には、画面の設定の app.name と同じ名前を指定します。(既定は iHub。書き込んだ画面の id を送るヘッダー名 X-{name}-Client に使います)
      --static にビルドした画面のフォルダを指定すると、画面も出します。
      作業フォルダの .env.local があれば、環境変数として読み込みます。(GitHub の OAuth の GITHUB_OAUTH_CLIENT_ID・GITHUB_OAUTH_CLIENT_SECRET など)
  ihub-srv check <dir>... [--schemas <dir>]
      データのフォルダを、スキーマとルールで検証します。問題があれば 1 で終わります。
      --schemas には、アプリが足したスキーマのフォルダを指定します。
  ihub-srv init [dir]
      雛形から、データのフォルダ (既定は data) を作ります。同じ名前のファイルがあるときは、何も書かずに止まります。
  ihub-srv init --app [dir] [--force]
      雛形から、アプリのファイル (src/・public/・.gitignore など。dir の既定は作業フォルダ) を作ります。
      同じ名前のファイルがあるときは、何も書かずに止まります。(--force を付けると上書きします)
      package.json があるときは、足りない項目 (dependencies・scripts・overrides など) だけを足します。(すでにある項目は変えません)
  ihub-srv convert-legacy <古い src/data のフォルダ> <書き出し先の data フォルダ> [--force]
      古い形式のデータ (src/data/*.js) を、data/ の JSON に変換します。(同じ名前のファイルがあるときは、何も書かずに止まります)
  ihub-srv migrate-er <data フォルダ>
      data/er/ を、フラット形式 (columns.json などがある形) から、階層形式に変換します。`;

const OPTIONS = {
    data:    { type: 'string' },
    static:  { type: 'string' },
    'app-name': { type: 'string' },
    port:    { type: 'string' },
    schemas: { type: 'string' },
    app:     { type: 'boolean' },
    force:   { type: 'boolean' },
    help:    { type: 'boolean', short: 'h' },
};

// @yanqirenshi/ihub.core の examples/{sub} (雛形のフォルダ)。
function templateDir (sub) {
    try {
        const core = dirname(createRequire(import.meta.url).resolve('@yanqirenshi/ihub.core/package.json'));
        const dir = join(core, 'examples', sub);

        if (existsSync(dir))
            return dir;
    } catch (e) {
        // 入っていないときは、下のエラーにする。
    }

    throw new Error(`雛形 (examples/${sub}) が見つかりません。@yanqirenshi/ihub.core を入れて、ビルドしてください。`);
}

// dir の下のファイルを、dir からの相対パスで返す。
function listFiles (dir) {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(d=> d.isFile())
        .map(d=> relative(dir, join(d.parentPath, d.name)).split(sep).join('/'));
}

function start (values) {
    // 作業フォルダの .env.local があれば、環境変数に読み込む。(GITHUB_OAUTH_CLIENT_ID など。すでにある環境変数は上書きしない)
    if (existsSync(resolve('.env.local')))
        process.loadEnvFile(resolve('.env.local'));

    const app_name = values['app-name'] ?? 'iHub';
    const static_dir = values.static ? resolve(values.static) : null;
    const data_dir = resolve(values.data ?? 'data');

    if (!existsSync(data_dir)) {
        console.error(`データのフォルダがありません。(${data_dir})\nihub-srv init で雛形から作れます。`);
        return 1;
    }

    if (static_dir && !existsSync(static_dir)) {
        console.error(`画面のフォルダがありません。(${static_dir})\nnpm run build で画面を作ってください。`);
        return 1;
    }

    const app = createApp({
        data_dir,
        static_dir,
        app_name,
        // エディタや git で data/ を変えたときも、画面へ知らせる。
        watch: true,
    });

    serve(app, { port: values.port ? Number(values.port) : undefined, app_name, static_dir });

    return null;
}

function check (dirs, values) {
    if (dirs.length===0) {
        console.error('検証するデータのフォルダを指定してください。\n\n' + USAGE);
        return 1;
    }

    const validation = createValidation({ schemas_dir: values.schemas });
    let failed = false;

    for (const dir of dirs) {
        let errors;

        try {
            errors = validation.validateDataDir(resolve(dir));
        } catch (e) {
            errors = [e.message];
        }

        if (errors.length===0) {
            console.log(`OK: ${dir}`);
            continue;
        }

        failed = true;
        console.error(`NG: ${dir} (${errors.length} 件)`);

        for (const e of errors)
            console.error(`  ${e}`);
    }

    return failed ? 1 : 0;
}

function init (dir) {
    const out = resolve(dir ?? 'data');
    let from;

    try {
        from = templateDir('data');
    } catch (e) {
        console.error(e.message);
        return 1;
    }

    const files = listFiles(from);
    const exists = files.filter(file=> existsSync(join(out, file)));

    if (exists.length > 0) {
        console.error(`${dir ?? 'data'} に同じ名前のファイルがあるため、何も書きませんでした。`);

        for (const file of exists)
            console.error(`  ${file}`);

        return 1;
    }

    mkdirSync(out, { recursive: true });
    cpSync(from, out, { recursive: true });

    console.log(`${files.length} 個のファイルを ${dir ?? 'data'} に作りました。`);

    return 0;
}

// 雛形のファイルの名前を、作るファイルの名前にする。(npm は .gitignore を配布しないので、雛形では、ドット無しの名前にしている)
const APP_RENAMES = { 'gitignore': '.gitignore', 'env.local.template': '.env.local.template' };
// package.json に重ねるときの、雛形のオブジェクトの項目。(無いキーだけを足す)
const PACKAGE_FIELDS = ['dependencies', 'overrides', 'scripts'];

// 作業フォルダの package.json に、雛形の項目を足す。(すでにある項目は変えない)
// 戻り値は、足した項目の説明の配列。
function mergePackageJson (file, template, out) {
    if (!existsSync(file)) {
        const name = basename(out).toLowerCase().replace(/[^a-z0-9-_.]+/g, '-') || 'ihub-app';

        writeFileSync(file, JSON.stringify({ name, ...template }, null, 2) + '\n');

        return ['package.json を作りました'];
    }

    const pkg = JSON.parse(readFileSync(file, 'utf8'));
    const added = [];

    for (const key of PACKAGE_FIELDS) {
        pkg[key] ??= {};

        for (const [name, value] of Object.entries(template[key] || {})) {
            if (!(name in pkg[key])) {
                pkg[key][name] = value;
                added.push(`${key}.${name}`);
            }
        }

        if (Object.keys(pkg[key]).length===0)
            delete pkg[key];
    }

    for (const key of ['eslintConfig', 'browserslist', 'private']) {
        if (!(key in pkg) && key in template) {
            pkg[key] = template[key];
            added.push(key);
        }
    }

    // dependencies は、名前順にそろえる。
    if (pkg.dependencies)
        pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([x], [y])=> x < y ? -1 : 1));

    writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');

    return added;
}

// 雛形のアプリ (src/・public/・.gitignore など) から、アプリのファイルを作る。
function initApp (dir, force) {
    const out = resolve(dir ?? '.');
    let from;

    try {
        from = templateDir('app');
    } catch (e) {
        console.error(e.message);
        return 1;
    }

    if (!existsSync(join(from, 'src')) || !existsSync(join(from, 'public'))) {
        console.error('雛形 (examples/app) に src/・public/ がありません。@yanqirenshi/ihub.core をビルドしてから使ってください。');
        return 1;
    }

    const files = listFiles(from)
        .filter(file=> file!=='package.template.json')
        .map(file=> ({ from: file, to: APP_RENAMES[file] ?? file }));
    const exists = files.filter(f=> existsSync(join(out, f.to)));

    if (exists.length > 0 && !force) {
        console.error('同じ名前のファイルがあるため、何も書きませんでした。上書きするときは --force を付けてください。');

        for (const f of exists.slice(0, 10))
            console.error(`  ${f.to}`);

        if (exists.length > 10)
            console.error(`  ほか ${exists.length - 10} 個`);

        return 1;
    }

    for (const f of files) {
        mkdirSync(dirname(join(out, f.to)), { recursive: true });
        copyFileSync(join(from, f.from), join(out, f.to));
    }

    console.log(`${files.length} 個のファイルを作りました。(${dir ?? '.'})`);

    const template = JSON.parse(readFileSync(join(from, 'package.template.json'), 'utf8'));
    const added = mergePackageJson(join(out, 'package.json'), template, out);

    if (added.length > 0)
        console.log(added[0]==='package.json を作りました' ? added[0] : `package.json に足しました: ${added.join(', ')}`);

    console.log('npm install を実行して、足したパッケージを入れてください。');

    return 0;
}

// 古い形式のデータを、data/ の JSON に変換する。
async function convertLegacyCommand (args, values) {
    if (args.length!==2) {
        console.error('古い src/data のフォルダと、書き出し先の data フォルダを指定してください。\n\n' + USAGE);
        return 1;
    }

    try {
        const n = await convertLegacy(args[0], args[1], { force: values.force });

        console.log(`${n} 個のファイルに変換しました: ${resolve(args[1])}`);
        console.log('ihub-srv check で、フォーマットに合っているかを確かめてください。');

        return 0;
    } catch (e) {
        console.error(e.message);
        return 1;
    }
}

// ER のデータを、フラット形式から階層形式にする。
function migrateEr (args) {
    if (args.length!==1) {
        console.error('data フォルダを指定してください。\n\n' + USAGE);
        return 1;
    }

    try {
        const data = migrateDir(resolve(args[0]));

        console.log(`${args[0]}/er を階層形式にしました。` +
                    ` (identifiers ${data.identifiers.length}, attributes ${data.attributes.length},` +
                    ` entities ${data.entities.length}, relationships ${data.relationships.length}。check: 問題なし)`);

        return 0;
    } catch (e) {
        console.error(e.message);
        return 1;
    }
}

let parsed;

try {
    parsed = parseArgs({ options: OPTIONS, allowPositionals: true });
} catch (e) {
    console.error(`${e.message}\n\n${USAGE}`);
    process.exit(1);
}

const { values, positionals } = parsed;
const [command, ...rest] = positionals;

let code;

if (values.help) {
    console.log(USAGE);
    code = 0;
} else if (command==='check') {
    code = check(rest, values);
} else if (command==='init') {
    code = values.app ? initApp(rest[0], values.force) : init(rest[0]);
} else if (command==='convert-legacy') {
    code = await convertLegacyCommand(rest, values);
} else if (command==='migrate-er') {
    code = migrateEr(rest);
} else if (command) {
    console.error(`コマンドがありません。(${command})\n\n${USAGE}`);
    code = 1;
} else {
    code = start(values);
}

// 起動したときは、サーバーが動き続ける。
if (code!==null)
    process.exit(code);
