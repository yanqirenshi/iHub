import React from 'react';

import TableCell from '@mui/material/TableCell';

import * as val from '../../../common/value/index.js';

export default function Milestone (props) {
    const value = props.value;

    const milestone = value ? value.milestone : null;

    return (
        <TableCell>
          {milestone ? <val.Milestone data={milestone}/> : null}
        </TableCell>
    );
}
