// 艦橋 (Bridge) の Schedule (d3.yabane の矢羽根) に使うコレクションと、データの作り方。
//
// データは、WBS とは切り離して、data/master_schedule/ (0.7.0 以降) に持つ。
//   master_schedule/rows  … 行。配列の順のまま、上から行になる。({ id, name, description? })
//   master_schedule/items … 予定 (矢羽根)。({ id, parent (行の id), name, plan: { from, to } ('YYYY-MM-DD'), wbs? | url?, description? })
// どちらも、ファイルが無いときは、空として扱う。(サーバーが、スキーマの default を返す)
//
// 矢羽根を押したときの行き先は、予定の wbs (WBS のノードの id。/wbs/{id}) か url (新しいタブ)。どちらも無ければ、何もしない。(linkOf)

export const SCHEDULE_COLLECTIONS = [
    'master_schedule/rows',
    'master_schedule/items',
];

// 目盛りの単位。(dayjs の単位。'w' は週)
export const SCHEDULE_CYCLE = 'w';

// 1 週の幅 (図の座標)。表示する期間の長さに比例させる。
export const WEEK_WIDTH = 111;

// 行の名前の幅 (図の座標)。時間の目盛りは、この右から始まる。
export const ROW_WIDTH = 555;
export const ROW_MARGIN = 33;

// 行の名前に出せる文字の数。(全角 1・半角 0.55 として数える。行の幅 555 から、左の余白 33 を引いた分)
const LABEL_MAX_UNITS = 14;

const DAY = 24 * 60 * 60 * 1000;

// 'YYYY-MM-DD' を、実在する日付として読む。(UTC の 0 時の時刻。読めないときは null)
function parseDate (text) {
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(text);

    if (!m)
        return null;

    const time = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

    return new Date(time).toISOString().slice(0, 10)===text ? time : null;
}

const formatDate = (time)=> new Date(time).toISOString().slice(0, 10);

// 使える plan か。(日付として正しく、to が from より前でない。ihub-srv check が見つける誤りは、描かない)
function usablePlan (plan) {
    if (!plan || typeof plan!=='object')
        return false;

    const from = parseDate(plan.from);
    const to = parseDate(plan.to);

    return from!==null && to!==null && from <= to;
}

const unitOf = (ch)=> ch.codePointAt(0) > 0x7f ? 1 : 0.55;

function unitsOf (text) {
    let units = 0;

    for (const ch of text)
        units += unitOf(ch);

    return units;
}

// 行の名前。長いときは、末尾を … にして、max に収める。
export function rowLabel (name, max = LABEL_MAX_UNITS) {
    const text = String(name ?? '');

    if (unitsOf(text) <= max)
        return text;

    let units = 0;
    let out = '';

    for (const ch of text) {
        if (units + unitOf(ch) > max - 1)
            break;

        units += unitOf(ch);
        out += ch;
    }

    return out + '…';
}

// 予定を押したときの行き先。
//   戻り値: { type: 'wbs', id } | { type: 'url', url } | null (行き先が無い)
// wbs と url の両方があるときは、wbs。(ihub-srv check は、両方を書くことを誤りにする)
// url は、http か https だけ。(javascript: などは、押したときに動いてしまうので、開かない)
export function linkOf (item) {
    if (Number.isInteger(item?.wbs))
        return { type: 'wbs', id: item.wbs };

    if (typeof item?.url==='string' && /^https?:\/\//.test(item.url))
        return { type: 'url', url: item.url };

    return null;
}

// Schedule に渡すデータを作る。
//   rows         … d3.yabane の入力の wbs。([{ id, name }]) rows.json の順。
//   workpackages … d3.yabane の入力の workpackages。([{ id, parent, name, plan }]) 予定。
//   links        … { [予定の id]: linkOf の戻り値 } (行き先がある予定だけ)
//   count        … 矢羽根の数。(0 のとき、図は描かず、知らせを出す)
//   from・to     … 表示する期間。plan の一番早い from と、一番遅い to の、前後に 1 週の余白を付けたもの。
//   size         … 時間の目盛りの全体の幅 (図の座標)。期間に比例する。
// 予定が無いとき (ファイルが無いときも) は、count が 0。使えない plan (to が from より前・実在しない日) の予定と、
// parent の行が無い予定は、描かない。
export function buildScheduleData (collections) {
    const rows = collections['master_schedule/rows'] || [];
    const items = collections['master_schedule/items'] || [];

    const row_ids = new Set(rows.map(row=> row.id));
    const drawn = items.filter(item=> usablePlan(item.plan) && row_ids.has(item.parent));

    if (drawn.length===0)
        return { rows: [], workpackages: [], links: {}, count: 0, from: null, to: null, size: 0 };

    const froms = drawn.map(item=> parseDate(item.plan.from));
    const tos = drawn.map(item=> parseDate(item.plan.to));

    const from = Math.min(...froms) - 7 * DAY;
    const to = Math.max(...tos) + 7 * DAY;

    const weeks = Math.ceil((to - from) / (7 * DAY));

    const links = {};

    for (const item of drawn) {
        const link = linkOf(item);

        if (link)
            links[item.id] = link;
    }

    return {
        rows: rows.map(row=> ({ id: row.id, name: rowLabel(row.name) })),
        workpackages: drawn.map(item=> ({ id: item.id, parent: item.parent, name: item.name, plan: { from: item.plan.from, to: item.plan.to } })),
        links,
        count: drawn.length,
        from: formatDate(from),
        to: formatDate(to),
        size: Math.max(15, weeks) * WEEK_WIDTH,
    };
}
