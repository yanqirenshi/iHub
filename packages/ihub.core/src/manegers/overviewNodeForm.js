// 艦橋の Overview のタブの「ノードの追加」のフォーム。(0.12.0 から。yanqirenshi/iHub#242。叩き台)
//
// フォームの項目・初めの値・入力の確かめ・保存するレコードの作り方を、ここにまとめる。
// 画面の部品 (components/panels/bridge/components/AddOverviewNode.js) は、OVERVIEW_NODE_FIELDS を見て、フォームを組み立てる。
// 項目を足す・消すときは、OVERVIEW_NODE_FIELDS だけを直す。(path の所に、値を書く)
//
// どれも、ただの関数。(何も読み込まない。node --test で、そのまま確かめる)

// フォームの項目。(並びは、フォームの並び)
//   key      … 入力の値の鍵
//   label    … 見出し。(Overview のインスペクタ (@yanqirenshi/model.unchi の fieldsOf) のラベルに合わせる)
//   path     … 保存するレコードの項目 ('size.w' など)
//   input    … 'text' (文字) か 'number' (数)
//   required … 必須か
//   initial  … 初めの値
//   fallback … 空のときに書く値。(無い項目は、空のとき、レコードに書かない)
export const OVERVIEW_NODE_FIELDS = [
    { key: 'text',        label: '名称',     path: 'label.text',       input: 'text',   required: true, initial: '' },
    { key: 'w',           label: '幅',       path: 'size.w',           input: 'number', initial: '160', fallback: 160 },
    { key: 'h',           label: '高さ',     path: 'size.h',           input: 'number', initial: '80',  fallback: 80 },
    { key: 'background',  label: '背景色',   path: 'background.color', input: 'text',   initial: '' },
    { key: 'border',      label: '枠線の色', path: 'border.color',     input: 'text',   initial: '' },
];

// 名称を置く所。(参照アプリのいまのノードと同じ、箱の中央)
export const NODE_LABEL_ALIGN = { align: 'center', valign: 'middle' };

// 新しいノードと、いまあるノードの右端との間。(図の座標)
export const NEW_NODE_GAP_X = 60;

// フォームの初めの値。({ text: '', w: '160', ... }。開き直したときも、これに戻す)
export function initialOverviewNodeForm () {
    return Object.fromEntries(OVERVIEW_NODE_FIELDS.map(f=> [f.key, f.initial]));
}

const trimmed = (v)=> String(v ?? '').trim();

// 入力の確かめ。誤りのある項目の鍵 → 誤りの文。(誤りが無ければ、空のオブジェクト)
//   数の項目は、0 より大きい数。
export function validateOverviewNodeForm (values) {
    const errors = {};

    for (const f of OVERVIEW_NODE_FIELDS) {
        const v = trimmed(values?.[f.key]);

        if (v==='') {
            if (f.required)
                errors[f.key] = `${f.label}を入力してください。`;
            continue;
        }

        if (f.input==='number' && !(Number.isFinite(Number(v)) && Number(v) > 0))
            errors[f.key] = `${f.label}は、0 より大きい数を入力してください。`;
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

// 保存するレコード。(id は API サーバーが振る。最上位のノードとして足す)
//   values … フォームの値。(validateOverviewNodeForm で確かめたもの)
//   nodes  … いまある最上位のノード。(data/overview/nodes.json。置く所を決めるのに使う)
// 空の項目は、書かない。(fallback のある項目は、fallback を書く) 数の項目は、数にする。
export function buildOverviewNodeRecord (values, nodes) {
    const record = { type: 'NODE', label: {} };

    for (const f of OVERVIEW_NODE_FIELDS) {
        const v = trimmed(values?.[f.key]);

        if (v==='') {
            if (f.fallback!==undefined)
                put(record, f.path, f.fallback);
            continue;
        }

        put(record, f.path, f.input==='number' ? Number(v) : v);
    }

    record.label = { ...record.label, ...NODE_LABEL_ALIGN };

    // 並びは、参照アプリのいまのノードに合わせる。(type・label・size・position・ほか)
    const { type, label, size, ...rest } = record;

    return { type, label, ...(size && { size }), position: newNodePosition(nodes), ...rest };
}
