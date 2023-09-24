import React from 'react';

import { DateTime } from 'luxon';

import TableCell from '@mui/material/TableCell';

const style = {
    whiteSpace: 'nowrap',
};

export default function TableCellDateTime (props) {
    const value = props.value;

    return (
        <TableCell style={style}>
          {fmt(value.date)}
        </TableCell>
    );
}

function fmt (v) {
    if (!v)
        return null;

    const dt = DateTime.fromISO(v);

    if (!dt.isValid)
        return null;

    return dt.toFormat('yyyy-LL-dd HH:mm');
}
