// 古い形式のデータ (src/data/*.js) を、新しい形式 (data/{domain}/{collection}.json) に変換する。
// iHub をコピーしたアプリを、データが src/data/*.js だったころ (yanqirenshi/iHub#21 より前) から移すときに使う。
//
// 使い方: ihub-srv convert-legacy <古い src/data のフォルダ> <書き出し先の data フォルダ> [--force]
// 例:     npx ihub-srv convert-legacy src/data data
//
// 書き出し先に同じ名前のファイルがあるときは、何も書かずに止める。(--force を付けると上書きする)
// src/data/ の ACCOUNT_MENUS.js・ICONS.js・OPERATOR_ITEMS.js は変換しない。(src/config/ に移す)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { toHierarchical } from './migrate-er-hierarchical.mjs';

// システム構成図のノード: id を先頭に並べ、値の無い link (null) は書かない。
function deploymentNode (d) {
    const { id, children, link, ...rest } = d;
    const o = { id, ...rest };
    if (link) o.link = link;
    if (children) o.children = children.map(deploymentNode);
    return o;
}

// 古い形式のデータを変換して、書き出す。
// 書き出し先に同じ名前のファイルがあるときは、何も書かずに Error を投げる。(force なら上書きする)
// 戻り値は、書き出したファイルの数。
export async function convertLegacy (src_dir, out_dir, { force = false } = {}) {
    const src = resolve(src_dir);
    const out = resolve(out_dir);

    const load = async (rel)=> (await import(pathToFileURL(join(src, rel)).href)).default;

    const tm = await load('TM.js');

    // 書き出すファイルと、その中身。
    const files = {
        'deployment/nodes.json': (await load('DEPLOYMENT_MANAGE_OVERVIEW_NODE_DATA.js')).map(deploymentNode),
        'deployment/edges.json': await load('DEPLOYMENT_MANAGE_OVERVIEW_EDGE_DATA.js'),

        // ER 図は、古い形式 (フラット形式) を読み、階層形式 (@yanqirenshi/model.er のレコード) にして書く。
        ...Object.fromEntries(Object.entries(toHierarchical({
            entities: (await load('ER_DATA/ENTITIES.js')).map(d=> ({
                _id: d._id, code: d.code, name: d.name, description: d.description, _class: d._class,
                position: { x: d.x, y: d.y, z: d.z }, size: { w: d.w, h: d.h },
            })),
            columns:          await load('ER_DATA/COLUMNS.js'),
            column_instances: await load('ER_DATA/COLUMN_INSTANCES.js'),
            ports:            await load('ER_DATA/PORTS.js'),
            relationships:    await load('ER_DATA/RELASHONSHIPS.js'),
        })).map(([name, data])=> [`er/${name}.json`, data])),

        // 画面のノードは配列にし、画面の遷移には id を振る。
        'sitemap/nodes.json': Object.values(await load('SITEMAP_DATA/SITEMAP_DATA_NODES.js')),
        'sitemap/edges.json': (await load('SITEMAP_DATA/SITEMAP_DATA_EDGES.js')).map((d, i)=> ({ id: 2000001 + i, ...d })),

        'systemic_design/sections.json': await load('systemic_design/DATA.js'),

        'tm/identifiers.json':   tm.identifiers,
        'tm/attributes.json':    tm.attributes,
        'tm/entities.json':      tm.entities,
        'tm/relationships.json': tm.relationships,

        // ワークパッケージの _class は、画面が読み込むときに付ける。
        'wbs/projects.json':     await load('WBS/PROJECTS.js'),
        'wbs/wbs.json':          await load('WBS/WBS.js'),
        'wbs/workpackages.json': (await load('WBS/WORKPACKAGES.js')).map(({ _class, ...d })=> d),
    };

    const exists = Object.keys(files).filter(rel=> existsSync(join(out, rel)));

    if (exists.length > 0 && !force)
        throw new Error('書き出し先に、同じ名前のファイルがあります。上書きするときは --force を付けてください。\n' +
                        exists.map(rel=> '  ' + join(out, rel)).join('\n'));

    // API サーバーと同じ書き方 (4 つの空白で字下げし、最後に改行) で書く。
    for (const [rel, data] of Object.entries(files)) {
        const file = join(out, rel);

        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, JSON.stringify(data, null, 4) + '\n', 'utf8');
    }


    return Object.keys(files).length;
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2).filter(a=> a!=='--force');

    if (args.length!==2) {
        console.error('使い方: ihub-srv convert-legacy <古い src/data のフォルダ> <書き出し先の data フォルダ> [--force]');
        process.exit(1);
    }

    try {
        const n = await convertLegacy(args[0], args[1], { force: process.argv.includes('--force') });

        console.log(`${n} 個のファイルに変換しました: ${resolve(args[1])}`);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
