import * as React from 'react';
import Box from '@mui/material/Box';

export default function Root (props) {
    const operator = props.operator;

    const border_width = 6;

    const width = operator.size.w;
    const height = operator.size.h;
    const x = operator.position.x;
    const y = operator.position.y;

    return (
        <Box className="pair-color1"
             sx={{
                 position: 'fixed',
                 left: x,
                 top:  y,
                 maxWidth: width + 'px',
                 maxHeight: height + 'px',
                 borderRadius: width + 'px',
                 padding: border_width + 'px',
             }}>
          <Box sx={{
              width: (width - border_width * 2) + 'px',
              height: (height - border_width * 2) + 'px',
              borderRadius: (width - border_width * 2) + 'px',
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
