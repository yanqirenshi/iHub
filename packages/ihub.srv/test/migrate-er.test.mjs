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
