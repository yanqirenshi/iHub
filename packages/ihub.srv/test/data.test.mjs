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
    // 線の種類 (d3.unchi 0.10.4 から。#252)
    data['overview/edges'].push({ id: 102, from: { id: 1 }, to: { id: 2 }, stroke: { type: 'dashed' } });

    assert.deepEqual(validateData(data), []);

    // 見た目の項目は検査しないので、知らない線の種類も通る。(d3.unchi は実線で描く。インスペクタからは入れられない)
    const unknownStroke = structuredClone(data);

    unknownStroke['overview/edges'][2].stroke.type = 'wavy';

    assert.deepEqual(validateData(unknownStroke), []);

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

// マスタースケジュール (艦橋の Schedule タブ) のデータ。WBS (wbs)・ワークパッケージ (workpackages)・プロジェクト (projects) と、
// 行き先の検査に使う data/wbs/ のデータ。
function scheduleData (wbs, workpackages, projects) {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    data['wbs/projects'] = [{ id: 1, name: 'P' }];
    data['wbs/wbs'] = [{ id: 10, parent: 1, name: 'A' }];
    data['wbs/workpackages'] = [{ id: 20, parent: 10, name: 'W' }];
    data['master_schedule/wbs'] = wbs;
    data['master_schedule/workpackages'] = workpackages;

    if (projects)
        data['master_schedule/projects'] = projects;

    return data;
}

const ROWS = [{ id: 1, name: '開発' }, { id: 2, name: 'リリース', description: ['説明'] }];
const PLAN = { from: '2026-11-01', to: '2026-11-30' };

test('master_schedule のファイルは無くてもよく、無いときは予定が無いものとして検査する', ()=> {
    const data = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));

    assert.ok(!Object.keys(data).some(name=> name.startsWith('master_schedule/')));
    assert.deepEqual(validateData(data), []);
});

test('master_schedule: d3.yabane のショーケースの 4 ファイル (参照アプリの data/master_schedule/) が、そのまま通る', ()=> {
    const data = loadDataDir(join(ROOT, 'data'));

    assert.deepEqual(Object.keys(data).filter(name=> name.startsWith('master_schedule/')).sort(),
                     ['master_schedule/milestones', 'master_schedule/projects', 'master_schedule/wbs', 'master_schedule/workpackages']);
    assert.ok(data['master_schedule/workpackages'].some(d=> d.result && d.progress!==undefined));
    assert.ok(data['master_schedule/milestones'].some(d=> d.parent!==undefined));
    assert.ok(data['master_schedule/milestones'].some(d=> d.project!==undefined));
    assert.deepEqual(validateData(data), []);
});

test('master_schedule: 0.7.0 の名前のファイル (rows・items) は、名前を変えるように知らせる', ()=> {
    const data = scheduleData([], []);

    data['master_schedule/rows'] = ROWS;
    data['master_schedule/items'] = [];

    assert.deepEqual(validateData(data), [
        'master_schedule/rows: ファイルの名前が変わりました。wbs.json に名前を変えてください。(master_schedule/rows.json → master_schedule/wbs.json)',
        'master_schedule/items: ファイルの名前が変わりました。workpackages.json に名前を変えてください。(master_schedule/items.json → master_schedule/workpackages.json)',
    ]);
});

test('master_schedule: WBS とワークパッケージ (行き先は wbs・url・無し) は、正しい', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 1, name: '画面', plan: PLAN },
        { id: 1002, parent: 1, name: 'API', plan: PLAN, wbs: 20 },
        { id: 1003, parent: 2, name: '公開', plan: { from: '2026-12-15', to: '2026-12-15' }, url: 'https://example.com/release', description: '説明' },
        { id: 1004, parent: 2, name: 'WBS のノード', plan: PLAN, wbs: 10 },
        { id: 1005, parent: 2, name: 'プロジェクト', plan: PLAN, wbs: 1 },
    ])), []);
});

