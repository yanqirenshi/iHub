import React from 'react';

import Box from '@mui/material/Box';

import D3Deployment, { Rectum } from '@yanqirenshi/d3.deployment';

import DEPLOYMENT_NODES from '../../../../data/deployment/nodes.json';
import DEPLOYMENT_EDGES from '../../../../data/deployment/edges.json';

const style = {
    width: '100%',
    height: '100%',
};

const graph_data = {
    nodes: DEPLOYMENT_NODES,
    edges: DEPLOYMENT_EDGES,
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
