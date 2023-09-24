import React from 'react';

import TableCell from '@mui/material/TableCell';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function SingleSelect (props) {
    const value = props.value;

    if (!value)
        return <TableCell></TableCell>;

    return (
        <TableCell>
          <FormControl variant="standard" sx={{ m: 0, minWidth: 120 }}>
            <Select value={value.optionId}
                    onChange={()=> null}>
              <MenuItem value={value.optionId}>
                {value.name}
              </MenuItem>
            </Select>
          </FormControl>
        </TableCell>
    );
}