test('master_schedule: WBS だけ・予定が無くてもよい', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [])), []);
    assert.deepEqual(validateData(scheduleData([], [])), []);
    assert.deepEqual(validateData(scheduleData([], [], [])), []);
});

test('master_schedule: プロジェクトと、その直下の WBS・ワークパッケージ (project) を書ける。プロジェクトの id は WBS と重なってよい', ()=> {
    assert.deepEqual(validateData(scheduleData([
        { id: 1, name: 'WBS 1', project: 10 },
        { id: 2, name: 'WBS 2', parent: 1 },
        { id: 10, name: 'WBS 10 (プロジェクトと同じ id)', project: 20 },
        { id: 3, name: 'parent と project の両方 (parent が優先)', parent: 1, project: 20 },
    ], [
        { id: 1001, parent: 2, name: 'A', plan: PLAN },
        { id: 1002, project: 10, name: 'プロジェクトの直下', plan: PLAN },
        { id: 1003, parent: 1, project: 20, name: '両方', plan: PLAN },
    ], [
        { id: 10, name: 'Project 10', background: { color: '#eaf4fc' }, font: { weight: 'bold' } },
        { id: 20, name: 'Project 20', description: '説明', stroke: { type: 'dashed' } },
    ])), []);
});

test('master_schedule: ワークパッケージの result・progress を受け取る (描かない)', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 1, name: 'A', plan: PLAN, result: { from: '2026-11-01', to: null }, progress: 50 },
        { id: 1002, parent: 1, name: 'B', plan: PLAN, result: { from: '2026-11-01', to: '2026-11-20' }, progress: 100 },
        { id: 1003, parent: 1, name: 'C', plan: PLAN, result: { from: null, to: null } },
    ])), []);

    const errors = validateData(scheduleData(ROWS, [
        { id: 1001, parent: 1, name: 'A', plan: PLAN, result: { from: '2026/11/01' } },
        { id: 1002, parent: 1, name: 'B', plan: PLAN, result: { start: '2026-11-01' } },
        { id: 1003, parent: 1, name: 'C', plan: PLAN, progress: '50' },
    ]));
    assert.ok(errors.some(e=> e.startsWith('master_schedule/workpackages/0/result/from')), errors.join('\n'));
    assert.ok(errors.some(e=> e.startsWith('master_schedule/workpackages/1/result') && e.endsWith('(start)')), errors.join('\n'));
    assert.ok(errors.some(e=> e.startsWith('master_schedule/workpackages/2/progress')), errors.join('\n'));
});

test('master_schedule: 形の誤りを見つける (name・plan が無い・plan の形・知らない項目・url の形)', ()=> {
    const check = (item)=> validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'X', plan: PLAN, ...item }]));

    const no_plan = validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'X' }]));
    assert.ok(no_plan.some(e=> e.startsWith('master_schedule/workpackages/0') && e.includes('plan')), no_plan.join('\n'));

    const no_name = validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, plan: PLAN }]));
    assert.ok(no_name.some(e=> e.startsWith('master_schedule/workpackages/0') && e.includes('name')), no_name.join('\n'));

    const no_to = check({ plan: { from: '2026-11-01' } });
    assert.ok(no_to.some(e=> e.startsWith('master_schedule/workpackages/0/plan') && e.includes('to')), no_to.join('\n'));

    const bad_form = check({ plan: { from: '2026/11/01', to: '2026-11-30' } });
    assert.ok(bad_form.some(e=> e.startsWith('master_schedule/workpackages/0/plan/from')), bad_form.join('\n'));

    const unknown = check({ group: 'x' });
    assert.ok(unknown.some(e=> e.startsWith('master_schedule/workpackages/0') && e.endsWith('(group)')), unknown.join('\n'));

    const bad_wbs = check({ wbs: '20' });
    assert.ok(bad_wbs.some(e=> e.startsWith('master_schedule/workpackages/0/wbs')), bad_wbs.join('\n'));

    const bad_project = check({ project: '10' });
    assert.ok(bad_project.some(e=> e.startsWith('master_schedule/workpackages/0/project')), bad_project.join('\n'));

    // url は http か https だけ。(javascript: などは、押したときに動いてしまうので、書けない)
    for (const url of ['javascript:alert(1)', 'example.com', 'ftp://example.com/'])
        assert.ok(check({ url }).some(e=> e.startsWith('master_schedule/workpackages/0/url')), url);

    const no_row_name = validateData(scheduleData([{ id: 1 }], []));
    assert.ok(no_row_name.some(e=> e.startsWith('master_schedule/wbs/0') && e.includes('name')), no_row_name.join('\n'));

    const no_project_name = validateData(scheduleData([], [], [{ id: 1 }]));
    assert.ok(no_project_name.some(e=> e.startsWith('master_schedule/projects/0') && e.includes('name')), no_project_name.join('\n'));

    const project_unknown = validateData(scheduleData([], [], [{ id: 1, name: 'P', parent: 2 }]));
    assert.ok(project_unknown.some(e=> e.startsWith('master_schedule/projects/0') && e.endsWith('(parent)')), project_unknown.join('\n'));
});

