import * as React from 'react';
import Box from '@mui/material/Box';

// 窓の全体に出す。(ページの読み込み中など)
// タブの中など、親の大きさに合わせるときは、width・height に '100%' を渡す。
//   width:  既定 '100vw'
//   height: 既定 '100vh'
export default function Loading (props) {
    const width = props.width || '100vw';
    const height = props.height || '100vh';

    return (
        <Box sx={{
            width,
            height,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          <p style={{
              fontSize:166,
              color: '#eee',
          }}>
            Loading ...
          </p>
        </Box>
    );
}
