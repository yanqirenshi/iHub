// 艦橋 (Bridge) の Schedule (d3.yabane の矢羽根) に使うコレクションと、データの作り方。
//
// データは、WBS とは切り離して、data/master_schedule/ (0.7.0 以降) に持つ。
//   master_schedule/rows  … 行。配列の順のまま、上から行になる。({ id, name, description? })
//   master_schedule/items … 予定 (矢羽根)。({ id, parent (行の id), name, plan: { from, to } ('YYYY-MM-DD'), wbs? | url?, description? })
// どちらも、ファイルが無いときは、空として扱う。(サーバーが、スキーマの default を返す)
//
// 矢羽根を押したときの行き先は、予定の wbs (WBS のノードの id。/wbs/{id}) か url (新しいタブ)。どちらも無ければ、何もしない。(linkOf)
//
// 時間の目盛りのサイクルは、日・週・月から選べる。(0.7.0 以降。選んだものは、ブラウザに覚える。readCycle・writeCycle)
// 1 目盛り (1 日・1 週・1 か月) の幅は、どのサイクルでも UNIT_WIDTH にそろえる。(scheduleScale)

export const SCHEDULE_COLLECTIONS = [
    'master_schedule/rows',
    'master_schedule/items',
];

// 目盛りのサイクル。code は d3.yabane (dayjs) の単位。(月は大文字の 'M'。小文字の 'm' は、dayjs では分)
export const SCHEDULE_CYCLES = [
    { code: 'd', label: '日' },
    { code: 'w', label: '週' },
    { code: 'M', label: '月' },
];

// 覚えたものが無いときのサイクル。
export const DEFAULT_CYCLE = 'w';

// 1 目盛りの幅 (図の座標)。どのサイクルでも同じ。
export const UNIT_WIDTH = 111;

// 図の目盛りの、最小の数。(予定の期間が短くても、図が小さくなりすぎないように、表示する期間を右へ延ばす)
const MIN_UNITS = { d: 28, w: 15, M: 12 };

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

// Schedule に渡すデータを作る。(サイクルによらない部分。表示する期間と幅は scheduleScale)
//   rows         … d3.yabane の入力の wbs。([{ id, name, order }]) rows.json の順。
//                  d3.yabane 0.3.0 は、行を order の順 (無ければ開始日の順) に並べるので、配列の順を order に書く。
//   workpackages … d3.yabane の入力の workpackages。([{ id, parent, name, plan }]) 予定。
//                  order は書かない。(同じ行の予定は、d3.yabane が開始日の順に並べ、重なるものを下の段へ回す)
//   links        … { [予定の id]: linkOf の戻り値 } (行き先がある予定だけ)
//   count        … 矢羽根の数。(0 のとき、図は描かず、知らせを出す)
//   first・last  … 予定の一番早い from と、一番遅い to。('YYYY-MM-DD')
// 予定が無いとき (ファイルが無いときも) は、count が 0。使えない plan (to が from より前・実在しない日) の予定と、
// parent の行が無い予定は、描かない。
export function buildScheduleData (collections) {
    const rows = collections['master_schedule/rows'] || [];
    const items = collections['master_schedule/items'] || [];

    const row_ids = new Set(rows.map(row=> row.id));
    const drawn = items.filter(item=> usablePlan(item.plan) && row_ids.has(item.parent));

    if (drawn.length===0)
        return { rows: [], workpackages: [], links: {}, count: 0, first: null, last: null };

    const froms = drawn.map(item=> parseDate(item.plan.from));
    const tos = drawn.map(item=> parseDate(item.plan.to));

    const links = {};

    for (const item of drawn) {
        const link = linkOf(item);

        if (link)
            links[item.id] = link;
    }

    return {
        rows: rows.map((row, i)=> ({ id: row.id, name: rowLabel(row.name), order: i })),
        workpackages: drawn.map(item=> ({ id: item.id, parent: item.parent, name: item.name, plan: { from: item.plan.from, to: item.plan.to } })),
        links,
        count: drawn.length,
        first: formatDate(Math.min(...froms)),
        last: formatDate(Math.max(...tos)),
    };
}

