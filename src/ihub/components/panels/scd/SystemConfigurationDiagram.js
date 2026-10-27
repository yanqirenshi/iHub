import React from 'react';

import Box from '@mui/material/Box';

import D3Deployment, { Rectum } from '@yanqirenshi/d3.deployment';

import DiagramBox from '../../assemblies/DiagramBox.js';
import { DEPLOYMENT_COLLECTIONS, buildDeploymentData } from '../../../manegers/deployment.js';

const style = {
    width: '100%',
    height: '100%',
};

// ドラッグで動かしたノードの位置は、deployment/nodes に保存する。(子のノードは、親の中での位置)
const POSITIONS = { selector: 'g.node, g.component', collection: 'deployment/nodes' };

// 右クリックで出すインスペクタ。(core は入力のレコードそのもの。ノードもエッジも同じ)
const INSPECTOR = {
    title: (t)=> (t.label && t.label.text) || `${t.type || ''} ${t.id}`.trim(),
    fields: [
        { path: 'label.text', label: '名称' },
        { path: 'type',       label: '種類' },
        { path: 'id',         label: 'ID' },
    ],
};

export default function SystemConfigurationDiagram (props) {
    return (
        <DiagramBox names={DEPLOYMENT_COLLECTIONS}
                    build={buildDeploymentData}
                    positions={POSITIONS}
                    inspector={INSPECTOR}
                    render={(source, onInspect)=> <Diagram source={source} onInspect={onInspect}/>}/>
    );
}

function Diagram (props) {
    const graph_data = props.source;
    const onInspect = props.onInspect;

    const [rectum] = React.useState(new Rectum({
        transform: {
            k: 0.3,
            x: 1800.0,
            y: 700.0,
        },
        callbacks: {
            node: { contextmenu: (core)=> onInspect(core) },
            edge: { contextmenu: (core)=> onInspect(core) },
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
