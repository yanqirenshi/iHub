import React from 'react';

import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default function Header (props) {
    const fields = props.fields;
    const columns = props.columns;

    return (
        <TableHead>
          <TableRow>
            {columns.map((column,i)=> {
                if (!column.show)
                    return null;

                return (
                    <TableCell key={i}>
                      {getContents(column, fields)}
                    </TableCell>
                );
            })}
          </TableRow>
        </TableHead>
    );
}

function getContents (column, fields) {
    if ('ATTRIBUTE'===column.type)
        return column.label;

    if ('FIELD'===column.type) {
        const data_type = column.dataType;

        const field = fields[column.dataType];

        // TODO: とりあえず
        if (!field) return '?';

        let y;
        if ('DATE'===data_type || 'TEXT'===data_type || 'SINGLE_SELECT'===data_type)
            y = field[column.name];
        else
            y = field;

        // TODO: とりあえず
        if (!y) return '?';

        return y.name;
    }

    return null;
}
