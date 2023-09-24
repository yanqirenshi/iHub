import React from 'react';

import Link from '@mui/material/Link';

import {Label as L} from '../../../js/models/index.js';

const l = new L();

export default function Label (props) {
    const data = props.data;

    if (!data) return null;

    const style = {
        ...{
            background: '#'+data.color,
            color: l.fontColor('#'+data.color),
            padding: '3px 6px',
            borderRadius: 3,
        },
        ...props.style || {}
    };

    return (
        <Link href={data.url}>
          <span style={style}>
            {data.name}
          </span>
        </Link>
    );
}
