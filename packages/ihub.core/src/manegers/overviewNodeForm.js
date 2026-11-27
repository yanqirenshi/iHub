// 艦橋の Overview のタブの「ノードの追加」のフォーム。(0.12.0 から。yanqirenshi/iHub#242・#244。叩き台)
//
// フォームの項目・まとまり・初めの値・入力の確かめ・保存するレコードの作り方を、ここにまとめる。
// 画面の部品 (components/panels/bridge/components/AddOverviewNode.js。ドックの吹き出しの中のフォーム) は、
// OVERVIEW_NODE_FIELDS と OVERVIEW_NODE_GROUPS を見て、フォームを組み立てる。
// 項目を足す・消すときは、OVERVIEW_NODE_FIELDS だけを直す。(path の所に、値を書く)
//
// 入れなかった項目は、レコードに書かない。(d3.unchi の既定で描かれる)
//
// どれも、ただの関数。(何も読み込まない。node --test で、そのまま確かめる)

// まとまり。吹き出しの中では、まとまりごとのタブになる。(並びは、タブの並び。初めに開くのは、先頭の「基本」)
// まとまりの無い項目 (名称) は、タブの上に、いつも出す。
export const OVERVIEW_NODE_GROUPS = [
    { code: 'basic',      label: '基本' },
    { code: 'background', label: '背景' },
    { code: 'border',     label: '枠線' },
    { code: 'font',       label: '文字' },
    { code: 'other',      label: 'そのほか' },
];

// 選ぶ項目の「指定なし」。(レコードに書かない)
const UNSET = { value: '', label: '指定なし' };

// フォームの項目。(並びは、フォームの並び。まとまりの中も、この順)
//   key      … 入力の値の鍵
//   label    … 見出し。(Overview のインスペクタ (@yanqirenshi/model.unchi の fieldsOf) に同じ項目があれば、そのラベルに合わせる)
//   path     … 保存するレコードの項目 ('size.w' など)
//   group    … まとまり (OVERVIEW_NODE_GROUPS の code。吹き出しのタブ)。無ければ、タブの上に、いつも出す
//   input    … 'text' (1 行)・'textarea' (複数行)・'number' (数)・'select' (選ぶ)
//   check    … 文字の確かめ。'color' (CSS の色)・'url' (リンク)
//   range    … 数の範囲。{ gt } (より大きい)・{ ge } (以上)・{ le } (以下) を組み合わせる
//   options  … input が 'select' のときの選択肢。[{ value, label, record? }]
//              value はフォームの値。'' (初めの値) は、レコードに書かない。record があれば、value の代わりに、それを書く
//   required … 必須か
//   initial  … 初めの値
//   fallback … 空のときに書く値。(無い項目は、空のとき、レコードに書かない)
//   wide     … フォームの横幅いっぱいに置くか。(無い項目は、2 つずつ横に並べる)
export const OVERVIEW_NODE_FIELDS = [
    { key: 'text',        label: '名称',         path: 'label.text',         input: 'text',     required: true, initial: '', wide: true },
    { key: 'w',           label: '幅',           path: 'size.w',             input: 'number',   range: { gt: 0 }, group: 'basic', initial: '160', fallback: 160 },
    { key: 'h',           label: '高さ',         path: 'size.h',             input: 'number',   range: { gt: 0 }, group: 'basic', initial: '80',  fallback: 80 },

    { key: 'background',  label: '背景色',       path: 'background.color',   input: 'text',     check: 'color', group: 'background', initial: '' },
    { key: 'opacity',     label: '背景の不透明度', path: 'background.opacity', input: 'number',   range: { ge: 0, le: 1 }, group: 'background', initial: '' },

    { key: 'borderType',  label: '枠線の種類',   path: 'border.type',        input: 'select',   group: 'border', initial: '',
      options: [UNSET, { value: 'solid', label: '実線' }, { value: 'dashed', label: '破線' }, { value: 'dotted', label: '点線' }] },
    { key: 'border',      label: '枠線の色',     path: 'border.color',       input: 'text',     check: 'color', group: 'border', initial: '' },
    { key: 'borderWidth', label: '枠線の太さ',   path: 'border.width',       input: 'number',   range: { gt: 0 }, group: 'border', initial: '' },
    { key: 'radius',      label: '角の丸み',     path: 'border.r',           input: 'number',   range: { ge: 0 }, group: 'border', initial: '' },
    // 影は、書かなければ「あり」。(d3.unchi の葉の既定) 「なし」のときだけ shadow: false を書く。
    { key: 'shadow',      label: '影',           path: 'shadow',             input: 'select',   group: 'border', initial: '',
      options: [{ value: '', label: 'あり (既定)' }, { value: 'none', label: 'なし', record: false }] },

    { key: 'fontSize',    label: '文字の大きさ', path: 'label.font.size',    input: 'number',   range: { gt: 0 }, group: 'font', initial: '' },
    { key: 'fontColor',   label: '文字の色',     path: 'label.font.color',   input: 'text',     check: 'color', group: 'font', initial: '' },
    { key: 'fontWeight',  label: '文字の太さ',   path: 'label.font.weight',  input: 'select',   group: 'font', initial: '',
      options: [UNSET, { value: 'normal', label: '標準' }, { value: 'bold', label: '太字' }] },

    { key: 'description', label: '説明',         path: 'description',        input: 'textarea', group: 'other', initial: '', wide: true },
    { key: 'link',        label: 'リンク',       path: 'link.url',           input: 'text',     check: 'url', group: 'other', initial: '', wide: true },
];

