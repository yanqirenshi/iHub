// 艦橋 (Bridge) の Schedule (d3.yabane の矢羽根) に使うコレクションと、データの作り方。
//
// 矢羽根になるのは、予定の期間 plan ({ from, to }。'YYYY-MM-DD') を持つワークパッケージ。
// (data/wbs/workpackages.json の各レコードに、任意で書く)
// 行になるのは、plan のあるワークパッケージを、直接持つ WBS。
//
// d3.yabane の行 (Branch) は、入れ子にできない。(WBS の下に、WBS とワークパッケージを一緒に持てない)
// iHub の WBS は入れ子 (プロジェクト → WBS → WBS … → ワークパッケージ) なので、
// 行を、入れ子にしない 1 段の一覧にして、行の名前に、上の WBS の名前を入れる。(例: 'W-A / W-B')
// 並びは、WBS の木を、上から順にたどった順。(同じ親の下の行が、続く)
// 行が、2 つ以上のプロジェクトにあるときは、行の名前の先頭に、プロジェクトの名前を付ける。

export const SCHEDULE_COLLECTIONS = [
    'wbs/projects',
    'wbs/wbs',
    'wbs/workpackages',
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

// 長いときは、末尾を … にして、max に収める。
function cut (text, max) {
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

// 行の名前。上の WBS の名前を ' / ' でつなぐ。(parts は、上から順の名前)
// 長いときは、上の WBS の名前を、左から減らす。(いちばん下の WBS の名前を、残す)
export function rowLabel (parts, max = LABEL_MAX_UNITS) {
    let rest = parts;
    let prefix = '';

    while (rest.length > 1 && unitsOf(prefix + rest.join(' / ')) > max) {
        rest = rest.slice(1);
        prefix = '… / ';
    }

    return cut(prefix + rest.join(' / '), max);
}

// Schedule に渡すデータを作る。
//   rows         … d3.yabane の入力の wbs。([{ id, name }])
//   workpackages … d3.yabane の入力の workpackages。([{ id, parent, name, plan }])
//   count        … 矢羽根の数。(0 のとき、図は描かず、知らせを出す)
//   from・to     … 表示する期間。plan の一番早い from と、一番遅い to の、前後に 1 週の余白を付けたもの。
//   size         … 時間の目盛りの全体の幅 (図の座標)。期間に比例する。
export function buildScheduleData (collections) {
    const projects = collections['wbs/projects'] || [];
    const wbs = collections['wbs/wbs'] || [];
    const workpackages = (collections['wbs/workpackages'] || []).filter(wp=> usablePlan(wp.plan));

    if (workpackages.length===0)
        return { rows: [], workpackages: [], count: 0, from: null, to: null, size: 0 };

    // WBS の木。(parent は、プロジェクトか WBS の id)
    const children = new Map();

    for (const d of wbs) {
        if (!children.has(d.parent))
            children.set(d.parent, []);

        children.get(d.parent).push(d);
    }

    const holders = new Set(workpackages.map(wp=> wp.parent));

    // 上から順にたどって、plan のあるワークパッケージを持つ WBS を、行にする。
    const rows = [];

    const walk = (project, node, path)=> {
        for (const child of children.get(node.id) || []) {
            const parts = [...path, child.name];

            if (holders.has(child.id))
                rows.push({ id: child.id, name: parts, project });

            walk(project, child, parts);
        }
    };

    for (const project of projects)
        walk(project, project, []);

    // 木に結び付いていない WBS (parent が見つからない) は、読み込みの検査で見つかるので、ここでは描かない。
    const row_ids = new Set(rows.map(row=> row.id));
    const drawn = workpackages.filter(wp=> row_ids.has(wp.parent));

    if (drawn.length===0)
        return { rows: [], workpackages: [], count: 0, from: null, to: null, size: 0 };

    const multi = new Set(rows.map(row=> row.project.id)).size > 1;

    const froms = drawn.map(wp=> parseDate(wp.plan.from));
    const tos = drawn.map(wp=> parseDate(wp.plan.to));

    const from = Math.min(...froms) - 7 * DAY;
    const to = Math.max(...tos) + 7 * DAY;

    const weeks = Math.ceil((to - from) / (7 * DAY));

    return {
        rows: rows.map(row=> ({ id: row.id, name: rowLabel(multi ? [row.project.name, ...row.name] : row.name) })),
        workpackages: drawn.map(wp=> ({ id: wp.id, parent: wp.parent, name: wp.name, plan: { from: wp.plan.from, to: wp.plan.to } })),
        count: drawn.length,
        from: formatDate(from),
        to: formatDate(to),
        size: Math.max(15, weeks) * WEEK_WIDTH,
    };
}