test('master_schedule: plan の日付が実在しないときと、to が from より前のときを見つける (ルール)', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 1, name: 'A', plan: { from: '2026-02-30', to: '2026-03-31' } },
        { id: 1002, parent: 1, name: 'B', plan: { from: '2026-11-30', to: '2026-11-01' } },
        { id: 1003, parent: 1, name: 'C', plan: { from: '2026-11-01', to: '2026-13-01' } },
        { id: 1004, parent: 1, name: 'D', plan: PLAN },
    ])), [
        'master_schedule/workpackages: plan.from が日付として正しくありません。(id=1001, from=2026-02-30)',
        'master_schedule/workpackages: plan.to が plan.from より前です。(id=1002, from=2026-11-30, to=2026-11-01)',
        'master_schedule/workpackages: plan.to が日付として正しくありません。(id=1003, to=2026-13-01)',
    ]);
});

test('master_schedule: ワークパッケージの parent・project が無いもの・行き先の wbs の無いもの・wbs と url の両方・id の重複を見つける (ルール)', ()=> {
    assert.deepEqual(validateData(scheduleData(ROWS, [
        { id: 1001, parent: 9, name: 'A', plan: PLAN },
        { id: 1002, parent: 1, name: 'B', plan: PLAN, wbs: 999 },
        { id: 1003, parent: 1, name: 'C', plan: PLAN, wbs: 20, url: 'https://example.com/' },
        { id: 1, parent: 1, name: 'D (WBS と同じ id)', plan: PLAN },
        { id: 1005, parent: 1, name: 'E', plan: PLAN },
        { id: 1005, parent: 1, name: 'F (ワークパッケージと同じ id)', plan: PLAN },
        { id: 1006, name: 'G (parent も project も無い)', plan: PLAN },
        { id: 1007, project: 99, name: 'H (無いプロジェクト)', plan: PLAN },
    ], [{ id: 10, name: 'P' }, { id: 10, name: 'P (同じ id)' }])), [
        'master_schedule/projects: id が重複しています。(id=10)',
        'master_schedule: id が重複しています。(id=1)',
        'master_schedule: id が重複しています。(id=1005)',
        'master_schedule/workpackages: parent の WBS が見つかりません。(id=1001, parent=9)',
        'master_schedule/workpackages: wbs (行き先) の WBS のノードが見つかりません。(id=1002, wbs=999)',
        'master_schedule/workpackages: wbs と url は、両方は書けません。(id=1003)',
        'master_schedule/workpackages: parent (WBS の id) か project (プロジェクトの id) を書いてください。(id=1006)',
        'master_schedule/workpackages: project のプロジェクトが見つかりません。(id=1007, project=99)',
    ]);
});

// マイルストーン (0.10.0 から) のデータ。WBS は ROWS (id 1・2)、プロジェクトは id 10。
function milestoneData (milestones) {
    const data = scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'A', plan: PLAN }], [{ id: 10, name: 'P' }]);

    data['master_schedule/milestones'] = milestones;

    return data;
}

