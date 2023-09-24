import React from 'react';

import Link from '@mui/material/Link';

export default function IssueTitle (props) {
    const issue = props.data;

    return (
        <p style={{margin:0}}>
          <span style={{marginRight:8}}>
            {issue.title()}
          </span>
          <span>
            (
            <Link href={issue.url()}>
              {issue.number()}
            </Link>
            )
          </span>
        </p>
    );
}
