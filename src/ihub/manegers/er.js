import { useMemo } from 'react';

import { useCollections } from '../redux/api/dataApi.js';

// d3.er は、テーブルの位置と大きさを x/y/z と w/h で読む。
// データは position と size で持っているので、写しておく。
function table2d3er (table) {
    return {
        ...table,
        x: table.position.x,
        y: table.position.y,
        z: table.position.z,
        w: table.size.w,
        h: table.size.h,
    };
}

// d3.er に渡すデータ (TABLES/COLUMNS/... のフラットな形式) を作る。
// d3.er はデータを書き換えるので、複製して渡す。
export function buildErData ({ entities, columns, column_instances, ports, relationships }) {
    return structuredClone({
        TABLES:           entities.map(table2d3er),
        COLUMNS:          columns,
        COLUMN_INSTANCES: column_instances,
        RELASHONSHIPS:    relationships,
        PORTS:            ports,
    });
}

export function useErData () {
    const collections = useCollections();

    const entities         = collections['er/entities'];
    const columns          = collections['er/columns'];
    const column_instances = collections['er/column_instances'];
    const ports            = collections['er/ports'];
    const relationships    = collections['er/relationships'];

    return useMemo(()=> buildErData({ entities, columns, column_instances, ports, relationships }),
                   [entities, columns, column_instances, ports, relationships]);
}
