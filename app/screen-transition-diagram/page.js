import Frame from '@/frames/Frame.js';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

export default function ScreenTransitionDiagram () {
    return (
        <Frame>
          <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
            <Box>
              <S variant="h5">画面遷移</S>
            </Box>
          </Container>
        </Frame>
    );
}
