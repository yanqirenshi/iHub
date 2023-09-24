import React from 'react';

import TableCell from '@mui/material/TableCell';
import Link from '@mui/material/Link';

import LinkSogh from '../../../common/LinkSogh.js';

export default function Title (props) {
    const value = props.value;
    const row = props.row;
    const sogh = props.sogh;

    if ('ISSUE'===row.type()) {
        const issue = row.content();

        return (
            <TableCell>
              <span>
                <LinkSogh to="issue" data={{id: issue.id}} sogh={sogh}>
                  {issue.title}
                </LinkSogh>
              </span>

              <span style={{marginLeft:8}}>
                (
                <Link href={issue.url}>
                  {issue.number}
                </Link>
                )
              </span>
            </TableCell>
        );
    }

    if ('DRAFT_ISSUE'===row.type())
        return (
            <TableCell>
              {value.text}
            </TableCell>
        );

    return (
        <TableCell>
          {value.text}
        </TableCell>
    );
}
