// manegers/tmTables.js のテスト。(0.12.0 から。node --test で動かす)
// tmTables.js は、ほかのファイルを読み込まない、ただの関数なので、src をそのまま読む。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { entityRows, nameText, relationshipRows, subsetText } from '../src/manegers/tmTables.js';

// 参照アプリの data/tm/ (エンティティ 3・結線 2。識別子・属性のマスタは、エンティティの識別子・属性の名前に使う)
const DATA = fileURLToPath(new URL('../../../data/tm/', import.meta.url));
const read = (name)=> JSON.parse(readFileSync(`${DATA}${name}.json`, 'utf8'));
const REFERENCE = {
    'tm/entities': read('entities'),
    'tm/identifiers': read('identifiers'),
    'tm/attributes': read('attributes'),
    'tm/relationships': read('relationships'),
};

test('nameText: 文字列はそのまま、論理名と物理名の組は「論理名 (物理名)」', ()=> {
    assert.equal(nameText('顧客'), '顧客');
    assert.equal(nameText({ logical: '顧客', physical: 'customer' }), '顧客 (customer)');
    assert.equal(nameText({ logical: '顧客' }), '顧客');
    assert.equal(nameText({ physical: 'customer' }), 'customer');
    assert.equal(nameText({ logical: 'id', physical: 'id' }), 'id');
    assert.equal(nameText(undefined), '');
    assert.equal(nameText(null), '');
    assert.equal(nameText({}), '');
    assert.equal(nameText(3), '');
});

test('参照アプリの data/tm/ の件数のまま、ファイルの順で行を作る', ()=> {
    assert.deepEqual(entityRows(REFERENCE).map(d=> d.id), REFERENCE['tm/entities'].map(d=> String(d.id)));
    assert.deepEqual(relationshipRows(REFERENCE).map(d=> d.id), REFERENCE['tm/relationships'].map(d=> String(d.id)));

    assert.equal(entityRows(REFERENCE).length, 3);
    assert.equal(relationshipRows(REFERENCE).length, 2);
});

const COLLECTIONS = {
    'tm/entities': [
        {
            id: 1, type: 'RESOURCE', name: { logical: '顧客', physical: 'customer' }, description: '買う人',
            position: { x: 0, y: 0 }, size: { w: 0, h: 0 },
            identifiers: [{ id: 101, identifier: 10 }],
            attributes: [{ id: 102, attribute: 20 }, { id: 103, attribute: 21, name: '別名' }, { id: 104, attribute: 99 }],
        },
        {
            id: 2, type: 'EVENT', name: '注文',
            identifiers: [{ id: 201, identifier: 11 }, { id: 202, identifier: 10 }],
            attributes: [{ id: 203, attribute: 20 }, { id: 204, attribute: 20 }],
        },
    ],
    'tm/identifiers': [
        { id: 10, name: '顧客番号', description: '' },
        { id: 11, name: { logical: '注文番号', physical: 'order_no' } },
    ],
    'tm/attributes': [
        { id: 20, name: '名前', description: '氏名' },
        { id: 21, name: '住所' },
        { id: 22, name: '使われない属性' },
    ],
    'tm/relationships': [
        { id: 1, type: 'RE', from: { id: 101, entity: 1 }, to: { id: 202, entity: 2 }, label: '注文する', description: '説明' },
        { id: 2, from: { entity: 2 }, to: { entity: 9 }, subset: { kind: 'same', code: 'A' } },
    ],
};

test('entityRows: 識別子・属性は名前で出す (行の name、無ければマスタの名前、マスタが無ければ id)', ()=> {
    assert.deepEqual(entityRows(COLLECTIONS), [
        {
            id: '1', type: 'RESOURCE', name: '顧客 (customer)',
            identifiers: ['顧客番号'],
            attributes: ['名前', '別名', '99'],
            description: '買う人',
        },
        {
            id: '2', type: 'EVENT', name: '注文',
            identifiers: ['注文番号 (order_no)', '顧客番号'],
            attributes: ['名前', '名前'],
            description: '',
        },
    ]);
});

test('relationshipRows: 接続元・接続先は名前で出す (エンティティが無ければ id)。サブセットは「区分・区分コード」', ()=> {
    assert.deepEqual(relationshipRows(COLLECTIONS), [
        { id: '1', type: 'RE', from: '顧客 (customer)', to: '注文', label: '注文する', subset: '', description: '説明' },
        { id: '2', type: '', from: '注文', to: '9', label: '', subset: 'same・A', description: '' },
    ]);
});

test('subsetText: 区分と区分コード。片方だけ・無いときも落ちない', ()=> {
    assert.equal(subsetText({ kind: 'different', code: 'B' }), 'different・B');
    assert.equal(subsetText({ kind: 'same' }), 'same');
    assert.equal(subsetText(null), '');
    assert.equal(subsetText(undefined), '');
});

test('ファイルが無い・空・形が違うときは、行が無い (落ちない)', ()=> {
    for (const collections of [undefined, null, {}, { 'tm/entities': null, 'tm/relationships': {} }]) {
        assert.deepEqual(entityRows(collections), []);
        assert.deepEqual(relationshipRows(collections), []);
    }

    // 指す先のファイルだけが無いとき: 名前の代わりに id を出す
    const only = { 'tm/entities': [{ id: 1, name: 'E', identifiers: [{ id: 2, identifier: 5 }] }], 'tm/relationships': [{ id: 3, from: { entity: 1 }, to: { entity: 4 } }] };

    assert.deepEqual(entityRows(only)[0].identifiers, ['5']);
    assert.deepEqual(relationshipRows(only)[0], { id: '3', type: '', from: 'E', to: '4', label: '', subset: '', description: '' });
});
