import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDataDir, validateData, validateDataDir } from '../src/validation/index.mjs';
import { RULES } from '../src/validation/rules.mjs';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

// data/ と、その雛形の packages/ihub.core/examples/data/ は、同じフォーマット (スキーマ) にそろえる。
for (const dir of ['data', 'packages/ihub.core/examples/data']) {
    test(`${dir} がスキーマとルールに合っている`, ()=> {
        assert.deepEqual(validateDataDir(join(ROOT, dir)), []);
    });
}

test('ファイルの過不足を見つける', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    delete data['er/schemas'];
    data['er/unknown'] = [];

    const errors = validateData(data);

    assert.ok(errors.includes('er/schemas: ファイルがありません。'), errors.join('\n'));
    assert.ok(errors.includes('er/unknown: スキーマがありません。(er/unknown.schema.json を、extensions.schemas_dir のフォルダに作ってください)'), errors.join('\n'));
});

test('スキーマに無い項目を見つける', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['wbs/projects'].push({ id: 999999, name: 'X', parnet: 1 });

    const errors = validateData(data);

    assert.ok(errors.some(e=> e.startsWith('wbs/projects/') && e.endsWith('(parnet)')), errors.join('\n'));
});

test('システム構成図のノードの link は、url を文字列で持つ', ()=> {
    // スキーマは @yanqirenshi/model.deployment のもの。(additionalProperties は閉じていない)
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['deployment/nodes'][0].link = { url: 'https://example.com/' };

    assert.deepEqual(validateData(data), []);

    // url の無い link と null の link は通る。(d3.deployment は描かない)
    data['deployment/nodes'][0].link = {};
    data['deployment/nodes'][1].link = null;

    assert.deepEqual(validateData(data), []);

    data['deployment/nodes'][0].link = { url: 1 };

    const errors = validateData(data);

    assert.equal(errors.length, 1);
    assert.ok(errors[0].startsWith('deployment/nodes/0/link/url: '), errors[0]);
});

test('Overview のノードは、id に文字列も使え、d3.unchi の見た目の項目を書ける', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['overview/nodes'].push({ id: 'note-1', type: 'TEXT', text: ['メモ'], bullet: true, size: { w: 200 }, position: { x: 0, y: 300 } });
    data['overview/edges'].push({ id: 101, from: { id: 'note-1' }, to: { id: 2 }, to_marker: 'triangle', stroke: { color: '#888888' } });

    assert.deepEqual(validateData(data), []);

    // スキーマに合わないもの (位置が数でない・マーカーの種類が無い)
    const broken = structuredClone(data);

    broken['overview/nodes'][0].children[0].position = { x: '0', y: 20 };
    broken['overview/edges'][1].to_marker = 'arrows';

    assert.deepEqual(validateData(broken), [
        'overview/edges/1/to_marker: 事前に定義された値のいずれかに等しくなければいけない (none, arrow, triangle, triangle-open, circle, circle-open, diamond, diamond-open)',
        'overview/nodes/0/children/0/position/x: numberでなければいけない',
    ]);

    // 線の端点のノードが無いもの
    data['overview/edges'][1].to.id = 'missing';

    assert.deepEqual(validateData(data), [
        'overview/edges: to.id のノードが見つかりません。(id=101, to.id=missing)',
    ]);
});

test('個人の設定 (local) は、無くてもよいが、あればスキーマで検証する', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    assert.deepEqual(validateData(data), []);

    data['local/account_menus'] = { iHub: { markets: 'off' } };

    assert.deepEqual(validateData(data), ['local/account_menus/iHub/markets: booleanでなければいけない']);
});

test('WBS の id の重複と、parent の無いノードを見つける', ()=> {
    const errors = RULES.wbs({
        projects:     [{ id: 1, name: 'P' }],
        wbs:          [{ id: 10, parent: 1, name: 'A' }, { id: 10, parent: 99, name: 'B' }],
        workpackages: [{ id: 20, parent: 1, name: 'W' }],
    });

    assert.deepEqual(errors, [
        'wbs: id が重複しています。(id=10)',
        'wbs/wbs: parent のプロジェクトか WBS が見つかりません。(id=10, parent=99)',
        'wbs/workpackages: parent の WBS が見つかりません。(id=20, parent=1)',
    ]);
});

test('TM の relationships で、エンティティの参照が欠けているものを見つける', ()=> {
    // 233fe72 で直した不具合 (relationships の entity の参照が欠けて、TM の画面が落ちた) と同じ形。
    const entity = (id, identifier_id)=> ({
        id, type: 'RESOURCE', name: `E${id}`,
        position: { x: 0, y: 0 }, size: { w: 0, h: 0 },
        identifiers: [{ id: identifier_id, identifier: 10000 }],
        attributes: [],
    });

    const errors = RULES.tm({
        identifiers:   [{ id: 10000, name: 'id' }],
        attributes:    [],
        entities:      [entity(30000, 40000), entity(30001, 40001)],
        relationships: [
            { id: 1, from: { id: 40000, entity: 30000 }, to: { id: 40001, entity: 30001 } },
            { id: 2, from: { id: 40000, entity: 39999 }, to: { id: 40000, entity: 30001 } },
        ],
    });

    assert.deepEqual(errors, [
        'tm/relationships: from.entity のエンティティが見つかりません。(id=2, entity=39999)',
        'tm/relationships: to.id がエンティティの識別子に見つかりません。(id=2, entity=30001, to.id=40000)',
    ]);
});

test('ER で、参照の見つからないものを見つける', ()=> {
    // 階層形式 (d3.ter と同じ)。検査は @yanqirenshi/model.er の check。
    const errors = RULES.er({
        schemas:       [],
        identifiers:   [{ id: 10000, name: { logical: 'ID', physical: 'id' } }],
        attributes:    [],
        entities:      [{ id: 1, name: 'A', position: { x: 0, y: 0 }, size: { w: 0, h: 0 },
                          identifiers: [{ id: 100, identifier: 10000 }, { id: 101, identifier: 10001 }], attributes: [] }],
        relationships: [{ id: 10, from: { entity: 1 }, to: { entity: 2 }, details: [{ from: { id: 100 }, to: { id: 100 } }] }],
    });

    assert.deepEqual(errors, [
        'er/entities: identifier が identifiers に見つかりません。(entity=1, id=101, identifier=10001)',
        'er/relationships: to.entity のエンティティが見つかりません。(id=10, to.entity=2)',
    ]);
});

test('図の線で、ノードの見つからないものを見つける', ()=> {
    const errors = RULES.deployment({
        nodes: [{ id: 1, children: [{ id: 2, children: [] }] }],
        edges: [{ id: 100, from: { id: 2 }, to: { id: 3 } }],
    });

    assert.deepEqual(errors, [
        'deployment/edges: to.id のノードが見つかりません。(id=100, to.id=3)',
    ]);
});
