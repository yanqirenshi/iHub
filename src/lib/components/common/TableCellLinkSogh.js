import React from 'react';

import TableCell from '@mui/material/TableCell';
import Link from '../common/Link.js';

export default function TableCellLinkSogh (props) {
    const obj = props.data;
    const sogh = props.sogh;
    const to = props.to;
    const children = props.children;

    const href = sogh.href(to, { id: obj.id() });

    return (
        <TableCell>
          <p style={{marginRight:22}}>
            <Link href={href}>
              {children}
            </Link>
          </p>
        </TableCell>
    );
}
