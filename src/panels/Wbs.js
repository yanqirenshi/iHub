import Box from '@mui/material/Box';

import Container from '@mui/material/Container';

import WBSTable from '../assemblies/WBSTable.js';

export default function Wbs () {
    return (
        <Box>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <WBSTable/>
            </Box>
          </Container>
        </Box>
    );
}
