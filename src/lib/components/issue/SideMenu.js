import React from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const style ={
    height: 'auto',
    item: {
        margin: 8,
        padding: 11,
    },
};

export default function SideMenu (props) {
    const data = props.data;
    const onChange = props.onChange;

    const list = data.list;
    const selected = data.selected;

    // onChange
    const click = (e)=> onChange(e.target.getAttribute('code'));

    return (
        <Box style={style}>
          {list.map(d=> {
              return (
                  <Paper key={d.code}
                         code={d.code}
                         elevation={selected===d.code ? 8 : 1}
                         style={style.item}
                         onClick={click}>
                    {d.label}
                  </Paper>
              );
          })}
        </Box>
    );
}
