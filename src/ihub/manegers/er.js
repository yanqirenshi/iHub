// ER 図 (d3.er) に使うコレクション。
// 階層形式 (d3.ter の TM と同じ形) で、@yanqirenshi/model.er のレコードそのもの。
export const ER_COLLECTIONS = [
    'er/schemas',
    'er/identifiers',
    'er/attributes',
    'er/entities',
    'er/relationships',
];

// d3.er に渡すデータ ({ schemas, identifiers, attributes, entities, relationships }) を作る。
// コレクションをそのまま渡せる形なので、変換はしない。
// 読み込んだデータは書き換えられず、d3.er はデータを書き換える (_core などを付ける) ので、複製して渡す。
export function buildErData (collections) {
    return structuredClone(Object.fromEntries(
        ER_COLLECTIONS.map(name=> [name.slice('er/'.length), collections[name]])));
}
