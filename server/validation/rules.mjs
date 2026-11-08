// ドメインごとの、コレクションをまたぐ検査 (id の重複・参照の整合性)。
// 関数の引数はドメインのコレクション ({ entities: [...], ... })、戻り値はエラーのメッセージの配列。
// スキーマに合っているデータだけを渡す。

import { check as checkEr } from '@yanqirenshi/model.er';
import { check as checkTm } from '@yanqirenshi/model.tm';
import { check as checkSitemap } from '@yanqirenshi/model.sitemap';
import { check as checkDeployment } from '@yanqirenshi/model.deployment';

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

// ノードと線の図 (Overview)。(画面遷移図・システム構成図は @yanqirenshi/model.sitemap・model.deployment の check に移した。文言は同じ)
function checkGraph (domain, { nodes, edges }) {
    const errors = [];

    const node_ids = checkUnique(errors, `${domain}/nodes`, flatten(nodes));

    checkUnique(errors, `${domain}/edges`, edges);

    for (const edge of edges)
        for (const end of ['from', 'to'])
            if (!node_ids.has(edge[end].id))
                errors.push(`${domain}/edges: ${end}.id のノードが見つかりません。(id=${edge.id}, ${end}.id=${edge[end].id})`);

    return errors;
}

export const RULES = {
    wbs:        checkWbs,
    // ER・TM は階層形式 (d3.ter の形) で、検査は @yanqirenshi/model.er・model.tm が持つ。(文言はここの checkTm だったものと同じ)
    er:         (data)=> checkEr(data, 'er/'),
    tm:         (data)=> checkTm(data, 'tm/'),
    sitemap:    (data)=> checkSitemap(data, 'sitemap/'),
    deployment: (data)=> checkDeployment(data, 'deployment/'),
    overview:   (data)=> checkGraph('overview', data),
};
