import React from 'react';

import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';

import Cell from './Cell.js';

const sx = {
    row: {
        '&:last-child td, &:last-child th': { border: 0 }
    }
};

export default function Body (props) {
    const items = props.data;
    const fields = props.fields;
    const columns = props.columns;
    const sogh = props.sogh;

    return (
        <TableBody>
          {items.map((id) => {
              const row = sogh.projectV2Item(id);

              return (
                  <TableRow key={id} sx={sx.row}>
                    {columns.map((column,i)=> {
                        if (!column.show)
                            return null;

                        return (
                            <Cell key={i}
                                  row={row}
                                  column={column}
                                  fields={fields}
                                  sogh={sogh}/>
                        );
                    })}
                  </TableRow>
              );
          })}
        </TableBody>
    );
}
