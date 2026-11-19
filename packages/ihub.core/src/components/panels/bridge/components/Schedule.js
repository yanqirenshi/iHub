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
import { ModelInspector } from '@yanqirenshi/colonoscope';
import { ModelError, applyPatch, fieldsOf, titleOf, withDefaults } from '@yanqirenshi/model.yabane';

import { useConfig } from '../../../../config.js';
import { findRecord, readDiagramView, useDiagramData, useDiagramView, writeDiagramView } from '../../../../manegers/diagram.js';
import { errorMessage, useCollections, usePatchRecordMutation } from '../../../../redux/api/dataApi.js';
import {
    COLUMN_GAP, CYCLE_KEY, ROW_MARGIN, SCHEDULE_COLLECTIONS, SCHEDULE_CYCLES, UNIT_WIDTH, WIDTH_KEY,
    buildScheduleData, columnsWidth, headOfWidth, readCycle, readWidth, rowColumnWidth, scheduleScale, stepWidth,
    viewForWidth, writeCycle, writeWidth,
} from '../../../../manegers/schedule.js';

// 図のスタイル (d3.yabane のスタイル)。stage.w は、時間の目盛りの全体の幅。(表示する期間に比例させる)
// row.w は、名前を測れなかった列の幅。(d3.yabane 0.5.0 は、名前の列の幅を、描いた名前の幅に合わせる。manegers/schedule.js の rowColumnWidth)
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

// 初めの拡大の度合い。図の全体 (名前の列と、時間の目盛り) の幅 total が、表示している幅 width に収まる度合い。(小さくしすぎない・大きくしすぎない)
// total は、時間軸の右端 (図の座標)。描く前は見積もり (columnsWidth)、描いたあとは実際の値 (d3.yabane の onDraw の range) を使う。
function initialScale (width, total) {
    const k = (width * 0.95) / total;

    return Math.min(0.4, Math.max(0.1, k));
}

// 初めの位置: 左から 100px (サイドメニューの右)・上から 60px (目盛りの見出しを出す余白)。(画面の px。d3.svg の view)
// 見出しは、図の座標で、日・週が -112、月が約 -51 まで上に伸びる。(d3.yabane 0.3.0) 拡大の度合いは 0.4 までなので、60px に収まる。
const INITIAL_LEFT = 100;
const INITIAL_TOP = 60;

// インスペクタの幅。(Overview と同じ)
const INSPECTOR_WIDTH = 320;

// model.yabane のコレクション ('projects' / 'wbs' / 'workpackages' / 'milestones') を、data/ のコレクション名にする。
const collectionName = (collection)=> `master_schedule/${collection}`;

