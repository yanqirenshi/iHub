// 艦橋の Cockpit タブに出す Issue を、絞る。(自分が担当で OPEN の Issue のうち、次のどちらかに当てはまるものだけ)
//   1. 今日が、Project の Plan の期間に入っている。(始まりの日 ≦ 今日 ≦ 終わりの日。当日を含む)
//   2. 1 に当てはまらなくても、NextAction.Date (NextAction. で始まる日付の項目) が入っている。(過ぎていても、先でもよい)
// どちらにも当てはまらない Issue は、出さない。並びは、NextAction.Date の近い順 (manegers/nextAction.js)。
//
// 判定は、日付 ('YYYY-MM-DD') の文字の比べ合いだけ。(日付の単位で比べる。時刻は見ない)
// Issue の Project の日付の値 (manegers/githubProject.js の fetchIssueDateValues) から、判定する。

import { todayString } from './nextAction.js';

// Plan の始まりと終わりの項目の名前。(iHub の Project は Plan.Start・Plan.End、Assholes の Project は Plan.From・Plan.To)
export const PLAN_START_FIELDS = ['Plan.Start', 'Plan.From'];
export const PLAN_END_FIELDS = ['Plan.End', 'Plan.To'];

// 1 つの Issue の日付の値から、Project ごとの Plan の期間を取り出す。
//   values … fetchIssueDateValues の、1 つの Issue ぶん ([{ project, field, date }])
//   戻り値: [{ project, from, to }]。始まりと終わりの**両方**が入っている Project だけ。(片方だけの Project は、入れない)
export function planRangesOf (values) {
    const projects = new Map();

    for (const value of values || []) {
        const key = value.project ?? '';
        const entry = projects.get(key) || { project: value.project ?? null, from: null, to: null };

        // 同じ Project に、始まりの項目が 2 つ以上あるときは、一番早い日。終わりは、一番遅い日。
        if (PLAN_START_FIELDS.includes(value.field) && (!entry.from || value.date < entry.from))
            entry.from = value.date;

        if (PLAN_END_FIELDS.includes(value.field) && (!entry.to || value.date > entry.to))
            entry.to = value.date;

        projects.set(key, entry);
    }

    return [...projects.values()].filter(entry=> entry.from && entry.to);
}

// 今日が、どれかの Project の Plan の期間に入っているか。(始まりの日と終わりの日の当日も含む)
//   ranges … planRangesOf の戻り値
// 始まりが終わりより後の期間 (入力の誤り) は、どの日も入らない。
export function isInPlan (ranges, today = todayString()) {
    return (ranges || []).some(range=> range.from <= today && today <= range.to);
}

// Cockpit タブに出すか。
//   plans       … その Issue の planRangesOf の戻り値
//   next_action … その Issue の NextAction の日付 (無ければ null)
export function isCockpitTarget ({ plans, next_action }, today = todayString()) {
    return isInPlan(plans, today) || !!next_action;
}

// items (カードなど) を、Cockpit タブに出すものだけに絞る。元の順のまま。(元の配列は変えない)
//   plans       … { [id]: planRangesOf の戻り値 }
//   next_actions … { [id]: 'YYYY-MM-DD' }
//   idOf        … items の要素の id を返す関数 (既定は、要素の id)
export function filterForCockpit (items, { plans, next_actions }, today = todayString(), idOf = (item)=> item.id) {
    return items.filter(item=> {
        const id = idOf(item);

        return isCockpitTarget({ plans: plans?.[id], next_action: next_actions?.[id] }, today);
    });
}