test('master_schedule: マイルストーンを、WBS の行 (parent) とプロジェクトの行 (project) に書ける。id は、ほかのコレクションと重なってよい', ()=> {
    assert.deepEqual(validateData(milestoneData([
        { id: 1, parent: 1, name: 'Release 1', date: '2026-11-15' },
        { id: 2, project: 10, name: 'Kickoff', date: '2026-10-01', description: ['説明'] },
        { id: 1001, parent: 2, project: 10, name: '両方 (parent が優先)', date: '2026-12-01',
          background: { color: '#ffd900' }, stroke: { color: '#e95464', width: 6, type: 'dashed' }, font: { size: 24, weight: 'bold' } },
    ])), []);
});

test('master_schedule: マイルストーンのファイルが無いときは、空 (default) として検査する', ()=> {
    const data = scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'A', plan: PLAN }]);

    assert.ok(!('master_schedule/milestones' in data));
    assert.deepEqual(validateData(data), []);
    assert.deepEqual(RULES.master_schedule({ projects: [], wbs: ROWS, workpackages: [] }), []);
});

test('master_schedule: マイルストーンの形の誤りを見つける (name・date が無い・date の形・知らない項目)', ()=> {
    const check = (milestone)=> validateData(milestoneData([{ id: 1, parent: 1, name: 'M', date: '2026-11-15', ...milestone }]));

    const no_date = validateData(milestoneData([{ id: 1, parent: 1, name: 'M' }]));
    assert.ok(no_date.some(e=> e.startsWith('master_schedule/milestones/0') && e.includes('date')), no_date.join('\n'));

    const no_name = validateData(milestoneData([{ id: 1, parent: 1, date: '2026-11-15' }]));
    assert.ok(no_name.some(e=> e.startsWith('master_schedule/milestones/0') && e.includes('name')), no_name.join('\n'));

    const bad_form = check({ date: '2026/11/15' });
    assert.ok(bad_form.some(e=> e.startsWith('master_schedule/milestones/0/date')), bad_form.join('\n'));

    for (const key of ['order', 'url', 'wbs', 'plan']) {
        const errors = check({ [key]: key==='plan' ? PLAN : 1 });
        assert.ok(errors.some(e=> e.startsWith('master_schedule/milestones/0') && e.endsWith(`(${key})`)), `${key}\n${errors.join('\n')}`);
    }

    const bad_look = check({ stroke: { type: 'wavy' } });
    assert.ok(bad_look.some(e=> e.startsWith('master_schedule/milestones/0/stroke/type')), bad_look.join('\n'));
});

test('master_schedule: マイルストーンの id の重複・parent も project も無いもの・先の無いもの・実在しない日付を見つける (ルール)', ()=> {
    assert.deepEqual(validateData(milestoneData([
        { id: 1, parent: 1, name: 'A', date: '2026-11-15' },
        { id: 1, parent: 2, name: 'B (同じ id)', date: '2026-11-16' },
        { id: 3, name: 'C (parent も project も無い)', date: '2026-11-17' },
        { id: 4, parent: 9, name: 'D (無い WBS)', date: '2026-11-18' },
        { id: 5, project: 99, name: 'E (無いプロジェクト)', date: '2026-11-19' },
        { id: 6, parent: 1, name: 'F (実在しない日)', date: '2026-02-30' },
        { id: 7, project: 10, name: 'G (13 月)', date: '2026-13-01' },
    ])), [
        'master_schedule/milestones: id が重複しています。(id=1)',
        'master_schedule/milestones: parent (WBS の id) か project (プロジェクトの id) を書いてください。(id=3)',
        'master_schedule/milestones: parent の WBS が見つかりません。(id=4, parent=9)',
        'master_schedule/milestones: project のプロジェクトが見つかりません。(id=5, project=99)',
        'master_schedule/milestones: date が日付として正しくありません。(id=6, date=2026-02-30)',
        'master_schedule/milestones: date が日付として正しくありません。(id=7, date=2026-13-01)',
    ]);
});

