import React from 'react';

export default function LinkSogh (props) {
    const to = props.to;
    const data = props.data;
    const sogh = props.sogh;

    const children = props.children;

    const style = props.style;

    return (
        <a href={sogh.href(to, data)} style={style}>
          {children}
        </a>
    );
}
