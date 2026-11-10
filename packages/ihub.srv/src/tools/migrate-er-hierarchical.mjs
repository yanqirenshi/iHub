// ER 図のデータを、フラット形式から階層形式に変換する。(yanqirenshi/iHub#47)
//
//   フラット形式 (旧): er/{entities,columns,column_instances,ports,relationships}.json
//                      _id / _class を持ち、relationships が TABLE・COLUMN・COLUMN-INSTANCE・PORT を結ぶ
//   階層形式 (新):     er/{schemas,identifiers,attributes,entities,relationships}.json
//                      d3.ter (TM) と同じ形。@yanqirenshi/model.er のレコード
//
// 使い方: ihub-srv migrate-er <data フォルダ>
//   例:   ihub-srv migrate-er data
//
// <data フォルダ>/er/ の 5 つのファイルを読み、階層形式の 5 つのファイルに書き換える。
// (columns.json・column_instances.json・ports.json は消す)
// 写し先の決まっていない項目 (TABLE の color など、アプリが足した項目) は、そのまま entity (COLUMN は identifiers / attributes) に写す。
// 変換したあと、model.er の check で参照の整合を確かめる。(エラーがあれば 1 で終わる)
//
// 変換の規則:
//   COLUMN            → identifiers / attributes
//                       (column_type が IDENTIFIER か ID (主キー) のインスタンスが参照している COLUMN を identifiers に、それ以外を attributes に)
//                       name は { logical: name, physical: code }。
//                       ただし、インスタンスが持つ名前 (logical_name・physical_name・description) と data_type が COLUMN と違うときは、
//                       その名前の組ごとに、別のマスタを作る。(階層形式では、名前はマスタだけが持ち、インスタンスはマスタを指すだけのため)
//                       - 同じ COLUMN の、同じ名前のインスタンスは、1 つのマスタを指す
//                       - COLUMN で最初に現れた名前 (インスタンスの _id の順) のマスタが、COLUMN の _id を引き継ぐ
//                         (どのインスタンスも COLUMN と同じ名前なら、いままでどおり COLUMN の _id・name・code のマスタ 1 つ)
//                       - 2 つ目からの名前のマスタには、ER のデータの中のどの _id とも重ならない id を、_id の順に振る (何度変換しても同じ)
//                       - 識別子 / 属性の振り分けは COLUMN ごと。(同じ COLUMN のマスタは、同じ側に入る)
//                       - インスタンスの、写し先の決まっていない項目 (アプリが足した項目) は、entities[].identifiers[] / attributes[] の行に写す
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
    return convert(flat).data;
}

