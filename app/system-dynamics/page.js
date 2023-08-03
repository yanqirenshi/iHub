import Frame from '@/frames/Frame.js';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function SystemDynamics () {
    return (
        <Frame>
          <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
            <Box>
              <S variant="h5">System Dynamics</S>
            </Box>
          </Container>
        </Frame>
    );
}
