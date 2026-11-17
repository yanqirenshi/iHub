// 艦橋 (Bridge) の Schedule (d3.yabane の矢羽根) に使うコレクションと、データの作り方。
//
// データは、WBS (data/wbs/) とは切り離して、data/master_schedule/ (0.7.0 以降) に持つ。形は d3.yabane の入力と同じ。(0.8.0 から)
//   master_schedule/projects     … プロジェクト。いちばん左の列に描く。({ id, name, description?, background?, stroke?, font? })
//   master_schedule/wbs          … WBS (行)。({ id, name, project?, parent?, description?, background?, stroke?, font? })
//   master_schedule/workpackages … ワークパッケージ (矢羽根)。({ id, name, plan: { from, to }, parent? | project?, wbs? | url?, ... })
// どれも、ファイルが無いときは、空として扱う。(サーバーが、スキーマの default を返す)
//
// 矢羽根を押したときの行き先は、ワークパッケージの wbs (data/wbs/ のノードの id。/wbs/{id}) か url (新しいタブ)。どちらも無ければ、何もしない。(linkOf)
//
// 時間の目盛りのサイクルは、日・週・月から選べる。(0.7.0 以降。選んだものは、ブラウザに覚える。readCycle・writeCycle)
// 1 目盛り (1 日・1 週・1 か月) の幅は、どのサイクルでも UNIT_WIDTH にそろえる。(scheduleScale)

