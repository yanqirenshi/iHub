import React from 'react';

import TableCell from '@mui/material/TableCell';
import Link from '../common/Link.js';

export default function TableCellLinkGithub (props) {
    const obj = props.data;

    return (
        <TableCell align="right">
          <Link href={obj.url()}>
            {obj.number()}
          </Link>
        </TableCell>
    );
}
