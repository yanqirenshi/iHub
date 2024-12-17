import React from 'react';
import { useParams } from "react-router";

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// import S from '@mui/material/Typography';

import Frame from '../assemblies/frames/Frame.js';
import HeadWbsPage from '../parts/HeadWbsPage.js';

import wbs from '../manegers/wbs.js';

export default function P1032 (props) {
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
        </Frame>
    );
}