// 艦橋 (Bridge) の Schedule タブ: data/master_schedule/ のプロジェクト・WBS・ワークパッケージを、d3.yabane の矢羽根で並べる。(0.7.0 以降)
// プロジェクトは、いちばん左の列。(0.8.0 から) その右に、WBS が入れ子の列で並び、ワークパッケージが矢羽根になる。
// 矢羽根を押すと、ワークパッケージの行き先へ移る。wbs があれば /wbs/{id}、url があれば新しいタブで開く。どちらも無ければ、何もしない。
// 矢羽根・WBS の箱・プロジェクトの箱を右クリックすると、右端にインスペクタを出し、項目を書き換えられる。(0.9.0 から)
// マイルストーン (milestones.json) は、WBS かプロジェクトの行の、date の位置に △ と名前で描く。(0.10.0 から)
// △ を押しても、何もしない。(行き先は持たない) 右クリックすると、インスペクタを出す。
// 予定の期間は、workpackages.json の各レコードの plan: { from, to } ('YYYY-MM-DD') に書く。
// 時間の目盛りのサイクル (日・週・月) は、右上のボタンで切り替える。選んだものは、ブラウザに覚える。(初めは週)
// 1 目盛りの幅は、その左の「−」「＋」で、段 (50%〜400%) を上り下りする。選んだものは、サイクルごとにブラウザに覚える。(初めは 100%。0.8.1 から)
//
// インスペクタの作りは、Overview タブと同じ。図ごとの知識 (編集できる項目・検証・patch への変換・d3.yabane の既定の見た目) は
// @yanqirenshi/model.yabane が持つ。ここは view (d3.yabane) と model (model.yabane) とインスペクタ (colonoscope の ModelInspector) をつなぎ、
// model が返す { collection, id, patch } を PATCH /api/master_schedule/{collection}/{id} で保存するだけ。
// 並び順 (order) は出さない。(iHub は、プロジェクトと WBS を、ファイルの配列の順で並べる。buildScheduleData が order を振る)
export default function Schedule () {
    const { data, version, rebuild } = useDiagramData(SCHEDULE_COLLECTIONS, buildScheduleData);
    const collections = useCollections();
    const [patchRecord] = usePatchRecordMutation();

    const { app } = useConfig();
    const cycle_key = CYCLE_KEY(app.name);
    const [cycle, setCycle] = React.useState(()=> readCycle(cycle_key));

    // 幅の段は、サイクルごとに覚える。(サイクルを変えたら、そのサイクルの幅を読み直す)
    const [widths, setWidths] = React.useState({});
    const width = widths[cycle] ?? readWidth(WIDTH_KEY(app.name, cycle));

    const box = React.useRef(null);

    // 今、画面に出している図。(幅を変えるとき、位置をまだ保管していなければ、今の位置と拡大の度合いを使う)
    const rectum = React.useRef(null);

    // 右クリックした要素。{ collection: 'projects' | 'wbs' | 'workpackages' | 'milestones', id }
    // サイクルや幅を変えても (図を作り直しても)、開いたまま。
    const [target, setTarget] = React.useState(null);
    const [error, setError] = React.useState(null);

    // レコードは、読み込んだデータ (保存のたびに差し替わる) から id で引く。
    // d3.yabane に渡したデータ (コールバックの core) は、名前を省略したり、親を付け替えたりしているので、使わない。
    const latest = React.useRef(collections);
    latest.current = collections;

    const recordOf = ({ collection, id })=> findRecord(latest.current[collectionName(collection)] || [], 'id', id);

    // インスペクタに渡すのは、d3.yabane の既定の見た目を重ねたレコード。(書いていない色なども、図に描いている値が初期値に出る)
    // (iHub は、箱と矢羽根の見た目 (d3.yabane の looks。レコードの background・stroke・font に重なる既定) を上書きしていないので、重ねるのは withDefaults だけ)
    const record = target ? recordOf(target) : null;
    const current = React.useMemo(()=> record ? withDefaults(record, target.collection) : null, [record, target]);

    // ほかからデータが変わって、選んでいたレコードが無くなったら、インスペクタを閉じる。
    React.useEffect(()=> {
        if (target && !record)
            setTarget(null);
    }, [target, record]);

    // 右クリック: どの知らせかで、コレクションが決まる。(プロジェクトと WBS は、同じ id でもよい)
    const inspect = React.useCallback((collection, id)=> setTarget({ collection, id }), []);

    // model が返した変更 ({ collection, id, patch }) を保存して、図を作り直す。
    // 作り直しても、位置・拡大・サイクル・1 目盛りの幅は変えない。
    // (位置をまだ保管していない (開いてから動かしていない) ときは、今の位置を保管してから作り直す。保管しないと、初めの拡大の度合いで収め直すため)
    const saveAndRebuild = async (change)=> {
        const code = `schedule:${cycle}`;

        if (!readDiagramView(app.name, code)) {
            const view = currentView(rectum.current);

            if (view)
                writeDiagramView(app.name, code, view);
        }

        rebuild();

        try {
            await patchRecord({ name: collectionName(change.collection), id: change.id, patch: change.patch }).unwrap();
        } catch (e) {
            // 保存できなかったときは、作り直すのをやめる。
            rebuild(false);
            throw e;
        }
    };

    // 適用: 変えた項目だけが patch に入る。変更が無ければ、何もしない。不正な値は ModelError (利用者向けの日本語)。
    const onApply = async (values)=> {
        setError(null);

        try {
            const change = applyPatch(record, values, target.collection);

            if (Object.keys(change.patch).length===0)
                return;

            await saveAndRebuild(change);
        } catch (e) {
            setError(e instanceof ModelError ? e.message : errorMessage(e, '変更を保存できません。'));
        }
    };

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

        // 図を作り直す前に、位置を合わせ直して保管する。(画面の中央にあった日付が、中央に残るように。拡大の度合いは、そのまま)
        // 位置をまだ保管していない (開いてから動かしていない) ときは、今、画面に出ている位置と拡大の度合いを元にする。
        // (保管しないまま作り直すと、初めの拡大の度合いが、広がった図の全体を画面に収め直すので、1 目盛りの画面の幅が、ほとんど変わらない)
        // 時間軸の左端は、画面に出している図の実際の値。(d3.yabane 0.5.0 は、名前の列の幅を、名前に合わせて決めるので、見積もらない)
        const code = `schedule:${cycle}`;
        const view = readDiagramView(app.name, code) || currentView(rectum.current);
        const axis = timeAxisOf(rectum.current);

        if (view && axis)
            writeDiagramView(app.name, code, viewForWidth(view, {
                from: width,
                to: next,
                start_x: axis.start,
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
          <Diagram key={`${version}:${cycle}:${width}`} data={data} cycle={cycle} width={width} current={rectum} onInspect={inspect}/>

          {/* 図の右上。(図にかぶらないように、背景を付ける。左はサイドメニューがあるので、右に置く)
              インスペクタを開いているあいだは、その左へずらす。(インスペクタに隠れずに、押せるように) */}
          <Stack direction="row" spacing={1}
                 sx={{ position: 'absolute', top: 8, right: current ? INSPECTOR_WIDTH + 16 : 16 }}>
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

          {/* 項目は model (fieldsOf) が決める。コンテンツエリアの右端に、上から下まで。(Overview と同じ) */}
          <ModelInspector target={current}
                          fields={(t)=> fieldsOf(t, target.collection)}
                          title={titleOf}
                          hide={['order']}
                          width={INSPECTOR_WIDTH}
                          onApply={onApply}
                          onClose={()=> setTarget(null)}
                          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 5 }}/>

          {/* 右上のボタンにかからないように、その下に出す。左は、サイドメニューにかからないようにする。(予定が無いときの知らせと同じ) */}
          {error &&
           <Alert severity="error" onClose={()=> setError(null)}
                  sx={{ position: 'absolute', top: 56, left: 111, right: current ? INSPECTOR_WIDTH + 8 : 8, whiteSpace: 'pre-wrap' }}>
             {error}
           </Alert>}
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

// 画面に出している図の、今の位置と拡大の度合い { k, x, y }。(d3.svg の view。画面の x = 図の x × k + x)
// 図をまだ描いていないときは、null。(描く前の Rectum は、初めの transform を、view と違う意味の値で持っている)
function currentView (rectum) {
    if (!rectum || typeof rectum.view!=='function' || typeof rectum.d3Element!=='function' || !rectum.d3Element())
        return null;

    return rectum.view();
}

// 画面に出している図の、時間軸の左端と右端 { start, end } (図の座標)。図をまだ描いていないときは、null。
// (d3.yabane 0.5.0 から、名前の列の幅は、描いた名前を測って決まる。描いたあとの scale が、実際の位置)
function timeAxisOf (rectum) {
    if (!currentView(rectum) || typeof rectum.scale!=='function' || !rectum.scale())
        return null;

    const [start, end] = rectum.scale().range();

    return { start, end };
}

// 前の図が測った名前の幅。(d3.yabane 0.6.0 の labelWidths。新しい Rectum に渡すと、測り直しの描き直しが要らない) 前の図が無いときは、undefined。
function labelWidthsOf (rectum) {
    return rectum && typeof rectum.labelWidths==='function' ? rectum.labelWidths() : undefined;
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

function Diagram ({ data, cycle, width, current, onInspect }) {
    const nav = useNavigate();

    // 矢羽根を押したとき・右クリックしたときには、いつも最新の関数を呼ぶ。
    const navigate = React.useRef(nav);
    navigate.current = nav;

    const inspect = React.useRef(onInspect);
    inspect.current = onInspect;

    const box = React.useRef(null);
    const [rectum, setRectum] = React.useState(null);

    // カメラ (移動位置と拡大縮小) を、ブラウザに保管して、次に開いたとき・作り直したときに戻す。
    // サイクルで図の幅が大きく変わるので、サイクルごとに分けて覚える。(図の code は schedule:d・schedule:w・schedule:M)
    const bindView = useDiagramView(`schedule:${cycle}`);

    // 設定の diagrams.schedule.grid (d3 の grid の設定。既定 { draw: false } = 描かない) を、そのまま d3 に渡す。
    const { app, diagrams } = useConfig();
    const grid = diagrams.schedule.grid;

    React.useEffect(()=> {
        const scale = scheduleScale(data, cycle, width);
        const screen = ()=> box.current?.clientWidth || 1000;

        // 描く前の初めの拡大の度合いは、名前の列を見積もって決める。(どの列も row.w のとき)
        const k = initialScale(screen(), columnsWidth(data.columns) + ROW_MARGIN + scale.size);

        const r = new Rectum({
            // transform は、移動量に拡大の度合いを掛ける。(画面で INITIAL_LEFT・INITIAL_TOP の位置になる)
            transform: { k, x: INITIAL_LEFT / k, y: INITIAL_TOP / k },
            grid,
            svg: { style: { background: '#ffffff' } },
            // 作り直すとき (サイクル・幅・データが変わったとき) は、前の図が測った名前の幅を引き継ぐ。(1 度の描画で、列の幅が決まる)
            // 名前が変わったときは、その名前だけ、測って描き直す。(d3.yabane は、名前と文字ごとに覚える)
            labelWidths: labelWidthsOf(current.current),
        });

        // 位置を保管していないときは、描いたあとの実際の幅 (名前の列は、名前に合った幅) で、初めの拡大の度合いを決め直す。(初めの 1 回だけ)
        // (view で動かしたものは保管しない。d3.svg は、view では onViewChange を呼ばない)
        if (!readDiagramView(app.name, `schedule:${cycle}`))
            r.onDraw(({ range }, drawn)=> {
                drawn.onDraw(null);
                drawn.view({ k: initialScale(screen(), range[1]), x: INITIAL_LEFT, y: INITIAL_TOP });
            });

        bindView(r);

        const tree = new Pippala().build(scale.from, scale.to, {
            projects: data.projects,
            wbs: data.wbs,
            workpackages: data.workpackages,
            milestones: data.milestones,
        });

        r.data(r.chewing({
            scale: { cycle: scale.cycle, from: scale.from, to: scale.to, size: scale.size },
            style: graphStyle(scale.size, data.columns, width),
            tree,
            // 左クリック: 矢羽根の行き先へ移る。
            // 右クリック (d3.yabane 0.8.0 から): インスペクタを出す。d.core() は d3.yabane に渡したレコードで、id だけを使う。
            // (知らせの種類で、コレクションが決まる。プロジェクトの d.id() は 'project-<id>' なので、使わない)
            events: {
                reaf: {
                    click: (reaf)=> open(data.links[reaf.id()], navigate.current),
                    contextmenu: (d)=> inspect.current('workpackages', d.core().id),
                },
                branch: { contextmenu: (d)=> inspect.current('wbs', d.core().id) },
                project: { contextmenu: (d)=> inspect.current('projects', d.core().id) },
                // マイルストーン (d3.yabane 0.9.0 から): 押しても、何もしない。右クリックで、インスペクタを出す。
                milestone: { contextmenu: (d)=> inspect.current('milestones', d.core().id) },
            },
        }));

        setRectum(r);
        current.current = r;
    }, [app.name, bindView, data, cycle, width, grid, current]);

    return (
        <Box ref={box} sx={{ width: '100%', height: '100%' }}>
          {rectum && <D3Yabane rectum={rectum}/>}
        </Box>
    );
}
