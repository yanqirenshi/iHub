import { test } from 'node:test';
import assert from 'node:assert/strict';

import { check } from '@yanqirenshi/model.er';

import { toHierarchical } from '../src/tools/migrate-er-hierarchical.mjs';

// フラット形式の ER。(TABLE 1 つ・識別子と属性の COLUMN が 1 つずつ。TABLE と COLUMN に、アプリが足した項目がある)
const FLAT = {
    entities: [
        {
            _id: 100, _class: 'TABLE', code: 'T_A', name: 'テーブル A', description: '説明',
            position: { x: 10, y: 20, z: 0 }, size: { w: 200, h: 300 },
            color: { base: '#fdba74', inner: '#ffedd5' },
            kind: 'view',
        },
    ],
    columns: [
        { _id: 200, _class: 'COLUMN', code: 'ID', name: 'ID', data_type: 'NUMBER', note: 'メモ' },
        { _id: 201, _class: 'COLUMN', code: 'NAME', name: '名前', data_type: 'TEXT' },
    ],
    column_instances: [
        { _id: 300, _class: 'COLUMN-INSTANCE', code: 'ID', column_type: 'IDENTIFIER' },
        { _id: 301, _class: 'COLUMN-INSTANCE', code: 'NAME', column_type: 'ATTRIBUTE' },
    ],
    ports: [],
    relationships: [
        { _id: 400, from_class: 'TABLE', from_id: 100, to_class: 'COLUMN-INSTANCE', to_id: 300, data_type: 'HAS', hide: false },
        { _id: 401, from_class: 'TABLE', from_id: 100, to_class: 'COLUMN-INSTANCE', to_id: 301, data_type: 'HAS', hide: false },
        { _id: 402, from_class: 'COLUMN', from_id: 200, to_class: 'COLUMN-INSTANCE', to_id: 300, data_type: 'INSTANCE-OF', hide: false },
        { _id: 403, from_class: 'COLUMN', from_id: 201, to_class: 'COLUMN-INSTANCE', to_id: 301, data_type: 'INSTANCE-OF', hide: false },
    ],
};

test('TABLE の決まった項目を entity に写し、写し先の無い項目 (color など) も、そのまま写す', ()=> {
    const { entities } = toHierarchical(FLAT);

    assert.equal(entities.length, 1);

    const [entity] = entities;

    assert.equal(entity.id, 100);
    assert.equal(entity.name, 'テーブル A');
    assert.equal(entity.code, 'T_A');
    assert.equal(entity.description, '説明');
    assert.deepEqual(entity.position, { x: 10, y: 20, z: 0 });
    assert.deepEqual(entity.size, { w: 200, h: 300 });

    // 写し先の無い項目。(_id・_class は、写さない)
    assert.deepEqual(entity.color, { base: '#fdba74', inner: '#ffedd5' });
    assert.equal(entity.kind, 'view');
    assert.ok(!('_id' in entity) && !('_class' in entity));
});

test('COLUMN の決まった項目を identifiers / attributes に写し、写し先の無い項目も、そのまま写す', ()=> {
    const { identifiers, attributes } = toHierarchical(FLAT);

    assert.deepEqual(identifiers, [{ id: 200, name: { logical: 'ID', physical: 'ID' }, data_type: 'NUMBER', note: 'メモ' }]);
    assert.deepEqual(attributes, [{ id: 201, name: { logical: '名前', physical: 'NAME' }, data_type: 'TEXT' }]);
});

test('変換したデータは、model.er の check を通る', ()=> {
    assert.deepEqual(check(toHierarchical(FLAT), 'er/'), []);
});

// ---- インスタンスの名前 (yanqirenshi/iHub#100) ----

// フラット形式の ER を組む。
//   tables: [{ _id, code }]
//   columns: [{ _id, code, name, data_type?, description? }]
//   instances: [{ _id, table, column, ...インスタンスの項目 }]  (column は COLUMN の _id)
function flatOf ({ tables, columns, instances }) {
    return {
        entities: tables.map(t=> ({ _class: 'TABLE', name: t.code, position: { x: 0, y: 0, z: 0 }, size: { w: 100, h: 100 }, ...t })),
        columns: columns.map(c=> ({ _class: 'COLUMN', data_type: 'TEXT', ...c })),
        column_instances: instances.map(({ table, column, ...i })=> ({ _class: 'COLUMN-INSTANCE', column_type: 'ATTRIBUTE', ...i, code: columns.find(c=> c._id===column).code })),
        ports: [],
        relationships: instances.flatMap(({ _id, table, column }, n)=> [
            { _id: 9000 + n * 2, from_class: 'TABLE', from_id: table, to_class: 'COLUMN-INSTANCE', to_id: _id, data_type: 'HAS' },
            { _id: 9001 + n * 2, from_class: 'COLUMN', from_id: column, to_class: 'COLUMN-INSTANCE', to_id: _id, data_type: 'INSTANCE-OF' },
        ]),
    };
}

