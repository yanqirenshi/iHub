import React from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import D3Yabane, { Rectum, Pippala } from '@yanqirenshi/d3.yabane';

import { useConfig } from '../../../../config.js';
import { readDiagramView, useDiagramData, useDiagramView, writeDiagramView } from '../../../../manegers/diagram.js';
import {
    COLUMN_GAP, CYCLE_KEY, ROW_MARGIN, SCHEDULE_COLLECTIONS, SCHEDULE_CYCLES, UNIT_WIDTH, WIDTH_KEY,
    buildScheduleData, columnsWidth, headOfWidth, readCycle, readWidth, rowColumnWidth, scheduleScale, stepWidth,
    viewForWidth, writeCycle, writeWidth,
} from '../../../../manegers/schedule.js';

// 図のスタイル (d3.yabane のスタイル)。stage.w は、時間の目盛りの全体の幅。(表示する期間に比例させる)
// row.w は、行の名前の 1 列の幅。入れ子で列が増えるときは、細くする。(manegers/schedule.js の rowColumnWidth)
// head は、目盛りの見出し。100% より狭い幅の段では、見出しの文字を小さくする。(manegers/schedule.js の headOfWidth)
const graphStyle = (size, columns = 1, width = 100)=> ({
    stage: { w: size },
    head: { h: 33, ...headOfWidth(width) },
    body: {
        h: null, w: null,
        columns: { h: 88, w: UNIT_WIDTH },
        row: { w: rowColumnWidth(columns), h: 88, margin: ROW_MARGIN, stroke: { color: '#aaa' }, font: { size: 33 } },
        yabane: { head: 11, h: 66, margin: COLUMN_GAP, font: { size: 33 } },
    },
    foot: { h: 33 },
});

// 初めの拡大の度合い。図の全体 (行の名前の列と、時間の目盛り) の幅が、表示している幅に収まる度合い。(小さくしすぎない・大きくしすぎない)
function initialScale (width, size, columns = 1) {
    const k = (width * 0.95) / (columnsWidth(columns) + ROW_MARGIN + size);

    return Math.min(0.4, Math.max(0.1, k));
}

