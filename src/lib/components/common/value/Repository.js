import React from 'react';

import Link from '@mui/material/Link';

export default function Repository (props) {
    const data = props.data;

    if (!data) return null;

    return (
        <Link href={data.url}>
          {data.name}
        </Link>
    );
}
