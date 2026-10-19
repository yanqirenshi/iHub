import { useMemo } from 'react';

import { useCollections } from '../redux/api/dataApi.js';

// d3.sitemap に渡すデータを作る。
// d3.sitemap はデータを書き換えるので、複製して渡す。
export function buildSitemapData ({ nodes, edges }) {
    return structuredClone({ nodes, edges });
}

export function useSitemapData () {
    const collections = useCollections();

    const nodes = collections['sitemap/nodes'];
    const edges = collections['sitemap/edges'];

    return useMemo(()=> buildSitemapData({ nodes, edges }), [nodes, edges]);
}
