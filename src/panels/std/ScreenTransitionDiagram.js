import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import D3Sitemap, { Rectum } from '@yanqirenshi/d3.sitemap';

import SITEMAP_DATA from '../../data/SITEMAP_DATA.js';

const style = {
    background: '#f3f3f3',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
};

export default function ScreenTransitionDiagram (props) {
    const source= SITEMAP_DATA;

    const [rectum] = useState(new Rectum({
        transform:  {
            k: props.scale || 1.0,
            x: props.x || 0.0,
            y: props.y || 0.0,
        },
    }));

    const [graph_data, setGraphData] = useState(null);

    useEffect(()=> setGraphData(source), [source]);

    if (graph_data && !rectum.data())
        rectum.data(graph_data);

    if (!graph_data && !rectum.data()) return null;

    return (
        <Box sx={style}>
          <D3Sitemap rectum={rectum} />
        </Box>
    );
}
