// data フォルダ (src/data/ など) を、JSON Schema とドメインごとのルールで検証する。
// コレクションは server/schemas/{domain}/{collection}.schema.json と
// data フォルダの {domain}/{collection}.json の組で、スキーマのファイルから一覧を作る。
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import localize from 'ajv-i18n';

import { RULES } from './rules.mjs';

const SCHEMAS_DIR = fileURLToPath(new URL('../schemas/', import.meta.url));

// dir の下で suffix で終わるファイルを、dir からの相対パス (区切りは /) で返す。
function listFiles (dir, suffix) {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(d=> d.isFile() && d.name.endsWith(suffix))
        .map(d=> relative(dir, join(d.parentPath, d.name)).split(sep).join('/'))
        .sort();
}

export const COLLECTIONS = listFiles(SCHEMAS_DIR, '.schema.json').map(file=> {
    const name = file.slice(0, -'.schema.json'.length);
    const [domain, collection] = name.split('/');

    return {
        name,
        domain,
        collection,
        schema: JSON.parse(readFileSync(join(SCHEMAS_DIR, file), 'utf8')),
    };
});

const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });

const VALIDATORS = Object.fromEntries(COLLECTIONS.map(c=> [c.name, ajv.compile(c.schema)]));

function formatError (name, error) {
    const params = error.params || {};

    let detail = '';
    if (params.additionalProperty) detail = ` (${params.additionalProperty})`;
    if (params.allowedValues)      detail = ` (${params.allowedValues.join(', ')})`;

    return `${name}${error.instancePath}: ${error.message}${detail}`;
}

// data フォルダの JSON を読み込む。戻り値は { 'er/entities': [...], ... }。
export function loadDataDir (dir) {
    return Object.fromEntries(listFiles(dir, '.json').map(file=> {
        const name = file.slice(0, -'.json'.length);

        try {
            return [name, JSON.parse(readFileSync(join(dir, file), 'utf8'))];
        } catch (e) {
            throw new Error(`${name}: JSON として読めません。${e.message}`);
        }
    }));
}

// 読み込んだデータを検証する。戻り値はエラーのメッセージの配列。(空ならエラーなし)
export function validateData (data) {
    const errors = [];
    const invalid = new Set();

    for (const c of COLLECTIONS) {
        if (!(c.name in data)) {
            errors.push(`${c.name}: ファイルがありません。`);
            invalid.add(c.name);
            continue;
        }

        const validate = VALIDATORS[c.name];

        if (!validate(data[c.name])) {
            localize.ja(validate.errors);
            errors.push(...validate.errors.map(e=> formatError(c.name, e)));
            invalid.add(c.name);
        }
    }

    for (const name of Object.keys(data))
        if (!COLLECTIONS.some(c=> c.name===name))
            errors.push(`${name}: スキーマがありません。(server/schemas/${name}.schema.json を作ってください)`);

    // ルールは、コレクションがそろっていてスキーマに合っているドメインだけを検査する。
    for (const [domain, check] of Object.entries(RULES)) {
        const collections = COLLECTIONS.filter(c=> c.domain===domain);

        if (collections.some(c=> invalid.has(c.name)))
            continue;

        errors.push(...check(Object.fromEntries(collections.map(c=> [c.collection, data[c.name]]))));
    }

    return errors;
}

export function validateDataDir (dir) {
    return validateData(loadDataDir(dir));
}
