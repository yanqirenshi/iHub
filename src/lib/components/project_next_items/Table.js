import React from 'react';

import TableContainer from '@mui/material/TableContainer';
import MTable from '@mui/material/Table';
import Paper from '@mui/material/Paper';

import Header from './table/Header.js';
import Body from './table/Body.js';

const columns = [
    { num:  1, show:  true, type: 'FIELD',     label: null,          dataType: 'TITLE',                name: null },
    { num:  2, show: false, type: 'FIELD',     label: null,          dataType: 'ASSIGNEES',            name: null },
    { num:  3, show: false, type: 'FIELD',     label: null,          dataType: 'LABELS',               name: null },
    { num:  4, show: false, type: 'FIELD',     label: null,          dataType: 'MILESTONE',            name: null },
    { num:  5, show:  true, type: 'FIELD',     label: null,          dataType: 'REPOSITORY',           name: null },
    { num:  7, show: false, type: 'FIELD',     label: null,          dataType: 'LINKED_PULL_REQUESTS', name: null },
    { num:  6, show: false, type: 'FIELD',     label: null,          dataType: 'REVIEWERS',            name: null },
    { num:  8, show: false, type: 'FIELD',     label: null,          dataType: 'TRACKS',               name: null },
    { num:  9, show:  true, type: 'ATTRIBUTE', label: 'type',        dataType: 'text',     value: (row)=>row.type() },
    { num: 10, show:  true, type: 'ATTRIBUTE', label: 'is_archived', dataType: 'text',     value: (row)=>row.isArchived() },
    { num: 11, show: false, type: 'ATTRIBUTE', label: 'created_at',  dataType: 'datetime', value: (row)=>row.createdAt() },
    { num: 12, show: false, type: 'ATTRIBUTE', label: 'updated_at',  dataType: 'datetime', value: (row)=>row.updatedAt() },
    { num: 13, show:  true, type: 'FIELD',     label: null,          dataType: 'TEXT',                 name: 'From' },
    { num: 14, show:  true, type: 'FIELD',     label: null,          dataType: 'DATE',                 name: 'Date.Due'},
    { num: 15, show:  true, type: 'FIELD',     label: null,          dataType: 'SINGLE_SELECT',        name: 'Status' },
];

export default function Table (props) {
    const sogh = props.sogh;

    const fields = props.fields.reduce(makeFields, {});

    const items = props.items;

    return (
        <TableContainer component={Paper}>
          <MTable sx={{ minWidth: 650 }} aria-label="simple table">
            <Header fields={fields} columns={columns} />

            <Body data={items}
                  fields={fields}
                  columns={columns}
                  sogh={sogh}/>
          </MTable>
        </TableContainer>
    );
}

function makeFields (ht, d) {
    const data_type = d.dataType;

    const is_multi_purpose = 'TEXT'===data_type || 'DATE'===data_type || 'SINGLE_SELECT'===data_type;

    if (is_multi_purpose && !ht[data_type])
        ht[data_type] = {};

    if (is_multi_purpose)
        ht[data_type][d.name] = d;
    else
        ht[data_type] = d;

    return ht;
}
