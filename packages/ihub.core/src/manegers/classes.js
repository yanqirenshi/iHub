// クラス図 (d3.classes) の「図の知識」。
// データ (data/classes/) を d3.classes に渡す形にすることと、インスペクタの項目・入力を patch にすることを持つ。
// (TM の @yanqirenshi/model.tm に当たるもの。クラス図の model.* パッケージは無いので、iHub の中に置く)
//
//   図に渡す:         CLASSES_COLLECTIONS / buildClassesData(collections, { header })
//   ヘッダーの色:     headerOf(record, header)  … 設定の diagrams.classes.header ({ by, colors }) と、レコードの header
//   インスペクタ:     withDefaults(record, collection) / fieldsOf(record, collection) / titleOf(record)
//   patch への変換:   movePatch(record, position) / applyPatch(record, values, collection)
//
// collection は 'classes' (クラス) か 'relationships' (関係)。保存先は classes/{collection}。
// patch は JSON Merge Patch (null の項目は消す)。入力の誤りは ModelError (利用者向けの日本語) を投げる。
import { ModelError, changedValues, findById, getByPath, put, toLength, toNumber, toOption, toOptionalText } from '@yanqirenshi/model.core';

export { ModelError, findById };

export const CLASSES_COLLECTIONS = [
    'classes/classes',
    'classes/relationships',
];

// 関係の種類 (UML の 6 種)
export const RELATIONSHIP_TYPES = ['association', 'inheritance', 'realization', 'aggregation', 'composition', 'dependency'];

// 線を取り付ける辺 (その辺の中点)。角度 (0=真下・時計回り) でもよい
export const CONNECTION_SIDES = ['top', 'bottom', 'left', 'right'];

// 箱の幅の既定。(d3.classes は size.w が無いか 0 のとき 200 にする)
export const DEFAULT_WIDTH = 200;

// 図に渡す関係の項目。(ほかの項目は、図には渡さない)
const RELATIONSHIP_TEXTS = ['label', 'fromMultiplicity', 'toMultiplicity', 'fromRole', 'toRole'];

// ---- 図に渡す ----------------------------------------------------------------

// 名前を、d3.classes の名前 ({ physical, logical, description }) にする。
// 文字列は、論理名と物理名の両方にする。論理名が無いときは物理名を出す。
export function toName (name) {
    if (typeof name==='string')
        return { physical: name, logical: name, description: '' };

    const n = name || {};
    const logical = n.logical || n.physical || '';

    return { physical: n.physical || logical, logical, description: n.description || '' };
}

function toMember (member) {
    return typeof member==='string' ? member : { ...member, name: toName(member.name) };
}

function isObject (v) {
    return v!==null && typeof v==='object' && !Array.isArray(v);
}

// 2 つの header ({ background, font }) を重ねる。(後のほうを優先する)
function mergeHeader (base, over) {
    if (!base) return over;
    if (!over) return base;

    const out = { ...base, ...over };

    for (const key of ['background', 'font'])
        if (isObject(base[key]) && isObject(over[key]))
            out[key] = { ...base[key], ...over[key] };

    return out;
}

// クラスのヘッダー (クラス名の行) の見た目。無ければ undefined (塗らない)。
// 設定の header は { by, colors }。by はクラスのレコードの項目のパス (ドット区切り。例: 'layer')、
// colors は項目の値 → 色。色は文字列 (背景の色) か、d3.classes の header ({ background, font })。
// レコードに header があれば、設定の色に重ねる。(レコードのほうを優先する)
export function headerOf (record, header) {
    let style;

    if (header?.by && isObject(header.colors)) {
        const value = getByPath(record, header.by);
        const color = value===undefined || value===null ? undefined : header.colors[String(value)];

        if (typeof color==='string')
            style = { background: { color } };
        else if (isObject(color))
            style = color;
    }

    return mergeHeader(style, isObject(record.header) ? record.header : undefined);
}

// クラスのレコードを、d3.classes の ClassInput にする。
// position は新しいオブジェクトにする。(d3.classes はドラッグで position を書き換えるため)
function toClassInput (record, header) {
    const input = {
        id: String(record.id),
        name: toName(record.name),
        position: { x: record.position?.x ?? 0, y: record.position?.y ?? 0 },
    };

    if (record.stereotype)
        input.stereotype = record.stereotype;

    if (Array.isArray(record.attributes))
        input.attributes = record.attributes.map(toMember);

    if (Array.isArray(record.methods))
        input.methods = record.methods.map(toMember);

    if (record.size?.w)
        input.size = { w: record.size.w, h: record.size.h || 0 };

    if (typeof record.radius==='number')
        input.radius = record.radius;

    const style = headerOf(record, header);

    if (style)
        input.header = style;

    if (Array.isArray(record.description))
        input.description = record.description;

    return input;
}

