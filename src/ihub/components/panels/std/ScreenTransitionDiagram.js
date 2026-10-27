import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import D3Sitemap, { Rectum } from '@yanqirenshi/d3.sitemap';

import DiagramBox from '../../assemblies/DiagramBox.js';
import { SITEMAP_COLLECTIONS, buildSitemapData } from '../../../manegers/sitemap.js';

const style = {
    background: '#f3f3f3',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
};

// ドラッグで動かした画面のノードの位置は、sitemap/nodes に保存する。
const POSITIONS = { selector: 'g.node', collection: 'sitemap/nodes' };

// 右クリックで出すインスペクタ。(core は入力のレコードそのもの)
const INSPECTOR = {
    title: (t)=> (t.label && t.label.contents) || String(t.id),
    fields: [
        { path: 'label.contents', label: '名称' },
        { path: 'node_type',      label: '種類' },
        { path: 'link.url',       label: 'URL' },
        { path: 'id',             label: 'ID' },
    ],
};

export default function ScreenTransitionDiagram (props) {
    return (
        <DiagramBox names={SITEMAP_COLLECTIONS}
                    build={buildSitemapData}
                    positions={POSITIONS}
                    inspector={INSPECTOR}
                    render={(source, onInspect)=> <Diagram {...props} source={source} onInspect={onInspect}/>}/>
    );
}

function Diagram (props) {
    const source = props.source;
    const onInspect = props.onInspect;

    const [rectum] = useState(new Rectum({
        transform:  {
            k: props.scale || 1.0,
            x: props.x || 0.0,
            y: props.y || 0.0,
        },
        callbacks: {
            node: {
                contextmenu: (core)=> onInspect(core),
            },
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
