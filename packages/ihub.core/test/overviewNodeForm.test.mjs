// manegers/overviewNodeForm.js のテスト。(0.12.0 から。yanqirenshi/iHub#242・#244。node --test で動かす)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { fieldsOf } from '@yanqirenshi/model.unchi';

import {
    LABEL_FONT_DEFAULTS, NEW_NODE_GAP_X, OVERVIEW_NODE_FIELDS, OVERVIEW_NODE_GROUPS, buildOverviewNodeRecord, firstGroupWithError,
    initialOverviewNodeForm,
    isNodeLink, newNodePosition, validateOverviewNodeForm,
} from '../src/manegers/overviewNodeForm.js';

// 参照アプリの data/overview/nodes.json
const NODES = JSON.parse(readFileSync(fileURLToPath(new URL('../../../data/overview/nodes.json', import.meta.url)), 'utf8'));

// 色の判定の差し替え。(node には CSS.supports が無いので、決まった値だけを色とする)
const COLORS = new Set(['#fff8e1', 'orange', '#333', 'rgb(0, 0, 0)']);
const isColor = (v)=> COLORS.has(v);
const validate = (values)=> validateOverviewNodeForm(values, { isColor });

test('OVERVIEW_NODE_FIELDS: 見出しは、Overview のインスペクタ (model.unchi の fieldsOf) のラベルと同じ (末尾の括弧の添え書きは除く)', ()=> {
    // 添え書きの例: 「背景の不透明度 (0〜1。1 で不透明)」
    const inspector = Object.fromEntries(fieldsOf({ type: 'NODE' }).map(f=> [f.path, f.label.replace(/ \(.*\)$/, '')]));

    // model.unchi 0.1.2 から、15 個すべてが、インスペクタにある。(yanqirenshi/iHub#246)
    for (const f of OVERVIEW_NODE_FIELDS) {
        assert.ok(f.path in inspector, f.path);
        assert.equal(f.label, inspector[f.path], f.path);
    }
});

test('OVERVIEW_NODE_FIELDS: 15 個。鍵と保存する所は重ならない。まとまり (タブ) は、決めたものだけ', ()=> {
    assert.equal(OVERVIEW_NODE_FIELDS.length, 15);
    assert.equal(new Set(OVERVIEW_NODE_FIELDS.map(f=> f.key)).size, 15);
    assert.equal(new Set(OVERVIEW_NODE_FIELDS.map(f=> f.path)).size, 15);

    const groups = new Set(OVERVIEW_NODE_GROUPS.map(g=> g.code));

    for (const f of OVERVIEW_NODE_FIELDS.filter(f=> f.group))
        assert.ok(groups.has(f.group), f.key);

    // タブの上に、いつも出すのは、名称だけ
    assert.deepEqual(OVERVIEW_NODE_FIELDS.filter(f=> !f.group).map(f=> f.key), ['text']);

    // タブ: 基本 (初めに開く) / 背景 / 枠線 / 文字 / そのほか。項目の無いタブは無い
    assert.deepEqual(OVERVIEW_NODE_GROUPS.map(g=> g.label), ['基本', '背景', '枠線', '文字', 'そのほか']);
    assert.deepEqual(OVERVIEW_NODE_GROUPS.map(g=> OVERVIEW_NODE_FIELDS.filter(f=> f.group===g.code).map(f=> f.key)), [
        ['w', 'h'],
        ['background', 'opacity'],
        ['borderType', 'border', 'borderWidth', 'radius', 'shadow'],
        ['fontSize', 'fontColor', 'fontWeight'],
        ['description', 'link'],
    ]);
});

test('firstGroupWithError: 誤りのある項目を持つ、並びの先のタブ。名称だけの誤り・誤りなしは null', ()=> {
    assert.equal(firstGroupWithError({}), null);
    assert.equal(firstGroupWithError({ text: '名称を入力してください。' }), null);
    assert.equal(firstGroupWithError({ fontColor: 'x', borderWidth: 'x' }), 'border');
    assert.equal(firstGroupWithError({ text: 'x', link: 'x' }), 'other');
    assert.equal(firstGroupWithError({ w: 'x', link: 'x' }), 'basic');
});

test('initialOverviewNodeForm: 幅 160・高さ 80。ほかは空 (選ぶ項目は「指定なし」)', ()=> {
    assert.deepEqual(initialOverviewNodeForm(), {
        text: '', w: '160', h: '80',
        background: '', opacity: '',
        borderType: '', border: '', borderWidth: '', radius: '', shadow: '',
        fontSize: '', fontColor: '', fontWeight: '',
        description: '', link: '',
    });
});

test('validateOverviewNodeForm: 名称は必須。幅と高さは、0 より大きい数', ()=> {
    assert.deepEqual(validate({ ...initialOverviewNodeForm(), text: '  ' }), { text: '名称を入力してください。' });
    assert.deepEqual(validate({ ...initialOverviewNodeForm(), text: 'A' }), {});
    assert.deepEqual(validate({ ...initialOverviewNodeForm(), text: 'A', w: '0', h: 'x' }), {
        w: '幅は、0 より大きい数を入力してください。',
        h: '高さは、0 より大きい数を入力してください。',
    });
    // 空の幅・高さは、誤りにしない (既定の大きさにする)
    assert.deepEqual(validate({ ...initialOverviewNodeForm(), text: 'A', w: '', h: '' }), {});
});

