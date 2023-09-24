import React from 'react';

export default function Link (props) {
    const children = props.children;

    const href = props.href;

    return (
        <a href={href}>
          {children}
        </a>
    );
}
