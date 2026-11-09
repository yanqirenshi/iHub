// コックピットの Overview (d3.unchi のポンチ絵) に使うコレクション。
export const OVERVIEW_COLLECTIONS = [
    'overview/nodes',
    'overview/edges',
];

// d3.unchi に渡すデータを作る。
// 読み込んだデータは書き換えられないので、複製して渡す。
export function buildOverviewData (collections) {
    return structuredClone({
        nodes: collections['overview/nodes'],
        edges: collections['overview/edges'],
    });
}