// ---- サイクルごとの、表示する期間と幅 -------------------------------------------------
// 日付は UTC の時刻で数える。(タイムゾーンや夏時間に左右されない。d3.yabane には 'YYYY-MM-DD' で渡す)

// サイクルの初めの日。(週は日曜始まり。d3.yabane (dayjs の startOf('week')) と同じ)
function startOfCycle (time, cycle) {
    const d = new Date(time);

    if (cycle==='M')
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);

    if (cycle==='w')
        return time - d.getUTCDay() * DAY;

    return time;
}

// n サイクル先の、サイクルの初めの日。(time はサイクルの初めの日)
function addCycles (time, cycle, n) {
    if (cycle==='M') {
        const d = new Date(time);

        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
    }

    return time + n * (cycle==='w' ? 7 : 1) * DAY;
}

// a から b まで (どちらもサイクルの初めの日) の、サイクルの数。
function cyclesBetween (a, b, cycle) {
    if (cycle==='M') {
        const x = new Date(a);
        const y = new Date(b);

        return (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + (y.getUTCMonth() - x.getUTCMonth());
    }

    return Math.round((b - a) / ((cycle==='w' ? 7 : 1) * DAY));
}

// 使えるサイクルか。
export function isCycle (cycle) {
    return SCHEDULE_CYCLES.some(c=> c.code===cycle);
}

// サイクルに合わせた、表示する期間と、時間の目盛りの全体の幅。
//   from・to … 表示する期間 ('YYYY-MM-DD')。予定の前後に、1 目盛りずつの余白を付け、サイクルの初めと終わりにそろえる。
//   units    … 目盛りの数。(最小は MIN_UNITS。足りないときは、右へ延ばす)
//   size     … units × UNIT_WIDTH。(1 目盛りの幅が、どのサイクルでも UNIT_WIDTH になる。月は、月の日数で少し違う)
export function scheduleScale (data, cycle = DEFAULT_CYCLE) {
    if (!isCycle(cycle))
        cycle = DEFAULT_CYCLE;

    const first = parseDate(data?.first);
    const last = parseDate(data?.last);

    if (first===null || last===null)
        return { cycle, from: null, to: null, units: 0, size: 0 };

    const start = addCycles(startOfCycle(first, cycle), cycle, -1);
    const end = addCycles(startOfCycle(last, cycle), cycle, 1);   // 最後の目盛りの初めの日

    const units = Math.max(MIN_UNITS[cycle], cyclesBetween(start, end, cycle) + 1);

    return {
        cycle,
        from: formatDate(start),
        to: formatDate(addCycles(start, cycle, units) - DAY),
        units,
        size: units * UNIT_WIDTH,
    };
}

// ---- 選んだサイクルを、ブラウザに覚える ---------------------------------------------------
// 鍵は、図の位置 (manegers/diagram.js の useDiagramView) と同じく、アプリの名前の下に置く。
export const CYCLE_KEY = (app_name)=> `ihub:${app_name}:schedule:cycle`;

// localStorage が使えないときも、このページの中では、選んだものを引き継ぐ。
const cycleMemory = new Map();

// 覚えたサイクル。無い・壊れている・localStorage が使えないときは、DEFAULT_CYCLE (週)。
export function readCycle (key) {
    try {
        const v = JSON.parse(window.localStorage.getItem(key));

        if (isCycle(v))
            return v;
    } catch (e) {
        // 使えない・壊れた値: 黙って、控え (無ければ週) を使う
    }

    return cycleMemory.get(key) || DEFAULT_CYCLE;
}

export function writeCycle (key, cycle) {
    if (!isCycle(cycle))
        return;

    cycleMemory.set(key, cycle);

    try {
        window.localStorage.setItem(key, JSON.stringify(cycle));
    } catch (e) {
        // 覚えられなくても、図は動く
    }
}