// 名称を置く所。(参照アプリのいまのノードと同じ、箱の中央)
export const NODE_LABEL_ALIGN = { align: 'center', valign: 'middle' };

// 文字の既定。(d3.unchi で、label.font を丸ごと書かないときの値)
// label.font を一部だけ書くと、書いていない色は白 (#fff) になる。(assh0le の Label.build。yanqirenshi/iHub#244 のコメント)
// そのため、文字の大きさ・色・太さのどれかを入れたときは、入れなかったものに、この値を書いて、3 つともそろえる。
export const LABEL_FONT_DEFAULTS = { size: 16, color: '#333333', weight: 'normal' };

// 新しいノードと、いまあるノードの右端との間。(図の座標)
export const NEW_NODE_GAP_X = 60;

// フォームの初めの値。({ text: '', w: '160', ... }。開き直したときも、これに戻す)
export function initialOverviewNodeForm () {
    return Object.fromEntries(OVERVIEW_NODE_FIELDS.map(f=> [f.key, f.initial]));
}

// 誤りのある項目を持つ、初めのまとまり (タブ) の code。(誤りが無い・まとまりの無い項目だけの誤りなら null)
// 「作成」を押したとき、そのタブに切り替える。
export function firstGroupWithError (errors) {
    const group = OVERVIEW_NODE_GROUPS.find(g=> OVERVIEW_NODE_FIELDS.some(f=> f.group===g.code && errors?.[f.key]));

    return group ? group.code : null;
}

const trimmed = (v)=> String(v ?? '').trim();

// CSS の色か。(ブラウザの判定。Overview のインスペクタ (model.unchi の applyPatch) と同じ)
// ブラウザの外 (CSS が無いとき) は、確かめない。
export function isCssColor (value) {
    if (typeof CSS==='undefined' || typeof CSS.supports!=='function')
        return true;

    return CSS.supports('color', value);
}

// リンクとして書けるか。(http://・https:// で始まる URL か、/ で始まるアプリの中のパス。// で始まるものは、ほかのサイトなので外す)
export function isNodeLink (value) {
    return /^https?:\/\/\S/i.test(value) || /^\/(?!\/)/.test(value);
}

// 数の範囲の誤りの文。
function rangeMessage (label, range) {
    if (range.ge!==undefined && range.le!==undefined)
        return `${label}は、${range.ge} から ${range.le} までの数を入力してください。`;

    if (range.gt!==undefined)
        return `${label}は、${range.gt} より大きい数を入力してください。`;

    return `${label}は、${range.ge} 以上の数を入力してください。`;
}

function inRange (n, range) {
    return Number.isFinite(n)
        && (range.gt===undefined || n > range.gt)
        && (range.ge===undefined || n >= range.ge)
        && (range.le===undefined || n <= range.le);
}

