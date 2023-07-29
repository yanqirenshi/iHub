import * as React from 'react';
import Box from '@mui/material/Box';

export default function Root (props) {
    const operator = props.operator;

    const border_width = 6;

    return (
        <Box sx={{
            position: 'fixed',
            left: operator.position.x,
            top: operator.position.y,
            width: operator.size.w + 'px',
            height: operator.size.h + 'px',
            background: '#eee',
            borderRadius: operator.size.w + 'px',
            padding: border_width + 'px',
        }}>
          <Box sx={{
              width: (operator.size.w - border_width*2) + 'px',
              height: (operator.size.h - border_width*2) + 'px',
              borderRadius: (operator.size.w - border_width*2) + 'px',
              background: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
          }}>
            <p>{operator.label.val}</p>
          </Box>
        </Box>
    );
}
