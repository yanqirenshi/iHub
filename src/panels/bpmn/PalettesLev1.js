import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import Level1 from './Palettes/Level1.js';
import Level2 from './Palettes/Level2.js';

export default function Palettes () {
    return (
        <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
          <Level1/>
        </Container>
    );
}