const attributeOf = (data, entity_id, instance_id)=> {
    const instance = data.entities.find(e=> e.id===entity_id).attributes.find(a=> a.id===instance_id);

    return { instance, master: data.attributes.find(a=> a.id===instance.attribute) };
};

test('インスタンスの名前が COLUMN と同じ (または無い) ときは、COLUMN のマスタ 1 つを指す (これまでと同じ)', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }, { _id: 2, code: 'T2' }],
        columns: [{ _id: 10, code: 'NAME', name: '名前', description: '呼び名' }],
        instances: [
            { _id: 100, table: 1, column: 10 },
            { _id: 101, table: 2, column: 10, logical_name: '名前', physical_name: 'NAME', description: '呼び名' },
        ],
    }));

    assert.deepEqual(data.attributes, [{ id: 10, name: { logical: '名前', physical: 'NAME' }, description: '呼び名', data_type: 'TEXT' }]);
    assert.equal(attributeOf(data, 1, 100).master.id, 10);
    assert.equal(attributeOf(data, 2, 101).master.id, 10);
});

test('インスタンスの名前が COLUMN と違うときは、その名前のマスタを作り、COLUMN の _id を引き継ぐ', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'USER-ID', name: 'ユーザー ID' }],
        instances: [{ _id: 100, table: 1, column: 10, logical_name: 'ユーザー ID', physical_name: 'user_id', description: '外部キー' }],
    }));

    // COLUMN の名前のマスタ (使われていない) は作らない。
    assert.deepEqual(data.attributes, [{ id: 10, name: { logical: 'ユーザー ID', physical: 'user_id' }, description: '外部キー', data_type: 'TEXT' }]);
    assert.equal(attributeOf(data, 1, 100).instance.attribute, 10);
});

test('同じ COLUMN の、同じ違う名前を持つ 2 つのインスタンスは、1 つのマスタを指す', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }, { _id: 2, code: 'T2' }],
        columns: [{ _id: 10, code: 'ID', name: 'ID' }],
        instances: [
            { _id: 100, table: 1, column: 10, physical_name: 'id' },
            { _id: 101, table: 2, column: 10, physical_name: 'id' },
        ],
    }));

    assert.equal(data.attributes.length, 1);
    assert.equal(attributeOf(data, 1, 100).master.id, attributeOf(data, 2, 101).master.id);
    assert.equal(attributeOf(data, 1, 100).master.name.physical, 'id');
});

test('同じ COLUMN を違う名前で 2 回使うテーブル (synapse_relationship の形) は、名前ごとにマスタが分かれる', ()=> {
    const flat = flatOf({
        tables: [{ _id: 1, code: 'SYNAPSE' }, { _id: 7, code: 'SYNAPSE-RELATIONSHIP' }],
        columns: [{ _id: 106, code: 'SYNAPSE-ID', name: 'シナプス ID' }],
        instances: [
            { _id: 1000, table: 1, column: 106, logical_name: 'シナプス ID', physical_name: 'id' },
            { _id: 1032, table: 7, column: 106, logical_name: '元のシナプス ID', physical_name: 'synapse_id_from' },
            { _id: 1033, table: 7, column: 106, logical_name: '先のシナプス ID', physical_name: 'synapse_id_to' },
        ],
    });
    const data = toHierarchical(flat);

    // 名前の組が 3 つ。最初 (インスタンスの _id が小さい) の名前が COLUMN の _id を引き継ぎ、残りは、ER の _id の最大値 (9005) の次から振る。
    assert.deepEqual(data.attributes.map(a=> [a.id, a.name.logical, a.name.physical]), [
        [106, 'シナプス ID', 'id'],
        [9006, '元のシナプス ID', 'synapse_id_from'],
        [9007, '先のシナプス ID', 'synapse_id_to'],
    ]);

    const ids = new Set([...flat.entities, ...flat.columns, ...flat.column_instances, ...flat.relationships].map(d=> d._id));

    for (const a of data.attributes.slice(1))
        assert.ok(!ids.has(a.id), `id ${a.id} が、ER のデータの id と重なっています`);

    assert.equal(attributeOf(data, 7, 1032).master.name.logical, '元のシナプス ID');
    assert.equal(attributeOf(data, 7, 1033).master.name.logical, '先のシナプス ID');
    assert.deepEqual(check(data, 'er/'), []);

    // 何度変換しても、同じ結果になる。
    assert.deepEqual(toHierarchical(flat), data);
});

