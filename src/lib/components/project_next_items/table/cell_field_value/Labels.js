import React from 'react';

import TableCell from '@mui/material/TableCell';

import * as val from '../../../common/value/index.js';

export default function Labels (props) {
    const value = props.value;

    const labels = value ? value.labels.nodes : [];

    return (
        <TableCell>
          {labels.map(d=> <val.Label key={d.id} data={d} style={{margin:1}}/>)}
        </TableCell>
    );
}
