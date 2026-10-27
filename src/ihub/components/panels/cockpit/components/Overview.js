import React from 'react';

import Box from '@mui/material/Box';

import D3Unchi, { Rectum } from '@yanqirenshi/d3.unchi';

// 表示するデータ。(今は見本)
// 形は d3.unchi の入力データ ({ nodes, edges })。
const DATA = {
    nodes: [
        {
            type: 'NODE', id: 1,
            label: { text: 'iHub', font: { size: 18, weight: 'bold' } },
            padding: 40,
            size: { w: 200, h: 150 }, position: { x: 0, y: 0 },
            children: [
                { type: 'NODE', id: 11, label: { text: 'Cockpit', align: 'center', valign: 'middle' },
                  size: { w: 160, h: 80 }, position: { x: 0, y: 20 } },
                { type: 'NODE', id: 12, label: { text: 'Overview', align: 'center', valign: 'middle' },
                  size: { w: 160, h: 80 }, position: { x: 220, y: 20 } },
            ],
        },
        {
            type: 'NODE', id: 2,
            label: { text: 'Github', align: 'center', valign: 'middle' },
            size: { w: 160, h: 80 }, position: { x: 560, y: 60 },
        },
    ],
    edges: [
        { id: 100, from: { id: 11, position: 180 }, to: { id: 2, position: 90 } },
    ],
};

// Cockpit の Overview タブ: d3.unchi (ポンチ絵) をコンテンツエリア一杯に表示する。
export default function Overview () {
    const [rectum, setRectum] = React.useState(null);

    React.useEffect(()=> {
        const r = new Rectum({
            transform: { k: 1.0, x: 120, y: 120 }, // 初期のズーム / パン
        });

        r.data(DATA);

        setRectum(r);
    }, []);

    if (!rectum) return null;

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
          <D3Unchi rectum={rectum}/>
        </Box>
    );
}
