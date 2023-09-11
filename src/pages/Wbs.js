import React from 'react';

import Frame from '../assemblies/frames/Frame.js';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import WBSTable from '../assemblies/WBSTable.js';

export default function Wbs () {
  return (
      <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <WBSTable/>
            </Box>
          </Container>
      </Frame>
  );
}