// 艦橋 (Bridge) の Schedule タブ: data/master_schedule/ のプロジェクト・WBS・ワークパッケージを、d3.yabane の矢羽根で並べる。(0.7.0 以降)
// プロジェクトは、いちばん左の列。(0.8.0 から) その右に、WBS が入れ子の列で並び、ワークパッケージが矢羽根になる。
// 見るだけ。矢羽根を押すと、ワークパッケージの行き先へ移る。wbs があれば /wbs/{id}、url があれば新しいタブで開く。どちらも無ければ、何もしない。
// 予定の期間は、workpackages.json の各レコードの plan: { from, to } ('YYYY-MM-DD') に書く。
// 時間の目盛りのサイクル (日・週・月) は、右上のボタンで切り替える。選んだものは、ブラウザに覚える。(初めは週)
// 1 目盛りの幅は、その左の「−」「＋」で、段 (50%〜400%) を上り下りする。選んだものは、サイクルごとにブラウザに覚える。(初めは 100%。0.8.1 から)
export default function Schedule () {
    const { data, version } = useDiagramData(SCHEDULE_COLLECTIONS, buildScheduleData);

    const { app } = useConfig();
    const cycle_key = CYCLE_KEY(app.name);
    const [cycle, setCycle] = React.useState(()=> readCycle(cycle_key));

    // 幅の段は、サイクルごとに覚える。(サイクルを変えたら、そのサイクルの幅を読み直す)
    const [widths, setWidths] = React.useState({});
    const width = widths[cycle] ?? readWidth(WIDTH_KEY(app.name, cycle));

    const box = React.useRef(null);

    const changeCycle = (e, next)=> {
        // 選んでいるボタンをもう一度押したときは、null が来る。(選んだままにする)
        if (!next)
            return;

        writeCycle(cycle_key, next);
        setCycle(next);
    };

    const changeWidth = (step)=> {
        const next = stepWidth(width, step);

        if (next===null)
            return;

        // 図を作り直す前に、保管した位置を合わせ直す。(画面の中央にあった日付が、中央に残るように。位置を保管していないときは、初めの位置)
        const code = `schedule:${cycle}`;
        const view = readDiagramView(app.name, code);

        if (view)
            writeDiagramView(app.name, code, viewForWidth(view, {
                from: width,
                to: next,
                start_x: columnsWidth(data.columns) + ROW_MARGIN,
                screen: box.current?.clientWidth || 1000,
            }));

        writeWidth(WIDTH_KEY(app.name, cycle), next);
        setWidths({ ...widths, [cycle]: next });
    };

    if (data.count===0)
        return (
            // 左の余白は、サイドメニューにかからないようにする。(Cockpit タブの Monitor と同じ)
            <Box sx={{ pt: 3, px: '111px' }}>
              <Alert severity="info">
                予定がありません。
                {' '}<code>data/master_schedule/wbs.json</code> に WBS を、<code>data/master_schedule/workpackages.json</code> にワークパッケージを書くと、ここに出ます。
                (ワークパッケージの例: <code>{'{'} "id": 1001, "parent": 1, "name": "画面の作成", "plan": {'{'} "from": "2026-11-01", "to": "2026-11-30" {'}'} {'}'}</code>。
                <code>parent</code> は、WBS の <code>id</code> です。いちばん左の列にプロジェクトを出すときは、<code>projects.json</code> にも書きます)
              </Alert>
            </Box>
        );

    // ほかからデータが変わったとき・サイクルや幅を変えたときは、図を作り直す。(位置と拡大は、サイクルごとに保管した値で戻る)
    return (
        <Box ref={box} sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <Diagram key={`${version}:${cycle}:${width}`} data={data} cycle={cycle} width={width}/>

          {/* 図の右上。(図にかぶらないように、背景を付ける。左はサイドメニューがあるので、右に置く) */}
          <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 8, right: 16 }}>
            <WidthControl width={width}
                          onNarrow={stepWidth(width, -1)===null ? null : ()=> changeWidth(-1)}
                          onWiden={stepWidth(width, 1)===null ? null : ()=> changeWidth(1)}/>

            <ToggleButtonGroup value={cycle} exclusive size="small" onChange={changeCycle}
                               aria-label="目盛りのサイクル"
                               sx={{ bgcolor: 'background.paper' }}>
              {SCHEDULE_CYCLES.map(c=> (
                  <ToggleButton key={c.code} value={c.code} aria-label={c.label} sx={{ px: 2 }}>
                    {c.label}
                  </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Box>
    );
}

// 1 目盛りの幅を変える部品。(「−」今の幅「＋」。いちばん端の段では、その向きのボタンを押せなくする)
// 見た目は、となりの「日・週・月」のボタン (ToggleButtonGroup の small) にそろえる。
function WidthControl ({ width, onNarrow, onWiden }) {
    const button = { minWidth: 40, px: 1.5, borderRadius: 0, color: 'text.primary', fontSize: '1rem', lineHeight: 1 };

    return (
        <Paper variant="outlined" role="group" aria-label="1 目盛りの幅"
               sx={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
          <Button sx={button} disabled={!onNarrow} onClick={onNarrow || undefined} aria-label="1 目盛りの幅を狭くする">
            −
          </Button>
          <Box aria-live="polite" aria-label={`1 目盛りの幅 ${width}%`}
               sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 52, px: 0.5,
                     borderLeft: 1, borderRight: 1, borderColor: 'divider', typography: 'body2' }}>
            {width}%
          </Box>
          <Button sx={button} disabled={!onWiden} onClick={onWiden || undefined} aria-label="1 目盛りの幅を広くする">
            ＋
          </Button>
        </Paper>
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

function Diagram ({ data, cycle, width }) {
    const nav = useNavigate();

    // 矢羽根を押したときには、いつも最新の関数を呼ぶ。
    const navigate = React.useRef(nav);
    navigate.current = nav;

    const box = React.useRef(null);
    const [rectum, setRectum] = React.useState(null);

    // カメラ (移動位置と拡大縮小) を、ブラウザに保管して、次に開いたとき・作り直したときに戻す。
    // サイクルで図の幅が大きく変わるので、サイクルごとに分けて覚える。(図の code は schedule:d・schedule:w・schedule:M)
    const bindView = useDiagramView(`schedule:${cycle}`);

    // 設定の diagrams.schedule.grid (d3 の grid の設定。既定 { draw: false } = 描かない) を、そのまま d3 に渡す。
    const { diagrams } = useConfig();
    const grid = diagrams.schedule.grid;

    React.useEffect(()=> {
        const scale = scheduleScale(data, cycle, width);
        const k = initialScale(box.current?.clientWidth || 1000, scale.size, data.columns);

        const r = new Rectum({
            // 初めの位置: 左から 100px (サイドメニューの右)・上から 60px (目盛りの見出しを出す余白)。transform は、移動量に拡大の度合いを掛ける。
            // 見出しは、図の座標で、日・週が -112、月が約 -51 まで上に伸びる。(d3.yabane 0.3.0) 拡大の度合いは 0.4 までなので、60px に収まる。
            transform: { k, x: 100 / k, y: 60 / k },
            grid,
            svg: { style: { background: '#ffffff' } },
        });

        bindView(r);

        const tree = new Pippala().build(scale.from, scale.to, { projects: data.projects, wbs: data.wbs, workpackages: data.workpackages });

        r.data(r.chewing({
            scale: { cycle: scale.cycle, from: scale.from, to: scale.to, size: scale.size },
            style: graphStyle(scale.size, data.columns, width),
            tree,
            events: { reaf: { click: (reaf)=> open(data.links[reaf.id()], navigate.current) } },
        }));

        setRectum(r);
    }, [bindView, data, cycle, width, grid]);

    return (
        <Box ref={box} sx={{ width: '100%', height: '100%' }}>
          {rectum && <D3Yabane rectum={rectum}/>}
        </Box>
    );
}
