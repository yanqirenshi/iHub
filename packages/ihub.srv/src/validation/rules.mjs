// ドメインごとの、コレクションをまたぐ検査 (id の重複・参照の整合性)。
// 関数の引数はドメインのコレクション ({ entities: [...], ... })、戻り値はエラーのメッセージの配列。
// スキーマに合っているデータだけを渡す。
// 2 つ目の引数 (all) は、データ全体 ({ 'wbs/projects': [...], ... })。ドメインをまたぐ検査に使う。
// データ全体の検証 (validateData・ihub-srv check) のときだけ渡る。(API サーバーがドメインごとに検証するときは、渡らないので、またぐ検査は飛ばす)

import { check as checkClasses } from '@yanqirenshi/model.classes';
import { check as checkEr } from '@yanqirenshi/model.er';
import { check as checkTm } from '@yanqirenshi/model.tm';
import { check as checkSitemap } from '@yanqirenshi/model.sitemap';
import { check as checkDeployment } from '@yanqirenshi/model.deployment';
import { check as checkUnchi } from '@yanqirenshi/model.unchi';

// list の中で key の値が重複していれば、エラーにする。値の集合を返す。
function checkUnique (errors, label, list, key = 'id') {
    const values = new Set();

    for (const d of list) {
        if (values.has(d[key]))
            errors.push(`${label}: ${key} が重複しています。(${key}=${d[key]})`);

        values.add(d[key]);
    }

    return values;
}

// 入れ子のノード (children) を平らにする。
export function flatten (nodes) {
    return nodes.flatMap(node=> [node, ...flatten(node.children || [])]);
}

// 'YYYY-MM-DD' が、実在する日付か。(2026-02-30 のような日付は、null)
function parseDate (text) {
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(text);

    if (!m)
        return null;

    const time = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

    return new Date(time).toISOString().slice(0, 10)===text ? time : null;
}

function checkWbs ({ projects, wbs, workpackages }) {
    const errors = [];

    // id は、プロジェクト・WBS・ワークパッケージをまたいで一意にする。(URL とページのファイル名に使うため)
    checkUnique(errors, 'wbs', [...projects, ...wbs, ...workpackages]);

    const parents = new Set([...projects, ...wbs].map(d=> d.id));

    for (const d of wbs)
        if (!parents.has(d.parent))
            errors.push(`wbs/wbs: parent のプロジェクトか WBS が見つかりません。(id=${d.id}, parent=${d.parent})`);

    const wbs_ids = new Set(wbs.map(d=> d.id));

    for (const d of workpackages)
        if (!wbs_ids.has(d.parent))
            errors.push(`wbs/workpackages: parent の WBS が見つかりません。(id=${d.id}, parent=${d.parent})`);

    return errors;
}