function toEnd (end) {
    return end.classId!==undefined
        ? { classId: String(end.classId), point: end.point }
        : { x: end.x, y: end.y };
}

function toRelationshipInput (record) {
    const input = { id: String(record.id), type: record.type, from: toEnd(record.from), to: toEnd(record.to) };

    for (const key of RELATIONSHIP_TEXTS)
        if (typeof record[key]==='string' && record[key]!=='')
            input[key] = record[key];

    return input;
}

// d3.classes に渡すデータ ({ classes, relationships }) と、描けない関係 (skipped) を作る。
// 端のクラスが見つからない関係は、図が描けなくなるので渡さずに、skipped に入れる。
// (API の書き込みでは検証するが、エディタで直接変えたファイルは、起動のときには検証しないため)
export function buildClassesData (collections, { header } = {}) {
    const records = collections['classes/classes'] || [];
    const ids = new Set(records.map(d=> String(d.id)));
    const found = (end)=> end.classId===undefined || ids.has(String(end.classId));

    const relationships = [];
    const skipped = [];

    for (const record of collections['classes/relationships'] || []) {
        if (found(record.from) && found(record.to))
            relationships.push(toRelationshipInput(record));
        else
            skipped.push(record.id);
    }

    return {
        classes: records.map(record=> toClassInput(record, header)),
        relationships,
        skipped,
    };
}

// ---- インスペクタ ------------------------------------------------------------

function isRelationship (record) {
    return 'from' in record && 'to' in record;
}

// 保存先のコレクション。('classes' か 'relationships')
export function collectionOf (record) {
    return isRelationship(record) ? 'relationships' : 'classes';
}

const linesOf = (lines)=> Array.isArray(lines) ? lines.join('\n') : lines;

// インスペクタに渡すレコード。図に描いている値 (既定の幅) を埋め、説明 (配列) は改行でつないだ文字列にする。
// (インスペクタは、配列の項目を出せないため)
export function withDefaults (record) {
    const out = { ...record };

    if ('description' in record)
        out.description = linesOf(record.description);

    if (isRelationship(record))
        return out;

    out.size = { ...record.size, w: record.size?.w || DEFAULT_WIDTH };

    return out;
}

// 名前の項目。文字列なら name、組なら論理名・物理名・説明。
function nameFields (record) {
    if (typeof record.name==='string')
        return [{ path: 'name', label: '名前', type: 'text' }];

    return [
        { path: 'name.logical',     label: '論理名',       type: 'text' },
        { path: 'name.physical',    label: '物理名',       type: 'text' },
        { path: 'name.description', label: '名前の補足',   type: 'text' },
    ];
}

const SIDES_HINT = `${CONNECTION_SIDES.join(' / ')} か、角度 (0=真下・時計回り)`;

// 関係の端の項目。クラスに付いていれば classId と point、座標なら x と y。
function endFields (end, key, label) {
    if (end?.classId!==undefined)
        return [
            { path: `${key}.classId`, label: `${label}のクラス`, type: 'text' },
            { path: `${key}.point`,   label: `${label}の位置`,   type: 'text', options: [...CONNECTION_SIDES, '角度'] },
        ];

    return [
        { path: `${key}.x`, label: `${label}の x`, type: 'number' },
        { path: `${key}.y`, label: `${label}の y`, type: 'number' },
    ];
}

// 編集できる項目。(colonoscope の ModelInspector の fields)
export function fieldsOf (record) {
    if (isRelationship(record))
        return [
            { path: 'id',               label: 'id',           type: 'readonly' },
            { path: 'type',             label: '種類',         type: 'text', options: RELATIONSHIP_TYPES },
            ...endFields(record.from, 'from', '接続元'),
            ...endFields(record.to,   'to',   '接続先'),
            { path: 'label',            label: 'ラベル',       type: 'text' },
            { path: 'fromMultiplicity', label: '接続元の多重度', type: 'text' },
            { path: 'toMultiplicity',   label: '接続先の多重度', type: 'text' },
            { path: 'fromRole',         label: '接続元の端名', type: 'text' },
            { path: 'toRole',           label: '接続先の端名', type: 'text' },
            { path: 'description',      label: '説明',         type: 'textarea' },
        ];

    return [
        { path: 'id',          label: 'id',               type: 'readonly' },
        ...nameFields(record),
        { path: 'stereotype',  label: 'ステレオタイプ',   type: 'text' },
        { path: 'position.x',  label: 'x',                type: 'number' },
        { path: 'position.y',  label: 'y',                type: 'number' },
        { path: 'size.w',      label: '幅',               type: 'number' },
        { path: 'description', label: '説明',             type: 'textarea' },
    ];
}

