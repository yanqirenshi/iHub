import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const style ={
};

export default function Attributes (props) {
    // const issue = props.issue;
    // const item = props.item;

    const value = null;
    return (
        <Box sx={style}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div>
              <DesktopDatePicker label="Next Action date"
                                 inputFormat="yyyy-LL-dd"
                                 value={value}
                                 onChange={()=> null}
                                 renderInput={(params) => <TextField {...params} />} />
            </div>

            <div>
              <DesktopDatePicker label="Due Date"
                                 inputFormat="yyyy-LL-dd"
                                 value={value}
                                 onChange={()=> null}
                                 renderInput={(params) => <TextField {...params} />} />
            </div>

            <div>
              <p>Labels</p>
            </div>

            <div>
              <p>Milestones</p>
            </div>

            <div>
              <p>Assignees</p>
            </div>

          </LocalizationProvider>
        </Box>
    );
}
