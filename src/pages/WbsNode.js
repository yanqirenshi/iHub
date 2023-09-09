import React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import S from '@mui/material/Typography';

import Frame from '../frames/Frame.js';
import Container from '@mui/material/Container';

// lazy loading
// https://qiita.com/kakken1988/items/9f14480c8a9f0abf7b3b
export default function WbsNode () {
    const {wbs_id} = useParams();

    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <S>WBS Node</S>
              <S>{wbs_id}</S>
            </Box>
          </Container>
        </Frame>
    );
}