// インスペクタの見出し。クラスは名前、関係はラベル (無ければ「種類 id」)。
export function titleOf (record) {
    if (isRelationship(record))
        return record.label || `${record.type || ''} ${record.id}`.trim();

    const name = toName(record.name);

    return name.logical || String(record.id);
}

// ---- patch への変換 ----------------------------------------------------------

// ドラッグで動かしたクラスの位置を保存する変更。(整数に丸める) 動いていなければ null。
export function movePatch (record, position) {
    const x = Math.round(position.x);
    const y = Math.round(position.y);

    if (record.position && Math.round(record.position.x)===x && Math.round(record.position.y)===y)
        return null;

    return { collection: 'classes', id: record.id, patch: { position: { x, y } } };
}

// 説明: 1 行 1 要素の配列。空なら null (項目を消す)
function toLines (value) {
    const lines = value.split(/\r?\n/).map(line=> line.trimEnd());

    while (lines.length > 0 && lines[lines.length - 1]==='')
        lines.pop();

    return lines.length > 0 ? lines : null;
}

function toCoordinate (value, label) {
    const n = toNumber(value);

    if (n===null)
        throw new ModelError(`${label}は、数で入力してください。`);

    return n;
}

// 線を取り付ける位置: 辺か、角度 (0 以上 360 未満の整数に正規化する)
function toPoint (value, label) {
    if (CONNECTION_SIDES.includes(value))
        return value;

    const n = toNumber(value);

    if (n===null)
        throw new ModelError(`${label}は、${SIDES_HINT} で入力してください。`);

    return ((Math.round(n) % 360) + 360) % 360;
}

function required (value, label) {
    if (value==='')
        throw new ModelError(`${label}を入力してください。`);

    return value;
}

function classPatch (record, values) {
    const patch = {};

    for (const [path, value] of changedValues(withDefaults(record), values, fieldsOf(record))) {
        switch (path) {
            case 'name':
                put(patch, path, required(value, '名前'));
                break;
            case 'name.logical':
            case 'name.physical':
            case 'name.description':
                put(patch, path, toOptionalText(value));
                break;
            case 'stereotype':
                put(patch, path, toOptionalText(value));
                break;
            case 'position.x':
                put(patch, path, toCoordinate(value, 'x'));
                break;
            case 'position.y':
                put(patch, path, toCoordinate(value, 'y'));
                break;
            case 'size.w':
                put(patch, path, toLength(value, '幅'));
                break;
            case 'description':
                put(patch, path, toLines(value));
                break;
            default:
                break;
        }
    }

    // 論理名と物理名の両方は消せない。
    if (isObject(record.name) && isObject(patch.name)) {
        const name = { ...record.name, ...patch.name };

        if (!name.logical && !name.physical)
            throw new ModelError('論理名か物理名を入力してください。');
    }

    // x と y は組で持つので、片方だけ変えたときも、もう片方を入れる。(position が無かったレコードのため)
    if (patch.position)
        patch.position = { x: record.position?.x ?? 0, y: record.position?.y ?? 0, ...patch.position };

    return patch;
}

const END_LABELS = { from: '接続元', to: '接続先' };

function relationshipPatch (record, values) {
    const patch = {};

    for (const [path, value] of changedValues(withDefaults(record), values, fieldsOf(record))) {
        const [head, key] = path.split('.');

        if ((head==='from' || head==='to') && key) {
            const label = END_LABELS[head];

            if (key==='classId')
                put(patch, path, required(value, `${label}のクラス`));
            else if (key==='point')
                put(patch, path, toPoint(value, `${label}の位置`));
            else
                put(patch, path, toCoordinate(value, `${label}の ${key}`));

            continue;
        }

        if (path==='type')
            put(patch, path, toOption(value, RELATIONSHIP_TYPES, '種類'));
        else if (path==='description')
            put(patch, path, toLines(value));
        else if (RELATIONSHIP_TEXTS.includes(path))
            put(patch, path, toOptionalText(value));
    }

    return patch;
}

// インスペクタの「適用」の値 (path → 文字列) を、保存する変更 ({ collection, id, patch }) にする。
// 変わった項目だけが patch に入る。
export function applyPatch (record, values) {
    const collection = collectionOf(record);
    const patch = collection==='relationships' ? relationshipPatch(record, values) : classPatch(record, values);

    return { collection, id: record.id, patch };
}
