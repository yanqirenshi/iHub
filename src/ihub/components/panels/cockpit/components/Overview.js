import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Unchi, { Rectum } from '@yanqirenshi/d3.unchi';

import { useDiagramData, useMoveRecord } from '../../../../manegers/diagram.js';
import { OVERVIEW_COLLECTIONS, buildOverviewData } from '../../../../manegers/overview.js';

// Cockpit の Overview タブ: d3.unchi (ポンチ絵) をコンテンツエリア一杯に表示する。
// 図のデータは data/overview/ にあり、ノードをドラッグすると、動かした位置を overview/nodes に保存する。
export default function Overview () {
    const { data, version } = useDiagramData(OVERVIEW_COLLECTIONS, buildOverviewData);
    const [move, error, closeError] = useMoveRecord('overview/nodes');

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* ほかからデータが変わったときは、図を作り直す */}
          <Diagram key={version} data={data} onMove={move}/>

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

    const [rectum, setRectum] = React.useState(null);

    React.useEffect(()=> {
        const r = new Rectum({
            transform: { k: 1.0, x: 120, y: 120 }, // 初期のズーム / パン
            callbacks: {
                node: {
                    // ドラッグの終わり。掴んだノードについてだけ、1 回呼ばれる。
                    // (子のノードは親の中での位置なので、親を動かしても変わらない)
                    dragend: (core, node, move)=> onMove.current(core.id, move),
                },
            },
        });

        r.data(data);

        setRectum(r);
    }, [data]);

    if (!rectum) return null;

    return <D3Unchi rectum={rectum}/>;
}
