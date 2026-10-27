import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import D3Ter, {Rectum}  from '@yanqirenshi/d3.ter';

import DiagramBox from '../assemblies/DiagramBox.js';
import { TM_COLLECTIONS, buildTmData } from '../../manegers/tm.js';

// ドラッグで動かしたエンティティの位置は、tm/entities に保存する。
const POSITIONS = { selector: 'g.entity', collection: 'tm/entities' };

// 右クリックで出すインスペクタ。
// name は、文字列か、論理名と物理名の組 ({ logical, physical }) のどちらか。(スキーマの name)
// 読めない項目はインスペクタが出さないので、どちらの形でも並べておく。
const INSPECTOR = {
    title: (t)=> typeof t.name==='string' ? t.name : t.name?.logical,
    fields: [
        { path: 'name',          label: '名称' },
        { path: 'name.logical',  label: '論理名' },
        { path: 'name.physical', label: '物理名' },
        { path: 'type',          label: '種類' },
        { path: 'description',   label: '説明' },
        { path: 'id',            label: 'ID' },
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
