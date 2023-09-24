import React from 'react';

import TableCell from '@mui/material/TableCell';

export default function Date (props) {
    const value = props.value;

    if (!value)
        return <TableCell></TableCell>;

    return (
        <TableCell>
          {value.date}
        </TableCell>
    );
}
