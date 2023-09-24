import React from 'react';

import Table from './projects_v2/Table.js';

export default function ProjectsV2 (props) {
    const data = props.data;
    const sogh = props.sogh;

    return (
        <div>
          <Table data={data} sogh={sogh}/>
        </div>
    );
}