// ---- 主キー (column_type が ID のデータ・IDENTIFIER のデータ) (yanqirenshi/iHub#106) ----

test('column_type が ID の主キー (iwo.Studio・Bokasafn のデータ) も、identifiers に入る', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'ID', name: 'ID' }, { _id: 11, code: 'NAME', name: '名前' }],
        instances: [
            { _id: 100, table: 1, column: 10, column_type: 'ID' },
            { _id: 101, table: 1, column: 11, column_type: 'ATTRIBUTE' },
        ],
    }));

    assert.deepEqual(data.identifiers.map(d=> d.id), [10]);
    assert.deepEqual(data.attributes.map(d=> d.id), [11]);
    assert.deepEqual(data.entities[0].identifiers, [{ id: 100, identifier: 10 }]);
    assert.deepEqual(data.entities[0].attributes, [{ id: 101, attribute: 11 }]);
    assert.deepEqual(check(data, 'er/'), []);
});

test('ID と IDENTIFIER が混ざったデータは、どちらの主キーも identifiers に入る', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }, { _id: 2, code: 'T2' }],
        columns: [
            { _id: 10, code: 'A-ID', name: 'A' },
            { _id: 11, code: 'B-ID', name: 'B' },
            { _id: 12, code: 'V', name: '値' },
        ],
        instances: [
            { _id: 100, table: 1, column: 10, column_type: 'ID' },
            { _id: 101, table: 2, column: 11, column_type: 'IDENTIFIER' },
            { _id: 102, table: 2, column: 12, column_type: 'ATTRIBUTE' },
            { _id: 103, table: 1, column: 12, column_type: 'TIMESTAMP' },
        ],
    }));

    assert.deepEqual(data.identifiers.map(d=> d.id), [10, 11]);
    assert.deepEqual(data.attributes.map(d=> d.id), [12]);
    assert.deepEqual(data.entities.map(e=> [e.identifiers.length, e.attributes.length]), [[1, 1], [1, 1]]);
    assert.deepEqual(check(data, 'er/'), []);
});

test('主キーでない column_type (ATTRIBUTE・TIMESTAMP・無し) は、attributes に入る', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'A', name: 'a' }, { _id: 11, code: 'B', name: 'b' }, { _id: 12, code: 'C', name: 'c' }],
        instances: [
            { _id: 100, table: 1, column: 10, column_type: 'ATTRIBUTE' },
            { _id: 101, table: 1, column: 11, column_type: 'TIMESTAMP' },
            { _id: 102, table: 1, column: 12, column_type: undefined },
        ],
    }));

    assert.deepEqual(data.identifiers, []);
    assert.equal(data.attributes.length, 3);
});

test('識別子の COLUMN は、名前が違っても、identifiers に入る', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'ID', name: 'ID' }],
        instances: [{ _id: 100, table: 1, column: 10, column_type: 'IDENTIFIER', physical_name: 'id' }],
    }));

    assert.deepEqual(data.attributes, []);
    assert.deepEqual(data.identifiers.map(d=> [d.id, d.name.physical]), [[10, 'id']]);
    assert.equal(data.entities[0].identifiers[0].identifier, 10);
});

test('インスタンスの、写し先の決まっていない項目は、entity の identifiers / attributes の行に、そのまま写す', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'ID', name: 'ID' }],
        instances: [{ _id: 100, table: 1, column: 10, nullable: false, physical_name: 'id', description: '' }],
    }));

    assert.deepEqual(data.entities[0].attributes, [{ id: 100, attribute: 10, nullable: false }]);
});

test('インスタンスの data_type が COLUMN と違うときも、マスタが分かれる', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'V', name: '値', data_type: 'TEXT' }],
        instances: [
            { _id: 100, table: 1, column: 10 },
            { _id: 101, table: 1, column: 10, data_type: 'NUMBER' },
        ],
    }));

    assert.deepEqual(data.attributes.map(a=> [a.id, a.data_type]), [[10, 'TEXT'], [9004, 'NUMBER']]);
});

test('インスタンスが 1 つも無い COLUMN は、COLUMN の名前のマスタを作る', ()=> {
    const data = toHierarchical(flatOf({
        tables: [{ _id: 1, code: 'T1' }],
        columns: [{ _id: 10, code: 'A', name: 'あ' }, { _id: 11, code: 'B', name: 'い' }],
        instances: [{ _id: 100, table: 1, column: 10, physical_name: 'a' }],
    }));

    assert.deepEqual(data.attributes.map(a=> [a.id, a.name.physical]), [[10, 'a'], [11, 'B']]);
});
