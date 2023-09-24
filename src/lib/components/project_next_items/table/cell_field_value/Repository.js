import React from 'react';

import TableCell from '@mui/material/TableCell';

import * as val from '../../../common/value/index.js';

export default function Repository (props) {
    const value = props.value;

    const repository = value ? value.repository : null;

    return (
        <TableCell>
          {repository ? <val.Repository data={repository}/> : null}
        </TableCell>
    );
}
