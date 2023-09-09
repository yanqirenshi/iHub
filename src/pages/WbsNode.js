import React from 'react';
import Box from '@mui/material/Box';
import S from '@mui/material/Typography';

import Frame from '../frames/Frame.js';

import Container from '@mui/material/Container';

import WBSTable from '../assemblies/WBSTable.js';

export default function WbsNode () {
  return (
      <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <S>WBS Node</S>
            </Box>
          </Container>
      </Frame>
  );
}
