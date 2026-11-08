// ER 図のデータを、フラット形式から階層形式に変換する。(yanqirenshi/iHub#47)
//
//   フラット形式 (旧): er/{entities,columns,column_instances,ports,relationships}.json
//                      _id / _class を持ち、relationships が TABLE・COLUMN・COLUMN-INSTANCE・PORT を結ぶ
//   階層形式 (新):     er/{schemas,identifiers,attributes,entities,relationships}.json
//                      d3.ter (TM) と同じ形。@yanqirenshi/model.er のレコード
//
// 使い方: node scripts/migrate-er-hierarchical.mjs <data フォルダ>
//   例:   node scripts/migrate-er-hierarchical.mjs data
//         node scripts/migrate-er-hierarchical.mjs src/ihub/data_example
//
// <data フォルダ>/er/ の 5 つのファイルを読み、階層形式の 5 つのファイルに書き換える。
// (columns.json・column_instances.json・ports.json は消す)
// 変換したあと、model.er の check で参照の整合を確かめる。(エラーがあれば 1 で終わる)
//
// 変換の規則:
//   COLUMN            → identifiers / attributes
//                       (column_type が IDENTIFIER のインスタンスが参照している COLUMN を identifiers に、それ以外を attributes に)
//                       name は { logical: name, physical: code }
//   TABLE             → entities (position / size はそのまま)
//                       identifiers[] / attributes[] は、TABLE→COLUMN-INSTANCE の行と、COLUMN→COLUMN-INSTANCE (INSTANCE-OF) の行から組む
//                       INSTANCE-OF の行が無いインスタンスは、code の同じ COLUMN を参照する
//   PORT + EDGE (PORT→PORT) → relationships
//                       from / to の entity はポートが付いたインスタンスのエンティティ、
//                       cardinality / optionality / position (= degree) はポートから、details[0] はポートが付いたインスタンスの id
//
// iHub をコピーしたアプリ (hub/) のデータも同じ形なので、このスクリプトは残してある。
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { check } from '@yanqirenshi/model.er';

const FLAT_FILES = ['entities', 'columns', 'column_instances', 'ports', 'relationships'];
const HIERARCHICAL_FILES = ['schemas', 'identifiers', 'attributes', 'entities', 'relationships'];

