// ドメインごとの、コレクションをまたぐ検査 (id の重複・参照の整合性)。
// 関数の引数はドメインのコレクション ({ entities: [...], ... })、戻り値はエラーのメッセージの配列。
// スキーマに合っているデータだけを渡す。

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

    // plan (予定の期間) は、日付として正しく、to が from より前でないこと。
    for (const d of workpackages) {
        if (!d.plan)
            continue;

        const from = parseDate(d.plan.from);
        const to = parseDate(d.plan.to);

        if (from===null)
            errors.push(`wbs/workpackages: plan.from が日付として正しくありません。(id=${d.id}, from=${d.plan.from})`);

        if (to===null)
            errors.push(`wbs/workpackages: plan.to が日付として正しくありません。(id=${d.id}, to=${d.plan.to})`);

        if (from!==null && to!==null && to < from)
            errors.push(`wbs/workpackages: plan.to が plan.from より前です。(id=${d.id}, from=${d.plan.from}, to=${d.plan.to})`);
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
    classes:    checkClasses,
    // 図の検査は、図ごとの model.* パッケージが持つ。(文言は、もとここにあった検査と同じ)
    er:         (data)=> checkEr(data, 'er/'),
    tm:         (data)=> checkTm(data, 'tm/'),
    sitemap:    (data)=> checkSitemap(data, 'sitemap/'),
    deployment: (data)=> checkDeployment(data, 'deployment/'),
    overview:   (data)=> checkUnchi(data, 'overview/'),
};
