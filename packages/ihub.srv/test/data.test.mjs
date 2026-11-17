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

// マスタースケジュール (艦橋の Schedule タブ) のデータ。行 (rows)・予定 (items) と、WBS を持つデータ。
function scheduleData (rows, items) {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['wbs/projects'] = [{ id: 1, name: 'P' }];
    data['wbs/wbs'] = [{ id: 10, parent: 1, name: 'A' }];
    data['wbs/workpackages'] = [{ id: 20, parent: 10, name: 'W' }];
    data['master_schedule/rows'] = rows;
    data['master_schedule/items'] = items;

    return data;
}

const ROWS = [{ id: 1, name: '開発' }, { id: 2, name: 'リリース', description: ['説明'] }];
const PLAN = { from: '2026-11-01', to: '2026-11-30' };

test('master_schedule のファイルは無くてもよく、無いときは予定が無いものとして検査する', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    assert.ok(!('master_schedule/rows' in data) && !('master_schedule/items' in data));
    assert.deepEqual(validateData(data), []);
});

test('master_schedule: 行と予定 (行き先は wbs・url・無し) は、正しい', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 1, name: '画面', plan: PLAN },
        { id: 1002, parent: 1, name: 'API', plan: PLAN, wbs: 20 },
        { id: 1003, parent: 2, name: '公開', plan: { from: '2026-12-15', to: '2026-12-15' }, url: 'https://example.com/release', description: '説明' },
        { id: 1004, parent: 2, name: 'WBS のノード', plan: PLAN, wbs: 10 },
        { id: 1005, parent: 2, name: 'プロジェクト', plan: PLAN, wbs: 1 },
    ])), []);
});

test('master_schedule: 行だけ・予定が無くてもよい', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [])), []);
    assert.deepEqual(validateData(scheduleData([], [])), []);
});

test('master_schedule: 形の誤りを見つける (name・plan が無い・plan の形・知らない項目・url の形)', ()=> {
    const check = (item)=> validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'X', plan: PLAN, ...item }]));

    const no_plan = validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'X' }]));
    assert.ok(no_plan.some(e=> e.startsWith('master_schedule/items/0') && e.includes('plan')), no_plan.join('\n'));

    const no_name = validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, plan: PLAN }]));
    assert.ok(no_name.some(e=> e.startsWith('master_schedule/items/0') && e.includes('name')), no_name.join('\n'));

    const no_to = check({ plan: { from: '2026-11-01' } });
    assert.ok(no_to.some(e=> e.startsWith('master_schedule/items/0/plan') && e.includes('to')), no_to.join('\n'));

    const bad_form = check({ plan: { from: '2026/11/01', to: '2026-11-30' } });
    assert.ok(bad_form.some(e=> e.startsWith('master_schedule/items/0/plan/from')), bad_form.join('\n'));

    const unknown = check({ group: 'x' });
    assert.ok(unknown.some(e=> e.startsWith('master_schedule/items/0') && e.endsWith('(group)')), unknown.join('\n'));

    const bad_wbs = check({ wbs: '20' });
    assert.ok(bad_wbs.some(e=> e.startsWith('master_schedule/items/0/wbs')), bad_wbs.join('\n'));

    // url は http か https だけ。(javascript: などは、押したときに動いてしまうので、書けない)
    for (const url of ['javascript:alert(1)', 'example.com', 'ftp://example.com/'])
        assert.ok(check({ url }).some(e=> e.startsWith('master_schedule/items/0/url')), url);

    const no_row_name = validateData(scheduleData([{ id: 1 }], []));
    assert.ok(no_row_name.some(e=> e.startsWith('master_schedule/rows/0') && e.includes('name')), no_row_name.join('\n'));
});

test('master_schedule: plan の日付が実在しないときと、to が from より前のときを見つける (ルール)', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 1, name: 'A', plan: { from: '2026-02-30', to: '2026-03-31' } },
        { id: 1002, parent: 1, name: 'B', plan: { from: '2026-11-30', to: '2026-11-01' } },
        { id: 1003, parent: 1, name: 'C', plan: { from: '2026-11-01', to: '2026-13-01' } },
        { id: 1004, parent: 1, name: 'D', plan: PLAN },
    ])), [
        'master_schedule/items: plan.from が日付として正しくありません。(id=1001, from=2026-02-30)',
        'master_schedule/items: plan.to が plan.from より前です。(id=1002, from=2026-11-30, to=2026-11-01)',
        'master_schedule/items: plan.to が日付として正しくありません。(id=1003, to=2026-13-01)',
    ]);
});

test('master_schedule: parent の行が無いもの・wbs の無いもの・wbs と url の両方・id の重複を見つける (ルール)', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 9, name: 'A', plan: PLAN },
        { id: 1002, parent: 1, name: 'B', plan: PLAN, wbs: 999 },
        { id: 1003, parent: 1, name: 'C', plan: PLAN, wbs: 20, url: 'https://example.com/' },
        { id: 1, parent: 1, name: 'D (行と同じ id)', plan: PLAN },
        { id: 1005, parent: 1, name: 'E', plan: PLAN },
        { id: 1005, parent: 1, name: 'F (予定と同じ id)', plan: PLAN },
    ])), [
        'master_schedule: id が重複しています。(id=1)',
        'master_schedule: id が重複しています。(id=1005)',
        'master_schedule/items: parent の行が見つかりません。(id=1001, parent=9)',
        'master_schedule/items: wbs の WBS のノードが見つかりません。(id=1002, wbs=999)',
        'master_schedule/items: wbs と url は、両方は書けません。(id=1003)',
    ]);
});

