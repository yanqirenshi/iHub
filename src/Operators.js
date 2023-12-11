import React from 'react';

import Other from './operators/Other.js';

export default function Operators (props) {
    const root = props.root;

    if ('a'===root.code)
        return <Other root={root}/>;

    if ('b'===root.code)
        return <Other root={root}/>;

    if ('c'===root.code)
        return <Other root={root}/>;

    return <Other root={root}/>;
}
