// ドメインごとの、コレクションをまたぐ検査 (id の重複・参照の整合性)。
// 関数の引数はドメインのコレクション ({ entities: [...], ... })、戻り値はエラーのメッセージの配列。
// スキーマに合っているデータだけを渡す。
// 2 つ目の引数 (all) は、データ全体 ({ 'wbs/projects': [...], ... })。ドメインをまたぐ検査に使う。
// データ全体の検証 (validateData・ihub-srv check) のときだけ渡る。(API サーバーがドメインごとに検証するときは、渡らないので、またぐ検査は飛ばす)

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

// マスタースケジュール (艦橋の Schedule タブ): 行と予定の id が、またいで一意なこと (矢羽根の図が、行と予定を同じ id で引くため)・
// 予定の parent の行があること・plan の日付が実在して、to が from より前でないこと・行き先が wbs と url の両方でないこと・
// wbs の id が WBS のノード (プロジェクト・WBS・ワークパッケージ) にあること。
function checkMasterSchedule ({ rows, items }, all = null) {
    const errors = [];

    checkUnique(errors, 'master_schedule', [...rows, ...items]);

    const row_ids = new Set(rows.map(d=> d.id));

    // wbs の id の検査は、WBS のデータが渡されたときだけ。(API サーバーのドメインごとの検証では、渡らない)
    const wbs_nodes = ['wbs/projects', 'wbs/wbs', 'wbs/workpackages'].map(name=> all?.[name]);
    const wbs_ids = wbs_nodes.every(Array.isArray)
          ? new Set(wbs_nodes.flatMap(list=> list.map(d=> d.id)))
          : null;

    for (const d of items) {
        if (!row_ids.has(d.parent))
            errors.push(`master_schedule/items: parent の行が見つかりません。(id=${d.id}, parent=${d.parent})`);

        const from = parseDate(d.plan.from);
        const to = parseDate(d.plan.to);

        if (from===null)
            errors.push(`master_schedule/items: plan.from が日付として正しくありません。(id=${d.id}, from=${d.plan.from})`);

        if (to===null)
            errors.push(`master_schedule/items: plan.to が日付として正しくありません。(id=${d.id}, to=${d.plan.to})`);

        if (from!==null && to!==null && to < from)
            errors.push(`master_schedule/items: plan.to が plan.from より前です。(id=${d.id}, from=${d.plan.from}, to=${d.plan.to})`);

        if (d.wbs!==undefined && d.url!==undefined)
            errors.push(`master_schedule/items: wbs と url は、両方は書けません。(id=${d.id})`);

        if (d.wbs!==undefined && wbs_ids && !wbs_ids.has(d.wbs))
            errors.push(`master_schedule/items: wbs の WBS のノードが見つかりません。(id=${d.id}, wbs=${d.wbs})`);
    }

    return errors;
}

// クラス図: クラスと関係の id の重複 (d3.classes は重複すると例外にする) と、関係の端のクラスがあること。
function checkClasses ({ classes, relationships }) {
    const errors = [];

    const ids = checkUnique(errors, 'classes/classes', classes);

    checkUnique(errors, 'classes/relationships', relationships);

    for (const d of relationships) {
        for (const end of ['from', 'to']) {
            const class_id = d[end].classId;

            if (class_id!==undefined && !ids.has(class_id))
                errors.push(`classes/relationships: ${end}.classId のクラスが見つかりません。(id=${d.id}, classId=${class_id})`);
        }
    }

    return errors;
}

export const RULES = {
    wbs:        checkWbs,
    master_schedule: checkMasterSchedule,
    classes:    checkClasses,
    // 図の検査は、図ごとの model.* パッケージが持つ。(文言は、もとここにあった検査と同じ)
    er:         (data)=> checkEr(data, 'er/'),
    tm:         (data)=> checkTm(data, 'tm/'),
    sitemap:    (data)=> checkSitemap(data, 'sitemap/'),
    deployment: (data)=> checkDeployment(data, 'deployment/'),
    overview:   (data)=> checkUnchi(data, 'overview/'),
};
