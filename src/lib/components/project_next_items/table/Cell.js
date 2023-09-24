import React from 'react';

import TableCell from '@mui/material/TableCell';

import TableCellDateTime from '../../common/TableCellDateTime.js';
import TableCellSingleSelect from '../../common/TableCellSingleSelect.js';

import * as cell from './cell_field_value/index.js';

export default function Cell (props) {
    const row = props.row;
    const column = props.column;
    const fields = props.fields;
    const sogh = props.sogh;

    if ('ATTRIBUTE'===column.type) {
        const data_type = column.dataType;
        const val = column.value(row);

        switch (data_type) {
        case 'text':     return <TableCell>{val}</TableCell>;
        case 'datetime': return <TableCellDateTime data={val} />;
        default:         return <TableCell>{val}</TableCell>;
        }
    }

    if ('FIELD'===column.type) {
        const field = getField(fields, column);
        const val = getValue(row, field);

        if (!val)
            return <TableCell/>;

        switch (column.dataType) {
        case 'TEXT':                 return <TableCell>{val.text}</TableCell>;
        case 'DATE':                 return <TableCellDateTime value={val} />;
        case 'SINGLE_SELECT':        return <TableCellSingleSelect value={val}/>;
        case 'TITLE':                return <cell.Title value={val} row={row} sogh={sogh}/>;
        case 'ASSIGNEES':            return <cell.Assignees value={val} />;
        case 'LABELS':               return <cell.Labels value={val} />;
        case 'MILESTONE':            return <cell.Milestone value={val} />;
        case 'REPOSITORY':           return <cell.Repository value={val} />;
        case 'LINKED_PULL_REQUESTS': return <TableCell/>;// TODO: 未調整
        case 'REVIEWERS':            return <TableCell/>;// TODO: 未調整
        case 'TRACKS':               return <TableCell/>;// TODO: 未調整
        default:                     return <TableCell/>;
        }
    }

    return <TableCell/>;
}

function getValue (row, field) {
    if (!field)
        return null;

    return row.fieldValues().find(d=> field.id===d.field.id) || null;
}

function getField (fields, column) {
    const field = fields[column.dataType];

    if (!field)
        return null;

    if ('TEXT'===column.dataType ||
        'DATE'===column.dataType ||
        'SINGLE_SELECT'===column.dataType)
        return field[column.name];


    return fields[column.dataType];
}
