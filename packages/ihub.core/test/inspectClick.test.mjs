// manegers/inspectClick.js のテスト。(0.11.0 から。node --test で動かす)
// inspectClick.js は、ほかのファイルを読み込まない、ただの関数なので、src をそのまま読む。
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inspectClick, isInspectClick } from '../src/manegers/inspectClick.js';

// DOM の MouseEvent の代わり。(preventDefault を呼んだ回数を数える)
function clickEvent (keys = {}) {
    return {
        type: 'click',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        ...keys,
        prevented: 0,
        preventDefault () { this.prevented++; },
    };
}

test('isInspectClick: Ctrl か ⌘ を押したクリックだけが真', ()=> {
    assert.equal(isInspectClick(clickEvent({ ctrlKey: true })), true);
    assert.equal(isInspectClick(clickEvent({ metaKey: true })), true);
    assert.equal(isInspectClick(clickEvent({ ctrlKey: true, metaKey: true })), true);

    assert.equal(isInspectClick(clickEvent()), false);
    assert.equal(isInspectClick(clickEvent({ shiftKey: true })), false);
    assert.equal(isInspectClick(clickEvent({ altKey: true })), false);
});

test('isInspectClick: event が無い・形が違うときは偽', ()=> {
    assert.equal(isInspectClick(undefined), false);
    assert.equal(isInspectClick(null), false);
    assert.equal(isInspectClick({}), false);
    assert.equal(isInspectClick({ ctrlKey: 1 }), false);
});

test('inspectClick: 修飾キーがあれば、preventDefault を呼んでから、d3.* の引数のまま open を呼ぶ', ()=> {
    const calls = [];
    const handler = inspectClick((...args)=> calls.push(args));

    // d3.er・d3.ter の形: click(d, event)
    const e1 = clickEvent({ ctrlKey: true });
    handler('d', e1);

    // d3.deployment・d3.sitemap・d3.unchi・d3.classes の形: click(core, node, event)
    const e2 = clickEvent({ metaKey: true });
    handler('core', 'node', e2);

    assert.deepEqual(calls, [['d', e1], ['core', 'node', e2]]);
    assert.equal(e1.prevented, 1);
    assert.equal(e2.prevented, 1);
});

test('inspectClick: 修飾キーが無ければ、open を呼ばず、preventDefault も呼ばない', ()=> {
    let opened = 0;
    const handler = inspectClick(()=> opened++);

    const plain = clickEvent();
    handler('d', plain);

    const shift = clickEvent({ shiftKey: true });
    handler('core', 'node', shift);

    // event が渡らないとき (古い版の d3.* など) も、開かない
    handler('d');

    assert.equal(opened, 0);
    assert.equal(plain.prevented, 0);
    assert.equal(shift.prevented, 0);
});

test('inspectClick: otherwise は、修飾キーが無いときだけ呼ぶ (Schedule の矢羽根の行き先)', ()=> {
    const log = [];
    const handler = inspectClick((d)=> log.push(['inspect', d]), (d)=> log.push(['open', d]));

    const plain = clickEvent();
    const ctrl = clickEvent({ ctrlKey: true });

    handler('reaf-1', plain);
    handler('reaf-2', ctrl);

    assert.deepEqual(log, [['open', 'reaf-1'], ['inspect', 'reaf-2']]);
    assert.equal(plain.prevented, 0);
    assert.equal(ctrl.prevented, 1);
});

test('inspectClick: preventDefault の無い event でも、開ける', ()=> {
    let opened = 0;
    const handler = inspectClick(()=> opened++);

    handler('d', { ctrlKey: true });

    assert.equal(opened, 1);
});
