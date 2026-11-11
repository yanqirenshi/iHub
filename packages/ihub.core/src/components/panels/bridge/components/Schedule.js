import React from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Yabane, { Rectum, Pippala } from '@yanqirenshi/d3.yabane';

import { useDiagramData, useDiagramView } from '../../../../manegers/diagram.js';
import { ROW_MARGIN, ROW_WIDTH, SCHEDULE_COLLECTIONS, SCHEDULE_CYCLE, buildScheduleData } from '../../../../manegers/schedule.js';

// 図のスタイル (d3.yabane のスタイル)。stage.w は、時間の目盛りの全体の幅。(表示する期間に比例させる)
const graphStyle = (size)=> ({
    stage: { w: size },
    head: { h: 33 },
    body: {
        h: null, w: null,
        columns: { h: 88, w: 111 },
        row: { w: ROW_WIDTH, h: 88, margin: ROW_MARGIN, stroke: { color: '#aaa' }, font: { size: 33 } },
        yabane: { head: 11, h: 66, margin: 33, font: { size: 33 } },
    },
    foot: { h: 33 },
});

// 初めの拡大の度合い。図の全体の幅が、表示している幅に収まる度合い。(小さくしすぎない・大きくしすぎない)
function initialScale (width, size) {
    const k = (width * 0.95) / (ROW_WIDTH + ROW_MARGIN + size);

    return Math.min(0.4, Math.max(0.1, k));
}

// 艦橋 (Bridge) の Schedule タブ: 予定の期間 (plan) のあるワークパッケージを、d3.yabane の矢羽根で並べる。
// 見るだけ。矢羽根を押すと、そのワークパッケージのページ (/wbs/{id}) へ移る。
// 期間は、data/wbs/workpackages.json の各レコードの plan: { from, to } ('YYYY-MM-DD') に書く。
export default function Schedule () {
    const { data, version } = useDiagramData(SCHEDULE_COLLECTIONS, buildScheduleData);

    if (data.count===0)
        return (
            // 左の余白は、サイドメニューにかからないようにする。(Cockpit タブの Monitor と同じ)
            <Box sx={{ pt: 3, px: '111px' }}>
              <Alert severity="info">
                予定の期間 (plan) のあるワークパッケージがありません。
                {' '}<code>data/wbs/workpackages.json</code> に <code>plan: {'{'} from, to {'}'}</code> を書くと、ここに出ます。
                (例: <code>"plan": {'{'} "from": "2026-11-01", "to": "2026-11-30" {'}'}</code>)
              </Alert>
            </Box>
        );

    // ほかからデータが変わったときは、図を作り直す。(位置と拡大は、保管した値で戻る)
    return <Diagram key={version} data={data}/>;
}

function Diagram ({ data }) {
    const nav = useNavigate();

    // 矢羽根を押したときには、いつも最新の関数を呼ぶ。
    const navigate = React.useRef(nav);
    navigate.current = nav;

    const box = React.useRef(null);
    const [rectum, setRectum] = React.useState(null);

    // カメラ (移動位置と拡大縮小) を、ブラウザに保管して、次に開いたとき・作り直したときに戻す。
    const bindView = useDiagramView('schedule');

    React.useEffect(()=> {
        const k = initialScale(box.current?.clientWidth || 1000, data.size);

        const r = new Rectum({
            // 初めの位置: 左から 100px (サイドメニューの右)・上から 60px (月の名前を出す余白)。transform は、移動量に拡大の度合いを掛ける。
            transform: { k, x: 100 / k, y: 60 / k },
            svg: { style: { background: '#ffffff' } },
        });

        bindView(r);

        const tree = new Pippala().build(data.from, data.to, { wbs: data.rows, workpackages: data.workpackages });

        r.data(r.chewing({
            scale: { cycle: SCHEDULE_CYCLE, from: data.from, to: data.to, size: data.size },
            style: graphStyle(data.size),
            tree,
            events: { reaf: { click: (reaf)=> navigate.current(`/wbs/${reaf.id()}`) } },
        }));

        setRectum(r);
    }, [bindView, data]);

    return (
        <Box ref={box} sx={{ width: '100%', height: '100%' }}>
          {rectum && <D3Yabane rectum={rectum}/>}
        </Box>
    );
}
