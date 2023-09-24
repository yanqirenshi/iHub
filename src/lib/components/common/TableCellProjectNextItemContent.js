import React from 'react';

import TableCell from '@mui/material/TableCell';

import Link from './Link.js';
import LinkSogh from './LinkSogh.js';

export default function TableCellProjectNextItemContent (props) {
    const sogh = props.sogh;
    const item = props.data;

    const type = item.type();
    const content = item.content();

    if (type==='ISSUE') {
        const issue = sogh.issue(content.id) || sogh.node2issue(content);

        return (
            <TableCell>
              <LinkSogh sogh={sogh}
                        to="issue"
                        data={{id: issue.id()}}
                        style={{marginRight:6}}>
                {issue.title()}
              </LinkSogh>
              (
              <Link href={issue.url()}>
                {issue.number()}
              </Link>
              )
            </TableCell>
        );
    }

    if (type==='DRAFT_ISSUE')
        return (
            <TableCell>
            </TableCell>
        );

    // pull requests?
    return (
        <TableCell>
        </TableCell>
    );
}
