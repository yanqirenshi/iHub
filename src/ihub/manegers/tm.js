import { useMemo } from 'react';

import { useCollections } from '../redux/api/dataApi.js';

// d3.ter に渡すデータ一式を作る。
// d3.ter はデータを書き換える (ドラッグで position を変える) ので、複製して渡す。
export function buildTmData ({ identifiers, attributes, entities, relationships }) {
    return structuredClone({ identifiers, attributes, entities, relationships });
}

export function useTmData () {
    const collections = useCollections();

    const identifiers   = collections['tm/identifiers'];
    const attributes    = collections['tm/attributes'];
    const entities      = collections['tm/entities'];
    const relationships = collections['tm/relationships'];

    return useMemo(()=> buildTmData({ identifiers, attributes, entities, relationships }),
                   [identifiers, attributes, entities, relationships]);
}
