// manegers/dockOperators.js のテスト。(0.12.0 から。yanqirenshi/iHub#242。node --test で動かす)
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    DOCK_OPERATOR_PREFIX, addDockOperator, closeDockOperator, dockOperatorCode, isDockOperatorCode,
    removeDockOperator, withoutDockIcons,
} from '../src/manegers/dockOperators.js';

// 並べ終えた (initialized の入った) ドック。アプリの丸 a・b・c
const appOperator = (code)=> ({
    code,
    label: { type: 'icon', code: code==='c' ? 'menu' : 'github', val: code },
    size: { w: 55, h: 55 },
    position: { x: 100, y: 900 },
    border: { w: 3 },
    branch: {},
});
const DOCK = { initialized: 1700000000000, active: null, list: ['a', 'b', 'c'].map(appOperator) };

const CODE = dockOperatorCode('overview');

test('dockOperatorCode: アプリの丸と重ならない頭を付ける', ()=> {
    assert.equal(CODE, `${DOCK_OPERATOR_PREFIX}overview`);
    assert.equal(isDockOperatorCode(CODE), true);
    assert.equal(isDockOperatorCode('a'), false);
});

test('addDockOperator: 右端に足し、並べ直させる (initialized を偽に)', ()=> {
    const next = addDockOperator(DOCK, { code: CODE, label: '要素の追加' });

    assert.deepEqual(next.list.map(o=> o.code), ['a', 'b', 'c', CODE]);
    assert.equal(next.initialized, false);
    assert.deepEqual(next.list[3], {
        code: CODE,
        label: { type: 'icon', code: CODE, val: '要素の追加' },
        size: { w: 55, h: 55 },
        position: { x: null, y: null },
        border: { w: 3 },
        branch: {},
    });

    // もとの state は変えない (Immer が凍らせるため)
    assert.equal(DOCK.list.length, 3);
});

test('addDockOperator: 同じ code は、2 度足さない', ()=> {
    const once = addDockOperator(DOCK, { code: CODE, label: '要素の追加' });

    assert.equal(addDockOperator(once, { code: CODE, label: '要素の追加' }), once);
});

test('removeDockOperator: 丸を消し、並べ直させる。選んでいたときは、選択も外す', ()=> {
    const added = addDockOperator(DOCK, { code: CODE, label: '要素の追加' });

    const removed = removeDockOperator({ ...added, initialized: 1, active: CODE }, CODE);

    assert.deepEqual(removed.list.map(o=> o.code), ['a', 'b', 'c']);
    assert.equal(removed.initialized, false);
    assert.equal(removed.active, null);

    // ほかの丸を選んでいたときは、そのまま
    assert.equal(removeDockOperator({ ...added, active: 'b' }, CODE).active, 'b');

    // 無い code のときは、何もしない
    assert.equal(removeDockOperator(DOCK, CODE), DOCK);
});

test('closeDockOperator: 吹き出しを閉じる', ()=> {
    assert.equal(closeDockOperator({ ...DOCK, active: CODE }).active, null);
    assert.equal(closeDockOperator(DOCK), DOCK);
});

test('withoutDockIcons: 描く直前に差し込んだアイコンを、元のラベルに戻す。ほかの丸は、そのまま', ()=> {
    const drawn = {
        ...DOCK,
        list: [
            ...DOCK.list,
            { ...appOperator('x'), code: CODE, label: { type: 'function', code: CODE, text: '要素の追加', dockIcon: true, val: ()=> null } },
        ],
    };

    const saved = withoutDockIcons(drawn);

    assert.deepEqual(saved.list[3].label, { type: 'icon', code: CODE, val: '要素の追加' });
    assert.equal(saved.list[0], DOCK.list[0]);
});