export const SCHEDULE_COLLECTIONS = [
    'master_schedule/projects',
    'master_schedule/wbs',
    'master_schedule/workpackages',
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

// 行の名前の幅 (図の座標)。時間の目盛りは、行の名前の列の右から始まる。
//   入れ子が無いとき (列が 1 つ) は ROW_WIDTH。(0.7.0 と同じ)
//   入れ子があるとき (深さごとに列が分かれる。0.8.0 から) は、1 列を NESTED_ROW_WIDTH にして、列が増えても、時間軸が右へ行きすぎないようにする。
export const ROW_WIDTH = 555;
export const NESTED_ROW_WIDTH = 333;
export const ROW_MARGIN = 33;

// 列どうしの間 (d3.yabane の style.body.yabane.margin と同じ値)
export const COLUMN_GAP = 33;

// 行の名前の文字の大きさ (d3.yabane の既定)
const ROW_FONT_SIZE = 33;

// 行の名前に出せる文字の数。(全角 1・半角 0.55 として数える。行の幅 555 から、左の余白 33 を引いた分)
const LABEL_MAX_UNITS = 14;

// 列の数 (入れ子の深さの最大 + 1) に合わせた、1 列の幅。
export function rowColumnWidth (columns = 1) {
    return columns > 1 ? NESTED_ROW_WIDTH : ROW_WIDTH;
}

// 行の名前の列の、全体の幅。(d3.yabane の Branch.columnsWidth と同じ式。時間軸は、この右 (ROW_MARGIN の先) から始まる)
//   span … 幅を求める列の数 (既定は、全部の列)
export function columnsWidth (columns = 1, span = columns) {
    return span * rowColumnWidth(columns) + (span - 1) * COLUMN_GAP;
}

// 幅 width の箱に出せる、行の名前の文字の数。(全角 1・半角 0.55 として数える。左の余白 ROW_MARGIN を引き、1 文字ぶん余らせる)
// 入れ子の無い既定 (幅 555・文字 33) では LABEL_MAX_UNITS (14)。
export function labelUnits (width, font_size = ROW_FONT_SIZE) {
    return Math.max(1, Math.floor((width - ROW_MARGIN) / font_size) - 1);
}

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

// 見た目 (d3.yabane の共有型 background・stroke・font)。オブジェクトのものだけを写す。(0.8.0 から)
function lookOf (record) {
    const out = {};

    for (const key of ['background', 'stroke', 'font'])
        if (record[key] && typeof record[key]==='object' && !Array.isArray(record[key]))
            out[key] = { ...record[key] };

    return out;
}

// WBS の入れ子 (parent。0.8.0 から)。WBS の id → 親の WBS の id。(親の無い WBS は、入っていない)
// 無い WBS を指す parent と、輪になった入れ子の parent は、使わない。(ihub-srv check が知らせる誤り)
export function wbsParents (wbs) {
    const ids = new Set(wbs.map(d=> d.id));
    const parents = new Map();

    for (const d of wbs)
        if (d.parent!==undefined && d.parent!==null && ids.has(d.parent) && d.parent!==d.id)
            parents.set(d.id, d.parent);

    // 親をたどって、自分に戻るなら、輪。その WBS の parent を外して、輪を切る。
    for (const d of wbs) {
        const seen = new Set([d.id]);
        let id = parents.get(d.id);

        while (id!==undefined) {
            if (seen.has(id)) {
                parents.delete(d.id);
                break;
            }

            seen.add(id);
            id = parents.get(id);
        }
    }

    return parents;
}

// 木の節の鍵。(d3.yabane と同じく、プロジェクトと WBS は、同じ id でも別のもの)
const projectNode = (id)=> `p:${id}`;
const wbsNode = (id)=> `w:${id}`;

// Schedule に渡すデータを作る。(サイクルによらない部分。表示する期間と幅は scheduleScale)
//   projects     … d3.yabane の入力の projects。([{ id, name, order, background?, stroke?, font? }]) projects.json の順。
//   wbs          … d3.yabane の入力の wbs。([{ id, name, order, parent? | project?, background?, stroke?, font? }]) wbs.json の順。
//   workpackages … d3.yabane の入力の workpackages。([{ id, name, plan, parent? | project?, background?, stroke?, font? }])
//                  order は書かない。(同じ親の下のワークパッケージは、d3.yabane が開始日の順に並べ、重なるものを下の段へ回す)
//   columns      … 名前の列の数。(プロジェクトと WBS の木の深さの最大 + 1。プロジェクトも入れ子も無ければ 1)
//   links        … { [ワークパッケージの id]: linkOf の戻り値 } (行き先があるものだけ)
//   count        … 矢羽根の数。(0 のとき、図は描かず、知らせを出す)
//   first・last  … ワークパッケージの一番早い from と、一番遅い to。('YYYY-MM-DD')
//
// 並び: d3.yabane 0.4.0 は、兄弟を order の順 (無ければ開始日の順) に並べるので、プロジェクトと WBS には、配列の順を order に書く。
//   (同じ親の下の WBS は wbs.json の順。子の WBS を持つ節の直下のワークパッケージは、子の WBS のあとに、開始日の順で並ぶ)
// 親: WBS とワークパッケージは、parent (WBS) があれば parent、無ければ project の下に入る。(d3.yabane と同じ)
//   無い先を指すもの・輪になった入れ子は、ihub-srv check が知らせる誤り。描くときは、d3.yabane に渡す前に直す。
//   (WBS は、parent の先が無い・輪のときは最上位、project の先が無いときも最上位。ワークパッケージは、描かない)
// 名前: 箱の幅に収まるように、長いと末尾を … にする。(入れ子では、箱の幅が列ごとに違う)
// 予定が無いとき (ファイルが無いときも) は、count が 0。使えない plan (to が from より前・実在しない日) は、描かない。
export function buildScheduleData (collections) {
    const projects = collections['master_schedule/projects'] || [];
    const wbs = collections['master_schedule/wbs'] || [];
    const workpackages = collections['master_schedule/workpackages'] || [];

    const project_ids = new Set(projects.map(d=> d.id));
    const wbs_ids = new Set(wbs.map(d=> d.id));
    const parents = wbsParents(wbs);

    // WBS の親の節。(parent を書いていれば親の WBS (使えなければ最上位 (null))。parent が無ければ、使える project。それも無ければ最上位)
    const wbsParentNode = (d)=> parents.has(d.id)
          ? wbsNode(parents.get(d.id))
          : (d.parent===undefined || d.parent===null) && project_ids.has(d.project) ? projectNode(d.project) : null;

    // ワークパッケージの親の節。(parent があれば parent だけを見る。無ければ project。どちらの先も無ければ null = 描かない)
    const wpParentNode = (d)=> d.parent!==undefined && d.parent!==null
          ? (wbs_ids.has(d.parent) ? wbsNode(d.parent) : null)
          : (project_ids.has(d.project) ? projectNode(d.project) : null);

    const drawn = workpackages.filter(d=> usablePlan(d.plan) && wpParentNode(d)!==null);

    if (drawn.length===0)
        return { projects: [], wbs: [], workpackages: [], columns: 1, links: {}, count: 0, first: null, last: null };

    const froms = drawn.map(d=> parseDate(d.plan.from));
    const tos = drawn.map(d=> parseDate(d.plan.to));

    const links = {};

    for (const d of drawn) {
        const link = linkOf(d);

        if (link)
            links[d.id] = link;
    }

    // 深さ (プロジェクトと、最上位の WBS が 0)。親の節をたどる。
    const parent_node = new Map(wbs.map(d=> [wbsNode(d.id), wbsParentNode(d)]));
    const depthOf = (node)=> {
        let depth = 0;

        for (let p = parent_node.get(node); p; p = parent_node.get(p))
            depth++;

        return depth;
    };

    const depths = new Map([
        ...projects.map(d=> [projectNode(d.id), 0]),
        ...wbs.map(d=> [wbsNode(d.id), depthOf(wbsNode(d.id))]),
    ]);
    const columns = Math.max(0, ...depths.values()) + 1;

    // 子の WBS を持つ節。(その箱は 1 列。持たない箱は、右端の列まで伸びる。d3.yabane の Branch.calW と同じ)
    const has_children = new Set([...parent_node.values()].filter(Boolean));

    const label = (node, d)=> {
        const width = has_children.has(node)
              ? columnsWidth(columns, 1)
              : columnsWidth(columns, columns - depths.get(node));

        return rowLabel(d.name, labelUnits(width, d.font?.size || ROW_FONT_SIZE));
    };

    // d3.yabane に渡す、親の項目。(parent か project の、どちらか 1 つ)
    const parentFields = (node)=> {
        if (!node)
            return {};

        const id = Number(node.slice(2));

        return node.startsWith('w:') ? { parent: id } : { project: id };
    };

    return {
        projects: projects.map((d, i)=> ({
            id: d.id,
            name: label(projectNode(d.id), d),
            order: i,
            ...lookOf(d),
        })),
        wbs: wbs.map((d, i)=> ({
            id: d.id,
            name: label(wbsNode(d.id), d),
            order: i,
            ...parentFields(wbsParentNode(d)),
            ...lookOf(d),
        })),
        workpackages: drawn.map(d=> ({
            id: d.id,
            ...parentFields(wpParentNode(d)),
            name: d.name,
            plan: { from: d.plan.from, to: d.plan.to },
            ...lookOf(d),
        })),
        columns,
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
