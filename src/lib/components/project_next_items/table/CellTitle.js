import React from 'react';

import TableCell from '@mui/material/TableCell';

const style = {
    whiteSpace: 'nowrap',
};

export default function CellTitle (props) {
    const field = props.field;
    const row = props.row;

    return (
        <TableCell style={style}>
        </TableCell>
    );
}
