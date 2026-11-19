// manegers/schedule.js の buildScheduleData・scheduleScale のテスト。(0.10.0 から。node --test で動かす)
// schedule.js は、ほかのファイルを読み込まない、ただの関数なので、src をそのまま読む。
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildScheduleData, scheduleScale } from '../src/manegers/schedule.js';

const PROJECTS = [{ id: 10, name: 'Project 10' }];
const WBS = [
    { id: 1, name: 'WBS 1', project: 10 },
    { id: 2, name: 'WBS 2', parent: 1 },
];
const WORKPACKAGES = [
    { id: 1001, parent: 2, name: 'Task', plan: { from: '2026-11-01', to: '2026-11-30' } },
];

const collections = (milestones, workpackages = WORKPACKAGES)=> ({
    'master_schedule/projects': PROJECTS,
    'master_schedule/wbs': WBS,
    'master_schedule/workpackages': workpackages,
    ...(milestones ? { 'master_schedule/milestones': milestones } : {}),
});

test('マイルストーンのファイルが無いときは、0.9.2 と同じ (milestones は空)', ()=> {
    const data = buildScheduleData(collections());

    assert.deepEqual(data.milestones, []);
    assert.equal(data.count, 1);
    assert.equal(data.first, '2026-11-01');
    assert.equal(data.last, '2026-11-30');
});

test('マイルストーンを、d3.yabane の入力の形で返す (parent か project の 1 つと、見た目だけ。description は渡さない)', ()=> {
    const data = buildScheduleData(collections([
        { id: 1, parent: 2, name: 'Release', date: '2026-11-15', description: '説明', stroke: { color: '#0e9aa7' } },
        { id: 2, project: 10, name: 'Kickoff', date: '2026-11-02', background: { color: '#ffd900' }, font: { weight: 'bold' } },
        { id: 3, parent: 1, project: 10, name: '両方', date: '2026-11-20' },
    ]));

    assert.deepEqual(data.milestones, [
        { id: 1, parent: 2, name: 'Release', date: '2026-11-15', stroke: { color: '#0e9aa7' } },
        { id: 2, project: 10, name: 'Kickoff', date: '2026-11-02', background: { color: '#ffd900' }, font: { weight: 'bold' } },
        { id: 3, parent: 1, name: '両方', date: '2026-11-20' },
    ]);
    assert.equal(data.count, 4);
});

test('描けないマイルストーン (実在しない日・日付が無い・親の行が無い) は、返さない', ()=> {
    const data = buildScheduleData(collections([
        { id: 1, parent: 2, name: 'OK', date: '2026-11-15' },
        { id: 2, parent: 2, name: '実在しない日', date: '2026-02-30' },
        { id: 3, parent: 2, name: '日付が無い' },
        { id: 4, parent: 9, name: '無い WBS', date: '2026-11-15' },
        { id: 5, project: 99, name: '無いプロジェクト', date: '2026-11-15' },
        { id: 6, name: 'parent も project も無い', date: '2026-11-15' },
        { id: 7, parent: 9, project: 10, name: 'parent の先が無い (project は見ない)', date: '2026-11-15' },
    ]));

    assert.deepEqual(data.milestones.map(d=> d.id), [1]);
    assert.equal(data.count, 2);
});

test('マイルストーンの日付を、表示する期間 (first・last) に入れる', ()=> {
    const data = buildScheduleData(collections([
        { id: 1, parent: 2, name: '前', date: '2026-09-15' },
        { id: 2, project: 10, name: '後', date: '2027-01-10' },
        { id: 3, parent: 2, name: '期間の中', date: '2026-11-15' },
    ]));

    assert.equal(data.first, '2026-09-15');
    assert.equal(data.last, '2027-01-10');

    // 表示する期間は、マイルストーンの日付を含む。(どのサイクルでも)
    for (const cycle of ['d', 'w', 'M']) {
        const scale = scheduleScale(data, cycle);

        assert.ok(scale.from <= '2026-09-15' && '2027-01-10' <= scale.to, `${cycle}: ${scale.from}〜${scale.to}`);
    }
});

test('ワークパッケージが無くても、描けるマイルストーンがあれば、図を描く (count が 0 でない)', ()=> {
    const data = buildScheduleData(collections([
        { id: 1, parent: 2, name: 'Release', date: '2026-11-15' },
    ], []));

    assert.equal(data.count, 1);
    assert.deepEqual(data.workpackages, []);
    assert.equal(data.first, '2026-11-15');
    assert.equal(data.last, '2026-11-15');
    assert.equal(data.wbs.length, 2);
    assert.equal(data.columns, 3);
});

test('ワークパッケージも、描けるマイルストーンも無いときは、count が 0 (知らせを出す)', ()=> {
    const data = buildScheduleData(collections([
        { id: 1, parent: 9, name: '無い WBS', date: '2026-11-15' },
    ], []));

    assert.equal(data.count, 0);
    assert.deepEqual(data.milestones, []);
    assert.equal(data.first, null);
});
