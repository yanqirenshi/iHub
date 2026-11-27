// manegers/overviewNodeForm.js のテスト。(0.12.0 から。yanqirenshi/iHub#242。node --test で動かす)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { fieldsOf } from '@yanqirenshi/model.unchi';

import {
    NEW_NODE_GAP_X, OVERVIEW_NODE_FIELDS, buildOverviewNodeRecord, initialOverviewNodeForm, newNodePosition,
    validateOverviewNodeForm,
} from '../src/manegers/overviewNodeForm.js';

// 参照アプリの data/overview/nodes.json
const NODES = JSON.parse(readFileSync(fileURLToPath(new URL('../../../data/overview/nodes.json', import.meta.url)), 'utf8'));

test('OVERVIEW_NODE_FIELDS: 見出しは、Overview のインスペクタ (model.unchi の fieldsOf) のラベルと同じ', ()=> {
    const inspector = Object.fromEntries(fieldsOf({ type: 'NODE' }).map(f=> [f.path, f.label]));

    for (const f of OVERVIEW_NODE_FIELDS)
        assert.equal(f.label, inspector[f.path], f.path);
});

test('initialOverviewNodeForm: 幅 160・高さ 80。ほかは空', ()=> {
    assert.deepEqual(initialOverviewNodeForm(), { text: '', w: '160', h: '80', background: '', border: '' });
});

test('validateOverviewNodeForm: 名称は必須。幅と高さは、0 より大きい数', ()=> {
    assert.deepEqual(validateOverviewNodeForm({ ...initialOverviewNodeForm(), text: '  ' }), { text: '名称を入力してください。' });
    assert.deepEqual(validateOverviewNodeForm({ ...initialOverviewNodeForm(), text: 'A' }), {});
    assert.deepEqual(validateOverviewNodeForm({ ...initialOverviewNodeForm(), text: 'A', w: '0', h: 'x' }), {
        w: '幅は、0 より大きい数を入力してください。',
        h: '高さは、0 より大きい数を入力してください。',
    });
    // 空の幅・高さは、誤りにしない (既定の大きさにする)
    assert.deepEqual(validateOverviewNodeForm({ ...initialOverviewNodeForm(), text: 'A', w: '', h: '' }), {});
});

test('newNodePosition: 最上位のノードの右端の最大 + 60、y の最小。ノードが無ければ原点', ()=> {
    assert.deepEqual(newNodePosition([]), { x: 0, y: 0 });
    assert.deepEqual(newNodePosition(undefined), { x: 0, y: 0 });

    // 参照アプリ: iHub (0, 0。子を囲んで幅 460) と Github (560, 60。幅 160) → 右端は 720
    assert.deepEqual(newNodePosition(NODES), { x: 720 + NEW_NODE_GAP_X, y: 0 });
});

test('newNodePosition: 子のノードで広がった親の幅も見る (d3.unchi の fitting)', ()=> {
    const parent = {
        id: 1, size: { w: 100, h: 100 }, padding: 20, position: { x: 0, y: 50 },
        children: [{ id: 2, size: { w: 160, h: 80 }, position: { x: 300, y: 0 } }],
    };

    // 子の右端 460 + padding の 2 倍 40 = 500
    assert.deepEqual(newNodePosition([parent]), { x: 500 + NEW_NODE_GAP_X, y: 50 });
});

test('buildOverviewNodeRecord: 名称だけ。箱の中央に名前、既定の大きさ。空の色は書かない', ()=> {
    const record = buildOverviewNodeRecord({ ...initialOverviewNodeForm(), text: ' 新しいノード ' }, NODES);

    assert.deepEqual(record, {
        type: 'NODE',
        label: { text: '新しいノード', align: 'center', valign: 'middle' },
        size: { w: 160, h: 80 },
        position: { x: 780, y: 0 },
    });

    // 鍵の並び (data/overview/nodes.json のいまのノードに合わせる)
    assert.deepEqual(Object.keys(record), ['type', 'label', 'size', 'position']);
});

test('buildOverviewNodeRecord: すべての項目。数は数に、色はそのまま', ()=> {
    const record = buildOverviewNodeRecord({ text: 'A', w: '200', h: '120', background: '#fff8e1', border: 'orange' }, []);

    assert.deepEqual(record, {
        type: 'NODE',
        label: { text: 'A', align: 'center', valign: 'middle' },
        size: { w: 200, h: 120 },
        position: { x: 0, y: 0 },
        background: { color: '#fff8e1' },
        border: { color: 'orange' },
    });
});

test('buildOverviewNodeRecord: 空の幅・高さは、既定の大きさ (160 × 80)', ()=> {
    assert.deepEqual(buildOverviewNodeRecord({ text: 'A', w: '', h: ' ' }, []).size, { w: 160, h: 80 });
});
