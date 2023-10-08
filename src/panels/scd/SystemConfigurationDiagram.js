import React from 'react';

import Box from '@mui/material/Box';

import D3Deployment, { Rectum } from '@yanqirenshi/d3.deployment';

import DEPLOYMENT_MANAGE_OVERVIEW_EDGE_DATA from '../../data/DEPLOYMENT_MANAGE_OVERVIEW_EDGE_DATA.js';
import DEPLOYMENT_MANAGE_OVERVIEW_NODE_DATA from '../../data/DEPLOYMENT_MANAGE_OVERVIEW_NODE_DATA.js';

const style = {
    width: '100%',
    height: '100%',
};

const graph_data = {
    nodes: DEPLOYMENT_MANAGE_OVERVIEW_NODE_DATA,
    edges: DEPLOYMENT_MANAGE_OVERVIEW_EDGE_DATA,
};

export default function SystemConfigurationDiagram (props) {
    const [rectum] = React.useState(new Rectum({
        transform: {
            k: 0.3,
            x: 1800.0,
            y: 700.0,
        },
    }));

    React.useEffect(()=>{
        rectum.data(graph_data);
    }, [rectum, graph_data]);

    return (
        <Box style={style}>
          <D3Deployment rectum={rectum} />
        </Box>
    );
}
