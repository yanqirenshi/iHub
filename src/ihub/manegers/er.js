import ENTITIES         from '../../data/er/entities.json';
import COLUMNS          from '../../data/er/columns.json';
import COLUMN_INSTANCES from '../../data/er/column_instances.json';
import PORTS            from '../../data/er/ports.json';
import RELATIONSHIPS    from '../../data/er/relationships.json';

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

// d3.er に渡すデータ (TABLES/COLUMNS/... のフラットな形式)。
const ER_DATA = {
    TABLES:           ENTITIES.map(table2d3er),
    COLUMNS:          COLUMNS,
    COLUMN_INSTANCES: COLUMN_INSTANCES,
    RELASHONSHIPS:    RELATIONSHIPS,
    PORTS:            PORTS,
};

export default ER_DATA;