// 階層形式にして、マスタの数 ({ columns: COLUMN の数, masters: 作ったマスタの数 }) も返す。
export function convert (flat) {
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

    // 識別子 (主キー) として使われている COLUMN。
    // フラット形式では、主キーのインスタンスの column_type が、IDENTIFIER のデータと、ID のデータがある。どちらも識別子にする。
    const IDENTIFIER_TYPES = ['IDENTIFIER', 'ID'];
    const identifier_columns = new Set(
        instances.filter(d=> IDENTIFIER_TYPES.includes(d.column_type)).map(d=> column_of.get(d._id)));

    // フラット形式の項目のうち、階層形式に写し先が決まっているもの。これ以外の項目 (アプリが足した項目) は、そのまま写す。
    const COLUMN_KNOWN = ['_id', '_class', 'code', 'name', 'description', 'data_type'];
    const TABLE_KNOWN = ['_id', '_class', 'code', 'name', 'description', 'position', 'size'];
    const rest = (d, known)=> Object.fromEntries(Object.entries(d).filter(([k])=> !known.includes(k)));

    // インスタンスの項目のうち、マスタか、行の id・参照に写し先が決まっているもの。これ以外の項目 (アプリが足した項目) は、行にそのまま写す。
    const INSTANCE_KNOWN = ['_id', '_class', 'code', 'physical_name', 'logical_name', 'description', 'column_type', 'data_type'];

    const sorted = (list)=> [...list].sort((a, b)=> a._id - b._id);

    // マスタの名前の組。(インスタンスの値が無い・空のときは、COLUMN の値)
    const names_of = (instance, column)=> ({
        logical: instance.logical_name || column.name,
        physical: instance.physical_name || column.code,
        description: instance.description || column.description || '',
        data_type: instance.data_type || column.data_type || '',
    });

    // COLUMN ごとの、名前の組 → マスタの id。(インスタンスの _id の順に、最初に現れた名前が、COLUMN の _id を引き継ぐ)
    const masters_of = new Map(columns.map(c=> [c._id, new Map()]));
    const master_of = new Map();    // インスタンス → マスタの id
    const column_by_id = byId(columns);

    // 2 つ目からの名前のマスタの id。ER のデータの中のどの _id とも重ならない値から、順に振る。
    let next_id = Math.max(0, ...[tables, columns, instances, ports, edges].flat().map(d=> d._id).filter(Number.isFinite)) + 1;

    for (const instance of sorted(instances)) {
        const column = column_by_id.get(column_of.get(instance._id));
        const names = names_of(instance, column);
        const key = JSON.stringify([names.logical, names.physical, names.description, names.data_type]);
        const known = masters_of.get(column._id);

        if (!known.has(key))
            known.set(key, { id: known.size===0 ? column._id : next_id++, names });

        master_of.set(instance._id, known.get(key).id);
    }

    const master = (column, id, names)=> {
        const out = { id, name: { logical: names.logical, physical: names.physical } };

        if (names.description)
            out.description = names.description;

        if (names.data_type)
            out.data_type = names.data_type;

        return { ...out, ...rest(column, COLUMN_KNOWN) };
    };

    // COLUMN ごとのマスタ。(インスタンスが 1 つも無い COLUMN は、COLUMN の名前のマスタ 1 つ)
    const masters_for = (column)=> {
        const known = [...masters_of.get(column._id).values()];

        return known.length > 0
            ? known.map(m=> master(column, m.id, m.names))
            : [master(column, column._id, { logical: column.name, physical: column.code, description: column.description || '', data_type: column.data_type || '' })];
    };

    const identifiers = sorted(columns.filter(c=> identifier_columns.has(c._id))).flatMap(masters_for);
    const attributes = sorted(columns.filter(c=> !identifier_columns.has(c._id))).flatMap(masters_for);

    const entities = tables.map(table=> {
        const mine = sorted(instances.filter(d=> table_of.get(d._id)===table._id));

        return {
            id: table._id,
            name: table.name,
            code: table.code,
            description: table.description ?? '',
            position: table.position,
            size: table.size,
            ...rest(table, TABLE_KNOWN),
            identifiers: mine.filter(d=> identifier_columns.has(column_of.get(d._id)))
                .map(d=> ({ id: d._id, identifier: master_of.get(d._id), ...rest(d, INSTANCE_KNOWN) })),
            attributes: mine.filter(d=> !identifier_columns.has(column_of.get(d._id)))
                .map(d=> ({ id: d._id, attribute: master_of.get(d._id), ...rest(d, INSTANCE_KNOWN) })),
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

    const data = { schemas: [], identifiers, attributes, entities, relationships };

    return { data, stats: { columns: columns.length, masters: identifiers.length + attributes.length } };
}

// 変換した結果の説明。(マスタの数と、名前の違いで増えた数)
export function summary (data, stats) {
    const added = stats.masters - stats.columns;

    return `identifiers ${data.identifiers.length}, attributes ${data.attributes.length},` +
        ` entities ${data.entities.length}, relationships ${data.relationships.length}。` +
        `マスタは、COLUMN から ${stats.columns} 件、名前の違いで増えたもの ${added} 件` +
        ` (COLUMN と名前の違うインスタンスごとに、別のマスタを作ります)`;
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
    const { data, stats } = convert(flat);

    const errors = check(data, 'er/');

    if (errors.length > 0)
        throw new Error('変換したデータに問題があります。\n' + errors.join('\n'));

    for (const name of HIERARCHICAL_FILES)
        writeJson(join(er, `${name}.json`), data[name]);

    for (const name of FLAT_FILES)
        if (!HIERARCHICAL_FILES.includes(name))
            unlinkSync(join(er, `${name}.json`));

    return { data, stats };
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
    const dir = process.argv[2];

    if (!dir) {
        console.error('使い方: ihub-srv migrate-er <data フォルダ>');
        process.exit(1);
    }

    try {
        const { data, stats } = migrateDir(resolve(dir));

        console.log(`${dir}/er を階層形式にしました。 (${summary(data, stats)}。check: 問題なし)`);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