// フラット形式のコレクション ({ entities, columns, column_instances, ports, relationships }) を、階層形式にする。
export function toHierarchical (flat) {
    const { entities: tables, columns, column_instances: instances, ports, relationships: edges } = flat;

    const byId = (list)=> new Map(list.map(d=> [d._id, d]));
    const instance_by_id = byId(instances);
    const port_by_id = byId(ports);

    const is = (edge, from_class, to_class)=> edge.from_class===from_class && edge.to_class===to_class;

    // インスタンス → COLUMN。(INSTANCE-OF の行。無ければ code の同じ COLUMN)
    const column_of = new Map();

    for (const edge of edges)
        if (is(edge, 'COLUMN', 'COLUMN-INSTANCE'))
            column_of.set(edge.to_id, edge.from_id);

    for (const instance of instances) {
        if (column_of.has(instance._id))
            continue;

        const column = columns.find(c=> c.code===instance.code);

        if (!column)
            throw new Error(`column_instances: 参照する COLUMN が見つかりません。(_id=${instance._id}, code=${instance.code})`);

        column_of.set(instance._id, column._id);
    }

    // インスタンス → TABLE。(TABLE→COLUMN-INSTANCE の行)
    const table_of = new Map();

    for (const edge of edges)
        if (is(edge, 'TABLE', 'COLUMN-INSTANCE'))
            table_of.set(edge.to_id, edge.from_id);

    // 識別子として使われている COLUMN。
    const identifier_columns = new Set(
        instances.filter(d=> d.column_type==='IDENTIFIER').map(d=> column_of.get(d._id)));

    const master = (column)=> {
        const out = { id: column._id, name: { logical: column.name, physical: column.code } };

        if (column.description)
            out.description = column.description;

        if (column.data_type)
            out.data_type = column.data_type;

        return out;
    };

    const sorted = (list)=> [...list].sort((a, b)=> a._id - b._id);

    const identifiers = sorted(columns.filter(c=> identifier_columns.has(c._id))).map(master);
    const attributes = sorted(columns.filter(c=> !identifier_columns.has(c._id))).map(master);

    const entities = tables.map(table=> {
        const mine = sorted(instances.filter(d=> table_of.get(d._id)===table._id));

        return {
            id: table._id,
            name: table.name,
            code: table.code,
            description: table.description ?? '',
            position: table.position,
            size: table.size,
            identifiers: mine.filter(d=> identifier_columns.has(column_of.get(d._id)))
                .map(d=> ({ id: d._id, identifier: column_of.get(d._id) })),
            attributes: mine.filter(d=> !identifier_columns.has(column_of.get(d._id)))
                .map(d=> ({ id: d._id, attribute: column_of.get(d._id) })),
        };
    });

    // PORT → それが付いたインスタンス。(COLUMN-INSTANCE→PORT の行)
    const instance_of_port = new Map();

    for (const edge of edges)
        if (edge.from_class==='COLUMN-INSTANCE' && edge.to_class.startsWith('PORT-'))
            instance_of_port.set(edge.to_id, edge.from_id);

    const end = (port_id)=> {
        const port = port_by_id.get(port_id);
        const instance_id = instance_of_port.get(port_id);

        if (!port || instance_id===undefined || !instance_by_id.has(instance_id) || !table_of.has(instance_id))
            throw new Error(`relationships: ポートの付いたインスタンスとテーブルが見つかりません。(port=${port_id})`);

        return {
            end: {
                entity: table_of.get(instance_id),
                cardinality: port.cardinality,
                optionality: port.optionality,
                position: port.degree,
            },
            instance: instance_id,
        };
    };

    const relationships = edges
          .filter(edge=> edge.from_class.startsWith('PORT-') && edge.to_class.startsWith('PORT-'))
          .map(edge=> {
              const from = end(edge.from_id);
              const to = end(edge.to_id);

              const out = {
                  id: edge._id,
                  type: edge.data_type || 'FK',
                  from: from.end,
                  to: to.end,
                  details: [{ from: { id: from.instance }, to: { id: to.instance } }],
              };

              if (edge.hide)
                  out.hide = true;

              return out;
          });

    return { schemas: [], identifiers, attributes, entities, relationships };
}

// API サーバーと同じ書き方 (4 つの空白で字下げし、最後に改行) で書く。
function writeJson (file, data) {
    writeFileSync(file, JSON.stringify(data, null, 4) + '\n');
}

export function migrateDir (dir) {
    const er = join(dir, 'er');

    if (!existsSync(join(er, 'columns.json')))
        throw new Error(`${er}: フラット形式ではありません。(columns.json がありません。変換済みです)`);

    const flat = Object.fromEntries(FLAT_FILES.map(name=> [name, JSON.parse(readFileSync(join(er, `${name}.json`), 'utf8'))]));
    const data = toHierarchical(flat);

    const errors = check(data, 'er/');

    if (errors.length > 0)
        throw new Error('変換したデータに問題があります。\n' + errors.join('\n'));

    for (const name of HIERARCHICAL_FILES)
        writeJson(join(er, `${name}.json`), data[name]);

    for (const name of FLAT_FILES)
        if (!HIERARCHICAL_FILES.includes(name))
            unlinkSync(join(er, `${name}.json`));

    return data;
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
    const dir = process.argv[2];

    if (!dir) {
        console.error('使い方: node scripts/migrate-er-hierarchical.mjs <data フォルダ>');
        process.exit(1);
    }

    try {
        const data = migrateDir(resolve(dir));

        console.log(`${dir}/er を階層形式にしました。` +
                    ` (identifiers ${data.identifiers.length}, attributes ${data.attributes.length},` +
                    ` entities ${data.entities.length}, relationships ${data.relationships.length}。check: 問題なし)`);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
