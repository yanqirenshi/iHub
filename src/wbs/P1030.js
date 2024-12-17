import React from 'react';
import { useParams } from "react-router";

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// import {H, S} from 'tion';

import Frame from '../assemblies/frames/Frame.js';
import HeadWbsPage from '../parts/HeadWbsPage.js';
import WBSTable from '../assemblies/WBSTable.js';

import wbs from '../manegers/wbs.js';

export default function P1030 (props) {
    const params = useParams();

    const wbs_node = wbs.get(params.wbs_id);

    if (!wbs_node)
        return null;

    return (
        <Frame>
          <HeadWbsPage value={wbs_node}/>

          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
            </Box>
          </Container>

          <Container maxWidth="lg" sx={{pt:11}}>
            <Box>
              <WBSTable start_id={wbs_node._id}/>
            </Box>
          </Container>
        </Frame>
    );
}
