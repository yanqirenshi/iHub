import React from 'react';

import TableCell from '@mui/material/TableCell';

const style = {
    // whiteSpace: 'nowrap',
};

export default function TableCellSingleSelect (props) {
    const value = props.value;

    return (
        <TableCell style={style}>
          {value.name}
        </TableCell>
    );
}