// 入力の確かめ。誤りのある項目の鍵 → 誤りの文。(誤りが無ければ、空のオブジェクト)
//   isColor … 色の判定。(既定は isCssColor。テストで差し替える)
export function validateOverviewNodeForm (values, { isColor = isCssColor } = {}) {
    const errors = {};

    for (const f of OVERVIEW_NODE_FIELDS) {
        const v = trimmed(values?.[f.key]);

        if (v==='') {
            if (f.required)
                errors[f.key] = `${f.label}を入力してください。`;
            continue;
        }

        if (f.input==='number' && f.range && !inRange(Number(v), f.range))
            errors[f.key] = rangeMessage(f.label, f.range);

        else if (f.input==='select' && !f.options.some(o=> o.value===v))
            errors[f.key] = `${f.label}は、選択肢から選んでください。`;

        else if (f.check==='color' && !isColor(v))
            errors[f.key] = `${f.label}は、CSS の色 (#ff8800・orange など) を入力してください。`;

        else if (f.check==='url' && !isNodeLink(v))
            errors[f.key] = `${f.label}は、http:// か https:// で始まる URL か、/ で始まるパスを入力してください。`;
    }

    return errors;
}

// ノードの、図に描かれる大きさ。(子のノードがあるときは、子と padding を囲むまで広がる。d3.unchi の Hierarchy.fitting)
function drawnSize (node) {
    const w = Number(node?.size?.w) || 0;
    const h = Number(node?.size?.h) || 0;
    const children = Array.isArray(node?.children) ? node.children : [];

    if (children.length===0)
        return { w, h };

    const padding = Number(node.padding) || 0;
    const right  = Math.max(...children.map(c=> (Number(c.position?.x) || 0) + drawnSize(c).w));
    const bottom = Math.max(...children.map(c=> (Number(c.position?.y) || 0) + drawnSize(c).h));

    return { w: Math.max(w, right + padding * 2), h: Math.max(h, bottom + padding * 2) };
}

// 新しいノードを置く所。(最上位のノードに重ならない所)
//   いまある最上位のノードの右端 (position.x + 図に描かれる幅) の最大 + NEW_NODE_GAP_X、position.y の最小。
//   ノードが無ければ { x: 0, y: 0 }。
export function newNodePosition (nodes) {
    const list = Array.isArray(nodes) ? nodes : [];

    if (list.length===0)
        return { x: 0, y: 0 };

    const right = Math.max(...list.map(n=> (Number(n.position?.x) || 0) + drawnSize(n).w));
    const top   = Math.min(...list.map(n=> Number(n.position?.y) || 0));

    return { x: right + NEW_NODE_GAP_X, y: top };
}

// path ('size.w' など) の所に、値を書く。
function put (record, path, value) {
    const keys = path.split('.');
    let at = record;

    for (const key of keys.slice(0, -1))
        at = at[key] ??= {};

    at[keys[keys.length - 1]] = value;
}

// フォームの値を、レコードに書く値にする。
function recordValue (f, v) {
    if (f.input==='number')
        return Number(v);

    if (f.input==='select') {
        const option = f.options.find(o=> o.value===v);
        return option && 'record' in option ? option.record : v;
    }

    return v;
}

// 保存するレコード。(id は API サーバーが振る。最上位のノードとして足す)
//   values … フォームの値。(validateOverviewNodeForm で確かめたもの)
//   nodes  … いまある最上位のノード。(data/overview/nodes.json。置く所を決めるのに使う)
// 空の項目 (選ぶ項目の「指定なし」も) は、書かない。(fallback のある項目は、fallback を書く) 数の項目は、数にする。
// ただし、文字 (label.font) は、どれかを入れたら、3 つともそろえて書く。(LABEL_FONT_DEFAULTS)
export function buildOverviewNodeRecord (values, nodes) {
    const record = { type: 'NODE', label: {} };

    for (const f of OVERVIEW_NODE_FIELDS) {
        const v = trimmed(values?.[f.key]);

        if (v==='') {
            if (f.fallback!==undefined)
                put(record, f.path, f.fallback);
            continue;
        }

        put(record, f.path, recordValue(f, v));
    }

    // 文字は、どれかを入れたときだけ、3 つともそろえて書く。(LABEL_FONT_DEFAULTS)
    if (record.label.font)
        record.label.font = { ...LABEL_FONT_DEFAULTS, ...record.label.font };

    record.label = { ...record.label, ...NODE_LABEL_ALIGN };

    // 並びは、参照アプリのいまのノードに合わせる。(type・label・size・position・ほか)
    const { type, label, size, ...rest } = record;

    return { type, label, ...(size && { size }), position: newNodePosition(nodes), ...rest };
}
