import { useMemo } from 'react';

import { useCollections } from '../redux/api/dataApi.js';

// d3.deployment に渡すデータを作る。
// d3.deployment はデータを書き換えるので、複製して渡す。
export function buildDeploymentData ({ nodes, edges }) {
    return structuredClone({ nodes, edges });
}

export function useDeploymentData () {
    const collections = useCollections();

    const nodes = collections['deployment/nodes'];
    const edges = collections['deployment/edges'];

    return useMemo(()=> buildDeploymentData({ nodes, edges }), [nodes, edges]);
}
