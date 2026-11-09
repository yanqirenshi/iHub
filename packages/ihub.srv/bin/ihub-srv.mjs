#!/usr/bin/env node
// ihub-srv … iHub の API サーバーの CLI。
//   ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]  … 起動する
//   ihub-srv check <dir>... [--schemas <dir>]               … データのフォルダを検証する
//   ihub-srv init [dir]                                     … 雛形から data/ を作る
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

import { createApp, serve } from '../src/index.mjs';
import { createValidation } from '../src/validation/index.mjs';

const USAGE = `使い方:
  ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]
      API サーバーを起動します。(--data の既定は data、--port の既定は環境変数 IHUB_API_PORT か 4000)
      --app-name には、画面の設定の app.name と同じ名前を指定します。(既定は iHub。書き込んだ画面の id を送るヘッダー名 X-{name}-Client に使います)
      --static にビルドした画面のフォルダを指定すると、画面も出します。
  ihub-srv check <dir>... [--schemas <dir>]
      データのフォルダを、スキーマとルールで検証します。問題があれば 1 で終わります。
      --schemas には、アプリが足したスキーマのフォルダを指定します。
  ihub-srv init [dir]
      雛形から、データのフォルダ (既定は data) を作ります。同じ名前のファイルがあるときは、何も書かずに止まります。`;

const OPTIONS = {
    data:    { type: 'string' },
    static:  { type: 'string' },
    'app-name': { type: 'string' },
    port:    { type: 'string' },
    schemas: { type: 'string' },
    help:    { type: 'boolean', short: 'h' },
};

// 雛形のデータのフォルダ。
function templateDir () {
    // @yanqirenshi/ihub.core の examples/data。
    try {
        const core = dirname(createRequire(import.meta.url).resolve('@yanqirenshi/ihub.core/package.json'));
        const dir = join(core, 'examples', 'data');

        if (existsSync(dir))
            return dir;
    } catch (e) {
        // 入っていないときは、下のエラーにする。
    }

    throw new Error('雛形のデータが見つかりません。@yanqirenshi/ihub.core を入れてください。');
}

// dir の下のファイルを、dir からの相対パスで返す。
function listFiles (dir) {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(d=> d.isFile())
        .map(d=> relative(dir, join(d.parentPath, d.name)).split(sep).join('/'));
}

function start (values) {
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
        from = templateDir();
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
    code = init(rest[0]);
} else if (command) {
    console.error(`コマンドがありません。(${command})\n\n${USAGE}`);
    code = 1;
} else {
    code = start(values);
}

// 起動したときは、サーバーが動き続ける。
if (code!==null)
    process.exit(code);
