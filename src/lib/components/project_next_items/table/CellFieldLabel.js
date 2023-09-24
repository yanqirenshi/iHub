import React from 'react';

import TableCell from '@mui/material/TableCell';

const style = {
    whiteSpace: 'nowrap',
};

export default function CellFieldLabel (props) {
    const field = props.field;

    return (
        <TableCell style={style}>
          {field.name}
        </TableCell>
    );
}
