import React from 'react';
import { useParams } from "react-router";

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// import {H, S} from 'tion';

import Frame from '../assemblies/frames/FrameWbsNode.js';
import HeadWbsPage from '../parts/HeadWbsPage.js';
import WBSTable from '../assemblies/WBSTable.js';

import wbs from '../manegers/wbs.js';

export default function P1032 (props) {
    return (
        <Frame>

          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
            </Box>
          </Container>

        </Frame>
    );
}
