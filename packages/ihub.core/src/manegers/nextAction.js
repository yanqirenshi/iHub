// 艦橋の Cockpit タブの Issue を、Project の NextAction.Date (次にやることの日) で並べる。

import { valuesByFieldPrefix } from './githubProject.js';

// 日付の項目の名前の頭。(NextAction.Date など。iHub#149 の日付の欄と同じ考え)
export const NEXT_ACTION_PREFIX = 'NextAction.';

// 1 つの Issue の NextAction の日付。
// Issue が複数の Project に入っていて、日付が違うときは、一番近い (早い) 日付。日付が無ければ null。
//   values … fetchIssueDateValues の、1 つの Issue ぶん
export function nextActionOf (values) {
    return valuesByFieldPrefix(values, NEXT_ACTION_PREFIX)[0]?.date ?? null;
}

// items を、NextAction の日付の近い (早い) 順に並べる。日付の無いものは、最後で、その中は元の順のまま。
//   dates … { [id]: 'YYYY-MM-DD' }
//   idOf  … items の要素の id を返す関数 (既定は、要素の id)
// 同じ日付のものも、元の順のまま。(元の配列は変えない)
export function orderByNextAction (items, dates, idOf = (item)=> item.id) {
    const keyed = items.map((item, index)=> ({ item, index, date: dates?.[idOf(item)] || null }));

    keyed.sort((a, b)=> {
        if (a.date && b.date)
            return a.date < b.date ? -1 : a.date > b.date ? 1 : a.index - b.index;

        if (a.date)
            return -1;

        if (b.date)
            return 1;

        return a.index - b.index;
    });

    return keyed.map(k=> k.item);
}

// 今日の日付 ('YYYY-MM-DD'。このパソコンの時刻での、今日)
export function todayString (now = new Date()) {
    const pad = (n)=> String(n).padStart(2, '0');

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// 過ぎた日付か。(今日より前。今日は、過ぎていない)
export function isOverdue (date, today = todayString()) {
    return !!date && date < today;
}
