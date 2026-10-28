import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Unchi, { Rectum } from '@yanqirenshi/d3.unchi';

import DiagramInspector from '../../../parts/DiagramInspector.js';
import { useDiagramData, useMoveRecord } from '../../../../manegers/diagram.js';
import { OVERVIEW_COLLECTIONS, buildOverviewData } from '../../../../manegers/overview.js';
import { errorMessage, usePatchRecordMutation } from '../../../../redux/api/dataApi.js';

// 初めのズーム / パン
const INITIAL_VIEW = { k: 1.0, x: 120, y: 120 };

// 線 (エッジ) か。(core は入力のレコードそのもの。線は from と to を持つ)
const isEdge = (t)=> !!(t && t.from && t.to);

// ノードの枠線の種類。(d3.unchi が描けるもの)
const BORDER_TYPES = ['solid', 'dashed', 'dotted'];

// 右クリックで出すインスペクタ。
// ノードは幅・高さ・背景色・枠線 (種類と色)、線は両端の接続位置 (角度) を書き換えられる。
// 背景色と枠線は、データに書いていなければ区分ごとの既定で描かれるので、
// 図に描いている値を _style に写して出す。(_ で始まる項目は「JSON」タブには出ない)
const INSPECTOR = {
    title: (t)=> (t.label && (typeof t.label==='string' ? t.label : t.label.text)) || `${t.type || ''} ${t.id}`.trim(),
    node: [
        { path: 'label.text',               label: '名称' },
        { path: 'type',                     label: '種類' },
        { path: 'id',                       label: 'ID' },
        { path: 'size.w',                   label: '幅',   type: 'number' },
        { path: 'size.h',                   label: '高さ', type: 'number' },
        { path: '_style.background.color',  label: '背景色', type: 'text' },
        { path: '_style.border.type',       label: `枠線の種類 (${BORDER_TYPES.join(' / ')})`, type: 'text' },
        { path: '_style.border.color',      label: '枠線の色', type: 'text' },
    ],
    // 接続位置は、ノードの中心から見た角度。0=真下・時計回り (90=左 / 180=真上 / 270=右)
    edge: [
        { path: 'id',            label: 'ID' },
        { path: 'from.id',       label: '接続元のノード' },
        { path: 'from.position', label: '接続元の位置 (角度)', type: 'number' },
        { path: 'to.id',         label: '接続先のノード' },
        { path: 'to.position',   label: '接続先の位置 (角度)', type: 'number' },
    ],
};

// インスペクタで入力した文字列を数にする。数でないときは null。
function toNumber (value) {
    const n = Number(value);

    return value!=='' && Number.isFinite(n) ? n : null;
}

// ノードの幅・高さの入力から、保存する size を作る。(1 以上の整数)
function sizePatch (values) {
    const size = {};

    for (const key of ['w', 'h']) {
        const value = values[`size.${key}`];

        if (value===undefined)
            continue;

        const n = toNumber(value);

        if (n===null || n < 1)
            throw new Error(`${key==='w' ? '幅' : '高さ'}は 1 以上の数で入力してください。`);

        size[key] = Math.round(n);
    }

    return size;
}

// 線の接続位置の入力から、保存する角度を作る。(0 以上 360 未満の整数)
function portsPatch (values) {
    const ports = {};

    for (const end of ['from', 'to']) {
        const value = values[`${end}.position`];

        if (value===undefined)
            continue;

        const n = toNumber(value);

        if (n===null)
            throw new Error(`${end==='from' ? '接続元' : '接続先'}の位置は、角度 (数) で入力してください。`);

        ports[end] = ((Math.round(n) % 360) + 360) % 360;
    }

    return ports;
}

// 右クリックしたノードに、図に描いている背景色と枠線を _style として足す。
//   core: 入力のレコード、node: d3.unchi が既定を補ったデータ
function withStyle (core, node) {
    return {
        ...core,
        _style: {
            background: { color: node?.background?.color ?? '' },
            border: {
                type:  node?.border?.type ?? 'solid',
                color: node?.border?.color ?? '',
            },
        },
    };
}

// 背景色と枠線の入力から、保存する background / border を作る。
// 図に描いている値 (style) から変えた項目だけを返す。(変えていない既定の値まで書き込まないため)
function stylePatch (values, style) {
    const patch = {};

    const changed = (path, current)=> {
        const value = values[`_style.${path}`];

        return value!==undefined && value.trim()!==String(current) ? value.trim() : undefined;
    };

    const color = (value, label)=> {
        if (value==='' || !CSS.supports('color', value))
            throw new Error(`${label}は、色 (#ff0000 や red など) で入力してください。`);

        return value;
    };

    const background = changed('background.color', style.background.color);

    if (background!==undefined)
        patch.background = { color: color(background, '背景色') };

    const type = changed('border.type', style.border.type);

    if (type!==undefined) {
        if (!BORDER_TYPES.includes(type))
            throw new Error(`枠線の種類は、${BORDER_TYPES.join(' / ')} のどれかで入力してください。`);

        patch.border = { type };
    }

    const borderColor = changed('border.color', style.border.color);

    if (borderColor!==undefined)
        patch.border = { ...patch.border, color: color(borderColor, '枠線の色') };

    return patch;
}

