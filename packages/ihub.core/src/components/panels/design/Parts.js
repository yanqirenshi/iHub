import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import WBSTable from '../../assemblies/WBSTable.js';

// start_id: この id のノードから下だけを出す。(無いときは "1")
export default function Parts (props) {
    const start_id = props.start_id || "1";

    return (
        <Box>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <WBSTable start_id={start_id}/>
            </Box>
          </Container>
        </Box>
    );
}
