import React from 'react';

import Table from './repositories/Table.js';

export default function Repositories (props) {
    const data = props.data;
    const sogh = props.sogh;

    return (
        <div>
          <Table data={data} sogh={sogh}/>
        </div>
    );
}
