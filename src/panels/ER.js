import React, { useState, useEffect } from 'react';

import D3Er, { Rectum } from '@yanqirenshi/d3.er';

import Box from '@mui/material/Box';

import ER_DATA from '../data/ER.js';

export default function ER (props) {
    const source = ER_DATA;

    const [rectum] = useState(new Rectum({
        callbacks: props.callbacks,
        transform: {
            k: 0.7,
            x: 1000.0,
            y: 100.0,
        },
    }));
    const [graph_data, setGraphData] = React.useState(false);

    useEffect(()=> setGraphData(source), [source]);

    if (graph_data && !rectum.data())
        return rectum.data(graph_data);

    if (!graph_data || !rectum.data()) return null;

    return (
        <Box sx={{width:'100%', height:'100%'}}>
          <D3Er rectum={rectum}/>
        </Box>
    );
}
