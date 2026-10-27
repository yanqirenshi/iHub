import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Unchi, { Rectum } from '@yanqirenshi/d3.unchi';

import DiagramInspector from '../../../parts/DiagramInspector.js';
import { useDiagramData, useMoveRecord } from '../../../../manegers/diagram.js';
import { OVERVIEW_COLLECTIONS, buildOverviewData } from '../../../../manegers/overview.js';

// 右クリックで出すインスペクタ。(core は入力のレコードそのもの。ノードもエッジも同じ)
const INSPECTOR = {
    title: (t)=> (t.label && (typeof t.label==='string' ? t.label : t.label.text)) || `${t.type || ''} ${t.id}`.trim(),
    fields: [
        { path: 'label.text', label: '名称' },
        { path: 'type',       label: '種類' },
        { path: 'id',         label: 'ID' },
    ],
};

// Cockpit の Overview タブ: d3.unchi (ポンチ絵) をコンテンツエリア一杯に表示する。
// 図のデータは data/overview/ にあり、ノードをドラッグすると、動かした位置を overview/nodes に保存する。
// ノードやエッジを右クリックすると、右端にインスペクタを出す。
export default function Overview () {
    const { data, version } = useDiagramData(OVERVIEW_COLLECTIONS, buildOverviewData);
    const [move, error, closeError] = useMoveRecord('overview/nodes');

    const [target, setTarget] = React.useState(null);
    const onInspect = React.useCallback((t)=> setTarget(t), []);

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* ほかからデータが変わったときは、図を作り直す */}
          <Diagram key={version} data={data} onMove={move} onInspect={onInspect}/>

          <DiagramInspector target={target}
                            title={INSPECTOR.title}
                            fields={INSPECTOR.fields}
                            onClose={()=> setTarget(null)}/>

          {error &&
           <Alert severity="error" onClose={closeError}
                  sx={{ position: 'absolute', top: 8, left: 8, right: 8, whiteSpace: 'pre-wrap' }}>
             {error}
           </Alert>}
        </Box>
    );
}

function Diagram (props) {
    const data = props.data;

    // ドラッグの終わりには、いつも最新の onMove を呼ぶ。
    const onMove = React.useRef(props.onMove);
    onMove.current = props.onMove;

    const onInspect = React.useRef(props.onInspect);
    onInspect.current = props.onInspect;

    const [rectum, setRectum] = React.useState(null);

    React.useEffect(()=> {
        const r = new Rectum({
            transform: { k: 1.0, x: 120, y: 120 }, // 初期のズーム / パン
            callbacks: {
                node: {
                    // ドラッグの終わり。掴んだノードについてだけ、1 回呼ばれる。
                    // (子のノードは親の中での位置なので、親を動かしても変わらない)
                    dragend: (core, node, move)=> onMove.current(core.id, move),
                    contextmenu: (core)=> onInspect.current(core),
                },
                edge: {
                    contextmenu: (core)=> onInspect.current(core),
                },
            },
        });

        r.data(data);

        setRectum(r);
    }, [data]);

    if (!rectum) return null;

    return <D3Unchi rectum={rectum}/>;
}