test('master_schedule: 行き先の wbs の検査は、データ全体の検証のときだけ (ドメインごとの検証では、data/wbs/ が渡らないので飛ばす)', ()=> {
    const projects = [];
    const wbs = [{ id: 1, name: '開発' }];
    const workpackages = [{ id: 1001, parent: 1, name: 'A', plan: PLAN, wbs: 999 }];

    assert.deepEqual(RULES.master_schedule({ projects, wbs, workpackages }), []);
    assert.deepEqual(RULES.master_schedule({ projects, wbs, workpackages }, {}), []);
    assert.equal(RULES.master_schedule({ projects, wbs, workpackages }, { 'wbs/projects': [], 'wbs/wbs': [], 'wbs/workpackages': [] }).length, 1);
});

test('master_schedule: WBS の入れ子 (parent) と、WBS・ワークパッケージの見た目 (background・stroke・font) を書ける', ()=> {
    const wbs = [
        { id: 10, name: 'WBS 10', background: { color: '#eaf4fc' }, font: { weight: 'bold' } },
        { id: 11, name: 'WBS 10-1', parent: 10 },
        { id: 111, name: 'WBS 10-1-1', parent: 11, stroke: { color: '#999999', type: 'dashed' } },
        { id: 20, name: 'WBS 20' },
    ];

    assert.deepEqual(validateData(scheduleData(wbs, [
        { id: 1000, parent: 111, name: 'A', plan: PLAN, background: { color: '#89c3eb' }, font: { color: '#ffffff', weight: 'bold' } },
        { id: 1200, parent: 11, name: '子の WBS を持つ WBS の直下', plan: PLAN, stroke: { type: 'dotted' } },
        { id: 3000, parent: 20, name: 'C', plan: PLAN, background: { color: '#fdeff2', opacity: 0.8 }, font: { size: 24, color: '#666666', weight: 700 } },
        { id: 3001, parent: 20, name: 'D', plan: PLAN, stroke: { color: '#e95464', width: 6, type: 'solid' } },
    ])), []);
});

test('master_schedule: 見た目の形の誤りを見つける (知らない項目・線の種類・不透明度・大きさ・型)', ()=> {
    const item = (look)=> validateData(scheduleData(ROWS, [{ id: 1001, parent: 1, name: 'X', plan: PLAN, ...look }]));
    const row = (look)=> validateData(scheduleData([{ id: 1, name: '開発', ...look }], []));
    const project = (look)=> validateData(scheduleData([], [], [{ id: 1, name: 'P', ...look }]));
    const has = (errors, prefix)=> errors.some(e=> e.startsWith(prefix));

    for (const [look, prefix] of [
        [{ background: { colour: 'red' } },     'master_schedule/workpackages/0/background'],
        [{ background: { opacity: 1.5 } },      'master_schedule/workpackages/0/background/opacity'],
        [{ background: '#fff' },                'master_schedule/workpackages/0/background'],
        [{ stroke: { type: 'wavy' } },          'master_schedule/workpackages/0/stroke/type'],
        [{ stroke: { width: -1 } },             'master_schedule/workpackages/0/stroke/width'],
        [{ font: { size: 0 } },                 'master_schedule/workpackages/0/font/size'],
        [{ font: { weight: true } },            'master_schedule/workpackages/0/font/weight'],
        [{ font: { family: 'serif' } },         'master_schedule/workpackages/0/font'],
    ]) {
        const errors = item(look);
        assert.ok(has(errors, prefix), `${JSON.stringify(look)}\n${errors.join('\n')}`);
    }

    assert.ok(has(row({ stroke: { type: 'double' } }), 'master_schedule/wbs/0/stroke/type'));
    assert.ok(has(row({ parent: '1' }), 'master_schedule/wbs/0/parent'));
    assert.ok(has(row({ project: '1' }), 'master_schedule/wbs/0/project'));
    assert.ok(has(project({ background: { opacity: -1 } }), 'master_schedule/projects/0/background/opacity'));
});