// 保存した背景色と枠線を、インスペクタに出している値 (_style) にも重ねる。
function mergeStyle (style, patch) {
    return {
        background: { ...style.background, ...patch.background },
        border:     { ...style.border,     ...patch.border },
    };
}

// Cockpit の Overview タブ: d3.unchi (ポンチ絵) をコンテンツエリア一杯に表示する。
// 図のデータは data/overview/ にあり、ノードをドラッグすると、動かした位置を overview/nodes に保存する。
// ノードやエッジを右クリックすると、右端にインスペクタを出す。
// インスペクタで、ノードの幅・高さ・背景色・枠線と、線の接続位置を書き換えられる。
export default function Overview () {
    const { data, version, rebuild } = useDiagramData(OVERVIEW_COLLECTIONS, buildOverviewData);
    const [move, moveError, closeMoveError] = useMoveRecord('overview/nodes');
    const [patchRecord] = usePatchRecordMutation();

    const [target, setTarget] = React.useState(null);
    const [applyError, setApplyError] = React.useState(null);
    const onInspect = React.useCallback((core, datum)=> setTarget(isEdge(core) ? core : withStyle(core, datum)), []);

    const box = React.useRef(null);
    const rectum = React.useRef(null);
    // 図を作り直すときに、いまのズーム / パンを引き継ぐため。({ version: 作り直したあとの版, transform })
    const view = React.useRef(null);

    const applyNode = async (values)=> {
        const size = sizePatch(values);
        const style = stylePatch(values, target._style);

        // サイズや色は描き直さないと図に出ないので、保存したあとに図を作り直す。
        // 作り直しても、いま見ている位置と拡大の度合いは変えない。
        const zoom = [...(box.current?.querySelectorAll('svg') || [])].find(svg=> svg.__zoom)?.__zoom;
        // d3.unchi は、渡した x, y に倍率 k を掛けて使うので、k で割って渡す。
        view.current = zoom ? { version: version + 1, transform: { k: zoom.k, x: zoom.x / zoom.k, y: zoom.y / zoom.k } } : null;
        rebuild();

        try {
            await patchRecord({ name: 'overview/nodes', id: target.id, patch: { size, ...style } }).unwrap();
        } catch (e) {
            // 保存できなかったときは、作り直すのをやめる。(次のドラッグの保存で作り直さないように)
            rebuild(false);
            view.current = null;
            throw e;
        }

        setTarget({
            ...target,
            size: { ...target.size, ...size },
            ...(style.background && { background: { ...target.background, ...style.background } }),
            ...(style.border     && { border:     { ...target.border,     ...style.border } }),
            _style: mergeStyle(target._style, style),
        });
    };

    const applyEdge = async (values)=> {
        const ports = portsPatch(values);

        const patch = Object.fromEntries(Object.entries(ports).map(([end, position])=> [end, { position }]));

        await patchRecord({ name: 'overview/edges', id: target.id, patch }).unwrap();

        // 角度は、描き直さずに図へ反映できる。
        rectum.current?.setEdgePorts(target.id, ports);

        setTarget({
            ...target,
            from: { ...target.from, ...patch.from },
            to:   { ...target.to,   ...patch.to },
        });
    };

    const onApply = async (values)=> {
        setApplyError(null);

        try {
            await (isEdge(target) ? applyEdge(values) : applyNode(values));
        } catch (e) {
            setApplyError(e instanceof Error ? e.message : errorMessage(e, '変更を保存できません。'));
        }
    };

    const error = moveError || applyError;
    const closeError = ()=> { closeMoveError(); setApplyError(null); };

    return (
        <Box ref={box} sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* ほかからデータが変わったときと、サイズを変えたときは、図を作り直す */}
          <Diagram key={version} data={data} rectum={rectum} onMove={move} onInspect={onInspect}
                   view={view.current?.version===version ? view.current.transform : null}/>

          <DiagramInspector target={target}
                            title={INSPECTOR.title}
                            fields={isEdge(target) ? INSPECTOR.edge : INSPECTOR.node}
                            onApply={onApply}
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
            // サイズを変えて作り直したときは、それまでのズーム / パンを引き継ぐ。(ほかから変わったときは初めに戻す)
            transform: props.view || INITIAL_VIEW,
            callbacks: {
                node: {
                    // ドラッグの終わり。掴んだノードについてだけ、1 回呼ばれる。
                    // (子のノードは親の中での位置なので、親を動かしても変わらない)
                    dragend: (core, node, move)=> onMove.current(core.id, move),
                    contextmenu: (core, node)=> onInspect.current(core, node),
                },
                edge: {
                    contextmenu: (core)=> onInspect.current(core),
                },
            },
        });

        r.data(data);

        props.rectum.current = r;
        setRectum(r);
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!rectum) return null;

    return <D3Unchi rectum={rectum}/>;
}