test('validateOverviewNodeForm: 数の範囲 (枠線の太さ・文字の大きさは 0 より大きい、角の丸みは 0 以上、不透明度は 0〜1)', ()=> {
    const base = { ...initialOverviewNodeForm(), text: 'A' };

    assert.deepEqual(validate({ ...base, borderWidth: '0', fontSize: '-1', radius: '-0.5', opacity: '2' }), {
        borderWidth: '枠線の太さは、0 より大きい数を入力してください。',
        fontSize: '文字の大きさは、0 より大きい数を入力してください。',
        radius: '角の丸みは、0 以上の数を入力してください。',
        opacity: '背景の不透明度は、0 から 1 までの数を入力してください。',
    });

    // 境目
    assert.deepEqual(validate({ ...base, borderWidth: '0.5', fontSize: '12', radius: '0', opacity: '0' }), {});
    assert.deepEqual(validate({ ...base, opacity: '1' }), {});
});

test('validateOverviewNodeForm: 色は、背景色・枠線の色・文字の色に、同じ判定をかける', ()=> {
    const base = { ...initialOverviewNodeForm(), text: 'A' };

    assert.deepEqual(validate({ ...base, background: 'あか', border: 'notacolor', fontColor: '12px' }), {
        background: '背景色は、CSS の色 (#ff8800・orange など) を入力してください。',
        border: '枠線の色は、CSS の色 (#ff8800・orange など) を入力してください。',
        fontColor: '文字の色は、CSS の色 (#ff8800・orange など) を入力してください。',
    });
    assert.deepEqual(validate({ ...base, background: '#fff8e1', border: 'orange', fontColor: ' rgb(0, 0, 0) ' }), {});
});

test('validateOverviewNodeForm: リンクと、選ぶ項目', ()=> {
    const base = { ...initialOverviewNodeForm(), text: 'A' };
    const message = 'リンクは、http:// か https:// で始まる URL か、/ で始まるパスを入力してください。';

    assert.deepEqual(validate({ ...base, link: 'example.com' }), { link: message });
    assert.deepEqual(validate({ ...base, link: 'javascript:alert(1)' }), { link: message });
    assert.deepEqual(validate({ ...base, link: '//example.com' }), { link: message });
    assert.deepEqual(validate({ ...base, link: 'https://example.com/a' }), {});
    assert.deepEqual(validate({ ...base, link: '/business?tab=tm' }), {});

    assert.deepEqual(validate({ ...base, borderType: 'double', fontWeight: '700' }), {
        borderType: '枠線の種類は、選択肢から選んでください。',
        fontWeight: '文字の太さは、選択肢から選んでください。',
    });
});

test('isNodeLink: http(s):// で始まる URL か、/ で始まるパス', ()=> {
    assert.equal(isNodeLink('http://a'), true);
    assert.equal(isNodeLink('HTTPS://a'), true);
    assert.equal(isNodeLink('/'), true);
    assert.equal(isNodeLink('https://'), false);
    assert.equal(isNodeLink('ftp://a'), false);
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

test('buildOverviewNodeRecord: すべての項目。数は数に、選ぶ項目は値に、影の「なし」は false に', ()=> {
    const values = {
        text: 'A', w: '200', h: '120',
        background: '#fff8e1', opacity: '0.5',
        borderType: 'dashed', border: 'orange', borderWidth: '3', radius: '0', shadow: 'none',
        fontSize: '20', fontColor: '#333', fontWeight: 'bold',
        description: ' 1 行め\n2 行め ', link: 'https://example.com',
    };

    assert.deepEqual(validate(values), {});

    const record = buildOverviewNodeRecord(values, []);

    assert.deepEqual(record, {
        type: 'NODE',
        label: { text: 'A', font: { size: 20, color: '#333', weight: 'bold' }, align: 'center', valign: 'middle' },
        size: { w: 200, h: 120 },
        position: { x: 0, y: 0 },
        background: { color: '#fff8e1', opacity: 0.5 },
        border: { type: 'dashed', color: 'orange', width: 3, r: 0 },
        shadow: false,
        description: '1 行め\n2 行め',
        link: { url: 'https://example.com' },
    });
});

test('buildOverviewNodeRecord: 文字は、どれか 1 つを入れたら、3 つともそろえて書く (入れなかったものは既定)', ()=> {
    const base = { ...initialOverviewNodeForm(), text: 'A' };
    const font = (values)=> buildOverviewNodeRecord({ ...base, ...values }, []).label.font;

    assert.deepEqual(LABEL_FONT_DEFAULTS, { size: 16, color: '#333333', weight: 'normal' });

    // label.font を一部だけ書くと、書いていない色が白になる (assh0le の Label.build) ため
    assert.deepEqual(font({ fontSize: '20' }),       { size: 20, color: '#333333', weight: 'normal' });
    assert.deepEqual(font({ fontColor: 'orange' }),  { size: 16, color: 'orange',  weight: 'normal' });
    assert.deepEqual(font({ fontWeight: 'bold' }),   { size: 16, color: '#333333', weight: 'bold' });
    assert.deepEqual(font({ fontSize: '12', fontWeight: 'normal' }), { size: 12, color: '#333333', weight: 'normal' });

    // 3 つとも入れなかったときは、書かない
    assert.equal(font({}), undefined);
});

test('buildOverviewNodeRecord: 「指定なし」と影の「あり」(既定) は書かない', ()=> {
    const record = buildOverviewNodeRecord({ ...initialOverviewNodeForm(), text: 'A', borderType: '', shadow: '', fontWeight: '' }, []);

    assert.deepEqual(Object.keys(record), ['type', 'label', 'size', 'position']);
    assert.deepEqual(record.label, { text: 'A', align: 'center', valign: 'middle' });
});

test('buildOverviewNodeRecord: 空の幅・高さは、既定の大きさ (160 × 80)', ()=> {
    assert.deepEqual(buildOverviewNodeRecord({ text: 'A', w: '', h: ' ' }, []).size, { w: 160, h: 80 });
});