test('master_schedule: WBS の parent・project が無いもの・入れ子の輪を見つける (ルール)', ()=> {
    assert.deepEqual(validateData(scheduleData([
        { id: 1, name: 'A', project: 10 },
        { id: 2, name: 'B', parent: 99 },
        { id: 3, name: 'C', parent: 3 },
        { id: 4, name: 'D', parent: 5 },
        { id: 5, name: 'E', parent: 4 },
        { id: 6, name: 'F', parent: 4 },
        { id: 7, name: 'G', project: 99 },
    ], [], [{ id: 10, name: 'P' }])), [
        'master_schedule/wbs: parent の WBS が見つかりません。(id=2, parent=99)',
        'master_schedule/wbs: project のプロジェクトが見つかりません。(id=7, project=99)',
        'master_schedule/wbs: 入れ子が輪になっています。(id=3)',
        'master_schedule/wbs: 入れ子が輪になっています。(id=4)',
        'master_schedule/wbs: 入れ子が輪になっています。(id=5)',
    ]);
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

// TM・ER のデータ型 (data_type) と Null 制約 (not_null)。(0.12.0 から。model.tm 0.1.3・model.er 0.2.2 のスキーマ。#234)
test('TM: 識別子・属性のマスタに data_type、エンティティの属性の行に not_null を書ける。形の誤りは見つける', ()=> {
    const base = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));
    const tm = (fn)=> { const data = structuredClone(base); fn(data); return validateData(data); };

    assert.deepEqual(tm(data=> {
        data['tm/attributes'][0].data_type = { type: 'decimal', length: 10, scale: 2, description: ['金額。', '税込み。'] };
        data['tm/identifiers'][0].data_type = { type: 'varchar' };
        data['tm/attributes'][1].data_type = null;
        const row = data['tm/entities'].flatMap(e=> e.attributes || [])[0];
        row.not_null = true;
    }), []);

    const bad_length = tm(data=> { data['tm/attributes'][0].data_type = { type: 'varchar', length: 0 }; });
    assert.ok(bad_length.some(e=> e.startsWith('tm/attributes/0/data_type/length')), bad_length.join('\n'));

    const bad_scale = tm(data=> { data['tm/identifiers'][0].data_type = { type: 'decimal', scale: -1 }; });
    assert.ok(bad_scale.some(e=> e.startsWith('tm/identifiers/0/data_type/scale')), bad_scale.join('\n'));

    const string_type = tm(data=> { data['tm/attributes'][0].data_type = 'varchar'; });
    assert.ok(string_type.some(e=> e.startsWith('tm/attributes/0/data_type')), string_type.join('\n'));

    const bad_not_null = tm(data=> { data['tm/entities'].flatMap(e=> e.attributes || [])[0].not_null = 'yes'; });
    assert.ok(bad_not_null.some(e=> /^tm\/entities\/\d+\/attributes\/\d+\/not_null/.test(e)), bad_not_null.join('\n'));
});

test('ER: data_type は、オブジェクト・null・文字列 (0.2.1 までの書き方) のどれでもよい。属性の行に not_null を書ける', ()=> {
    const base = loadDataDir(join(ROOT, 'packages/ihub.core/examples/data'));
    const er = (fn)=> { const data = structuredClone(base); fn(data); return validateData(data); };

    assert.deepEqual(er(data=> {
        data['er/attributes'][0].data_type = 'varchar';
        data['er/attributes'][1].data_type = { type: 'decimal', length: 10, scale: 2 };
        data['er/identifiers'][0].data_type = null;
        // 雛形の er/schemas は空なので、1 件足す
        data['er/schemas'].push({ id: 9001, name: 'S', data_type: { type: 'text', description: ['スキーマの型'] } });
        const row = data['er/entities'].flatMap(e=> e.attributes || [])[0];
        row.not_null = false;
    }), []);

    const bad = er(data=> { data['er/attributes'][0].data_type = 10; });
    assert.ok(bad.some(e=> e.startsWith('er/attributes/0/data_type')), bad.join('\n'));
});
