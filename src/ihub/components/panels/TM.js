import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import D3Ter, {Rectum}  from '@yanqirenshi/d3.ter';

import DiagramBox from '../assemblies/DiagramBox.js';
import { TM_COLLECTIONS, buildTmData } from '../../manegers/tm.js';

// ドラッグで動かしたエンティティの位置は、tm/entities に保存する。
const POSITIONS = { selector: 'g.entity', collection: 'tm/entities' };

// 右クリックで出すインスペクタ。
const INSPECTOR = {
    title: (t)=> t.name,
    fields: [
        { path: 'name',        label: '名称' },
        { path: 'type',        label: '種類' },
        { path: 'description', label: '説明' },
        { path: 'id',          label: 'ID' },
    ],
};

export default function TM () {
    return (
        <DiagramBox names={TM_COLLECTIONS}
                    build={buildTmData}
                    positions={POSITIONS}
                    inspector={INSPECTOR}
                    render={(source, onInspect)=> <Diagram source={source} onInspect={onInspect}/>}/>
    );
}

function Diagram (props) {
    const [rectum, setRectum] = useState(null);
    const graph_data = props.source;
    const onInspect = props.onInspect;

    useEffect(()=> {
        if (rectum!==null) return;

        setRectum(new Rectum({
            transform: {
                k: 0.7,
                x: 400.0,
                y: 400.0,
            },
            svg: {
                style: {
                    background: '#fff',
                },
            },
            edge: { width: 6, color: '#333333' },
            callbacks: {
                entity: {
                    click: (node)=> {
                    },
                    // 渡るのは正規化後のデータ。元のレコードは _core に入っている。
                    contextmenu: (entity)=> onInspect(entity._core || entity),
                }
            }
        }));
    }, [rectum, onInspect]);

    useEffect(()=> {
        if (rectum)
            rectum.data(graph_data);
    }, [rectum, graph_data]);

    if (!rectum)
        return null;

    return (
        <Box sx={{width:'100%', height:'100%'}}>
          <D3Ter rectum={rectum} />
        </Box>
    );
}
