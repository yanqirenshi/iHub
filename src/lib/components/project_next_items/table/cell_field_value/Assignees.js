import React from 'react';

import TableCell from '@mui/material/TableCell';

import * as val from '../../../common/value/index.js';

export default function Assignees (props) {
    const value = props.value;

    const users = value ? value.users.nodes : [];

    return (
        <TableCell>
          {users.map(d=> <p><val.User data={d}/></p>)}
        </TableCell>
    );
}
