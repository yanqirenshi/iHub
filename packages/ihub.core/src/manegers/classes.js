// クラス図 (d3.classes) のデータを、図に渡す形にする。(iHub 固有の部分)
//
//   図に渡す:         CLASSES_COLLECTIONS / buildClassesData(collections, { header })
//   ヘッダーの色:     headerOf(record, header)  … 設定の diagrams.classes.header ({ by, colors }) と、レコードの header
//
// 図ごとの知識 (編集できる項目・patch への変換・既定値・検査) は @yanqirenshi/model.classes が持つ。
// ここに残すのは、iHub のコレクション名と、端のクラスが無い関係を除くことと、設定によるヘッダーの色だけ。
import { getByPath } from '@yanqirenshi/model.core';

export const CLASSES_COLLECTIONS = [
    'classes/classes',
    'classes/relationships',
];

// 図に渡す関係の項目。(ほかの項目は、図には渡さない)
const RELATIONSHIP_TEXTS = ['label', 'fromMultiplicity', 'toMultiplicity', 'fromRole', 'toRole'];

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
// 名前は、文字列でも組でも、そのまま渡す。(d3.classes 0.14.0 は、どちらも受ける)
// 位置は、動かしたあとの位置を d3.classes が入力に書き戻さないので (0.14.0)、そのまま渡してよいが、
// 書いていないレコードのために 0, 0 を埋める。
function toClassInput (record, header) {
    const input = {
        id: String(record.id),
        name: record.name,
        position: { x: record.position?.x ?? 0, y: record.position?.y ?? 0 },
    };

    if (record.stereotype)
        input.stereotype = record.stereotype;

    if (Array.isArray(record.attributes))
        input.attributes = record.attributes;

    if (Array.isArray(record.methods))
        input.methods = record.methods;

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