test('master_schedule: wbs の検査は、データ全体の検証のときだけ (ドメインごとの検証では、WBS が渡らないので飛ばす)', ()=> {
    const rows = [{ id: 1, name: '開発' }];
    const items = [{ id: 1001, parent: 1, name: 'A', plan: PLAN, wbs: 999 }];

    assert.deepEqual(RULES.master_schedule({ rows, items }), []);
    assert.deepEqual(RULES.master_schedule({ rows, items }, {}), []);
    assert.equal(RULES.master_schedule({ rows, items }, { 'wbs/projects': [], 'wbs/wbs': [], 'wbs/workpackages': [] }).length, 1);
});

test('ワークパッケージの plan は、書けない (予定は master_schedule に書く)', ()=> {
    const data = scheduleData([], []);

    data['wbs/workpackages'] = [{ id: 20, parent: 10, name: 'W', plan: PLAN }];

    const errors = validateData(data);

    assert.ok(errors.some(e=> e.startsWith('wbs/workpackages/0') && e.endsWith('(plan)')), errors.join('\n'));

    data['wbs/workpackages'] = [{ id: 20, parent: 10, name: 'W' }];

    assert.deepEqual(validateData(data), []);
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

test('クラス図 (classes) のファイルは無くてもよく、無いときは空の図として検査する', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    delete data['classes/classes'];
    delete data['classes/relationships'];

    assert.deepEqual(validateData(data), []);

    // 関係だけがあるときは、端のクラスが見つからない。(クラスは空として検査する)
    data['classes/relationships'] = [{ id: 'A->B', type: 'association', from: { classId: 'A', point: 'top' }, to: { x: 0, y: 0 } }];

    assert.deepEqual(validateData(data), ['classes/relationships: from.classId のクラスが見つかりません。(id=A->B, classId=A)']);
});

test('クラス図は、d3.classes の入力の形と、アプリ固有の項目を書ける', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['classes/classes'] = [
        // 名前は文字列でもよい。属性・メソッドも文字列でよい。知らない項目 (layer など) は、そのまま書ける
        { id: 'A', name: 'A', attributes: ['x'], methods: ['run'], position: { x: 0, y: 0 }, layer: 'domain', notes: ['メモ'] },
        { id: 'B', name: { physical: 'B' }, stereotype: 'interface', position: { x: 1.5, y: -2 }, size: { w: 300, h: 0 },
          header: { background: { color: '#89c3eb' }, font: { color: '#fff' } }, description: ['説明'] },
    ];
    data['classes/relationships'] = [
        { id: 'A->B', type: 'realization', from: { classId: 'A', point: 250 }, to: { classId: 'B', point: 'bottom' }, notes: ['メモ'] },
        { id: 'B->pt', type: 'dependency', from: { classId: 'B', point: 'right' }, to: { x: 10, y: 20 }, label: 'l', fromMultiplicity: '1', toMultiplicity: '0..*', fromRole: '- a', toRole: '+ b' },
    ];

    assert.deepEqual(validateData(data), []);
});

test('クラス図の形の誤りを見つける (id・位置・名前・関係の種類・取り付ける辺)', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['classes/classes'].push({ id: 1, name: {}, position: { x: 0 } });
    data['classes/relationships'].push({ id: 'X', type: 'uses', from: { classId: 'Plan', point: 'middle' }, to: { classId: 'Plan', point: 'top' } });

    const errors = validateData(data);

    assert.ok(errors.some(e=> e.startsWith('classes/classes/8/id: ')), errors.join('\n'));
    assert.ok(errors.some(e=> e.startsWith('classes/classes/8/position: ')), errors.join('\n'));
    assert.ok(errors.some(e=> e.startsWith('classes/classes/8/name')), errors.join('\n'));
    assert.ok(errors.some(e=> e.startsWith('classes/relationships/6/type: ')), errors.join('\n'));
    assert.ok(errors.some(e=> e.startsWith('classes/relationships/6/from')), errors.join('\n'));
});

test('クラス図の id の重複と、関係の端のクラスが無いものを見つける', ()=> {
    const errors = RULES.classes({
        classes:       [{ id: 'A' }, { id: 'A' }, { id: 'B' }],
        relationships: [
            { id: 'r1', from: { classId: 'A', point: 'top' }, to: { classId: 'C', point: 'top' } },
            { id: 'r1', from: { x: 0, y: 0 }, to: { classId: 'B', point: 0 } },
        ],
    });

    assert.deepEqual(errors, [
        'classes/classes: id が重複しています。(id=A)',
        'classes/relationships: id が重複しています。(id=r1)',
        'classes/relationships: to.classId のクラスが見つかりません。(id=r1, classId=C)',
    ]);
});
