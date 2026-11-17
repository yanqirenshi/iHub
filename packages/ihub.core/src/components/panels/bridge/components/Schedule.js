import React from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import D3Yabane, { Rectum, Pippala } from '@yanqirenshi/d3.yabane';

import { useConfig } from '../../../../config.js';
import { useDiagramData, useDiagramView } from '../../../../manegers/diagram.js';
import {
    CYCLE_KEY, ROW_MARGIN, ROW_WIDTH, SCHEDULE_COLLECTIONS, SCHEDULE_CYCLES, UNIT_WIDTH,
    buildScheduleData, readCycle, scheduleScale, writeCycle,
} from '../../../../manegers/schedule.js';

// 図のスタイル (d3.yabane のスタイル)。stage.w は、時間の目盛りの全体の幅。(表示する期間に比例させる)
const graphStyle = (size)=> ({
    stage: { w: size },
    head: { h: 33 },
    body: {
        h: null, w: null,
        columns: { h: 88, w: UNIT_WIDTH },
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

// 艦橋 (Bridge) の Schedule タブ: data/master_schedule/ の予定 (items) を、行 (rows) ごとに、d3.yabane の矢羽根で並べる。(0.7.0 以降)
// 見るだけ。矢羽根を押すと、予定の行き先へ移る。wbs があれば /wbs/{id}、url があれば新しいタブで開く。どちらも無ければ、何もしない。
// 予定は、items.json の各レコードの plan: { from, to } ('YYYY-MM-DD') に書く。
// 時間の目盛りのサイクル (日・週・月) は、右上のボタンで切り替える。選んだものは、ブラウザに覚える。(初めは週)
export default function Schedule () {
    const { data, version } = useDiagramData(SCHEDULE_COLLECTIONS, buildScheduleData);

    const { app } = useConfig();
    const cycle_key = CYCLE_KEY(app.name);
    const [cycle, setCycle] = React.useState(()=> readCycle(cycle_key));

    const changeCycle = (e, next)=> {
        // 選んでいるボタンをもう一度押したときは、null が来る。(選んだままにする)
        if (!next)
            return;

        writeCycle(cycle_key, next);
        setCycle(next);
    };

    if (data.count===0)
        return (
            // 左の余白は、サイドメニューにかからないようにする。(Cockpit タブの Monitor と同じ)
            <Box sx={{ pt: 3, px: '111px' }}>
              <Alert severity="info">
                予定がありません。
                {' '}<code>data/master_schedule/rows.json</code> に行を、<code>data/master_schedule/items.json</code> に予定を書くと、ここに出ます。
                (予定の例: <code>{'{'} "id": 1001, "parent": 1, "name": "画面の作成", "plan": {'{'} "from": "2026-11-01", "to": "2026-11-30" {'}'} {'}'}</code>。
                <code>parent</code> は、行の <code>id</code> です)
              </Alert>
            </Box>
        );

    // ほかからデータが変わったとき・サイクルを変えたときは、図を作り直す。(位置と拡大は、サイクルごとに保管した値で戻る)
    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <Diagram key={`${version}:${cycle}`} data={data} cycle={cycle}/>

          {/* 図の右上。(図にかぶらないように、背景を付ける。左はサイドメニューがあるので、右に置く) */}
          <ToggleButtonGroup value={cycle} exclusive size="small" onChange={changeCycle}
                             aria-label="目盛りのサイクル"
                             sx={{ position: 'absolute', top: 8, right: 16, bgcolor: 'background.paper' }}>
            {SCHEDULE_CYCLES.map(c=> (
                <ToggleButton key={c.code} value={c.code} aria-label={c.label} sx={{ px: 2 }}>
                  {c.label}
                </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
    );
}

// 予定を押したときの行き先へ移る。(行き先が無ければ、何もしない)
function open (link, navigate) {
    if (!link)
        return;

    if (link.type==='wbs')
        navigate(`/wbs/${link.id}`);
    else if (link.type==='url')
        window.open(link.url, '_blank', 'noopener,noreferrer');
}

function Diagram ({ data, cycle }) {
    const nav = useNavigate();

    // 矢羽根を押したときには、いつも最新の関数を呼ぶ。
    const navigate = React.useRef(nav);
    navigate.current = nav;

    const box = React.useRef(null);
    const [rectum, setRectum] = React.useState(null);

    // カメラ (移動位置と拡大縮小) を、ブラウザに保管して、次に開いたとき・作り直したときに戻す。
    // サイクルで図の幅が大きく変わるので、サイクルごとに分けて覚える。(図の code は schedule:d・schedule:w・schedule:M)
    const bindView = useDiagramView(`schedule:${cycle}`);

    React.useEffect(()=> {
        const scale = scheduleScale(data, cycle);
        const k = initialScale(box.current?.clientWidth || 1000, scale.size);

        const r = new Rectum({
            // 初めの位置: 左から 100px (サイドメニューの右)・上から 60px (目盛りの見出しを出す余白)。transform は、移動量に拡大の度合いを掛ける。
            // 見出しは、図の座標で、日・週が -112、月が約 -51 まで上に伸びる。(d3.yabane 0.3.0) 拡大の度合いは 0.4 までなので、60px に収まる。
            transform: { k, x: 100 / k, y: 60 / k },
            svg: { style: { background: '#ffffff' } },
        });

        bindView(r);

        const tree = new Pippala().build(scale.from, scale.to, { wbs: data.rows, workpackages: data.workpackages });

        r.data(r.chewing({
            scale: { cycle: scale.cycle, from: scale.from, to: scale.to, size: scale.size },
            style: graphStyle(scale.size),
            tree,
            events: { reaf: { click: (reaf)=> open(data.links[reaf.id()], navigate.current) } },
        }));

        setRectum(r);
    }, [bindView, data, cycle]);

    return (
        <Box ref={box} sx={{ width: '100%', height: '100%' }}>
          {rectum && <D3Yabane rectum={rectum}/>}
        </Box>
    );
}
