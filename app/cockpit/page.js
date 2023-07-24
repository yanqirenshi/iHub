import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Frame from '@/ui/Frame.js';
// import Frame from '../../ui/Frame.js';

export default function Cockpit() {
    return (
        <Frame>
          <Box>
            <Button variant="text">Text</Button>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
          </Box>
        </Frame>
    );
}