// マスタースケジュール (艦橋の Schedule タブ。d3.yabane の入力と同じ形): プロジェクト (projects)・WBS (wbs)・ワークパッケージ (workpackages)。
//   - プロジェクトの id は、プロジェクトの中で一意。(d3.yabane は、プロジェクトを 'project-<id>' で引くので、WBS と同じ id でもよい)
//   - WBS とワークパッケージの id は、またいで一意。(d3.yabane が、同じ id で引くため)
//   - WBS の project のプロジェクトがあること・parent の WBS があること・入れ子が輪になっていないこと
//   - ワークパッケージは、parent (WBS の id) か project (プロジェクトの id) の、少なくとも 1 つがあり、その先があること
//     (両方があるときは、parent が優先。d3.yabane と同じ。誤りにはしない)
//   - plan の日付が実在して、to が from より前でないこと・行き先が wbs と url の両方でないこと
//   - 行き先の wbs (data/wbs/ のノードの id) が、WBS のドメインにあること。(データ全体の検証のときだけ)
function checkMasterSchedule ({ projects, wbs, workpackages }, all = null) {
    const errors = [];

    const project_ids = checkUnique(errors, 'master_schedule/projects', projects);

    checkUnique(errors, 'master_schedule', [...wbs, ...workpackages]);

    const wbs_ids = new Set(wbs.map(d=> d.id));

    for (const d of wbs) {
        if (d.project!==undefined && !project_ids.has(d.project))
            errors.push(`master_schedule/wbs: project のプロジェクトが見つかりません。(id=${d.id}, project=${d.project})`);

        if (d.parent!==undefined && !wbs_ids.has(d.parent))
            errors.push(`master_schedule/wbs: parent の WBS が見つかりません。(id=${d.id}, parent=${d.parent})`);
    }

    // 入れ子の輪。(自分を親にしたときも、輪) 親をたどって、自分に戻る WBS を、輪の中の WBS として知らせる。
    const parent_of = new Map(wbs.filter(d=> d.parent!==undefined).map(d=> [d.id, d.parent]));

    for (const d of wbs) {
        const seen = new Set();
        let id = d.parent;

        while (id!==undefined && wbs_ids.has(id) && !seen.has(id)) {
            if (id===d.id) {
                errors.push(`master_schedule/wbs: 入れ子が輪になっています。(id=${d.id})`);
                break;
            }

            seen.add(id);
            id = parent_of.get(id);
        }
    }

    // 行き先の wbs の検査は、WBS のドメイン (data/wbs/) のデータが渡されたときだけ。(API サーバーのドメインごとの検証では、渡らない)
    const nodes = ['wbs/projects', 'wbs/wbs', 'wbs/workpackages'].map(name=> all?.[name]);
    const node_ids = nodes.every(Array.isArray)
          ? new Set(nodes.flatMap(list=> list.map(d=> d.id)))
          : null;

    for (const d of workpackages) {
        if (d.parent===undefined && d.project===undefined)
            errors.push(`master_schedule/workpackages: parent (WBS の id) か project (プロジェクトの id) を書いてください。(id=${d.id})`);

        if (d.parent!==undefined && !wbs_ids.has(d.parent))
            errors.push(`master_schedule/workpackages: parent の WBS が見つかりません。(id=${d.id}, parent=${d.parent})`);

        if (d.project!==undefined && !project_ids.has(d.project))
            errors.push(`master_schedule/workpackages: project のプロジェクトが見つかりません。(id=${d.id}, project=${d.project})`);

        const from = parseDate(d.plan.from);
        const to = parseDate(d.plan.to);

        if (from===null)
            errors.push(`master_schedule/workpackages: plan.from が日付として正しくありません。(id=${d.id}, from=${d.plan.from})`);

        if (to===null)
            errors.push(`master_schedule/workpackages: plan.to が日付として正しくありません。(id=${d.id}, to=${d.plan.to})`);

        if (from!==null && to!==null && to < from)
            errors.push(`master_schedule/workpackages: plan.to が plan.from より前です。(id=${d.id}, from=${d.plan.from}, to=${d.plan.to})`);

        if (d.wbs!==undefined && d.url!==undefined)
            errors.push(`master_schedule/workpackages: wbs と url は、両方は書けません。(id=${d.id})`);

        if (d.wbs!==undefined && node_ids && !node_ids.has(d.wbs))
            errors.push(`master_schedule/workpackages: wbs (行き先) の WBS のノードが見つかりません。(id=${d.id}, wbs=${d.wbs})`);
    }

    return errors;
}

export const RULES = {
    wbs:        checkWbs,
    master_schedule: checkMasterSchedule,
    // 図の検査は、図ごとの model.* パッケージが持つ。(文言は、もとここにあった検査と同じ)
    classes:    (data)=> checkClasses(data, 'classes/'),
    er:         (data)=> checkEr(data, 'er/'),
    tm:         (data)=> checkTm(data, 'tm/'),
    sitemap:    (data)=> checkSitemap(data, 'sitemap/'),
    deployment: (data)=> checkDeployment(data, 'deployment/'),
    overview:   (data)=> checkUnchi(data, 'overview/'),
};
