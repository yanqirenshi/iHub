import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Unchi, { Rectum } from '@yanqirenshi/d3.unchi';
import { ModelInspector } from '@yanqirenshi/colonoscope';
import { ModelError, applyPatch, collectionOf, fieldsOf, mergePatch, movePatch, titleOf, withDefaults } from '@yanqirenshi/model.unchi';

import { findRecord, useDiagramData } from '../../../../manegers/diagram.js';
import { OVERVIEW_COLLECTIONS, buildOverviewData } from '../../../../manegers/overview.js';
import { errorMessage, useCollections, usePatchRecordMutation } from '../../../../redux/api/dataApi.js';

// 初めのズーム / パン
const INITIAL_VIEW = { k: 1.0, x: 120, y: 120 };

// model.unchi のコレクション ('nodes' / 'edges') を、data/ のコレクション名にする。
const collectionName = (collection)=> `overview/${collection}`;

// 線の patch が、描き直さずに図へ反映できるものだけか。(接続位置の角度とラベル)
// 色・太さ・マーカーは、描き直さないと図に出ない。ノードの patch は、いつも描き直す。
const EDGE_LIVE_KEYS = new Set(['from', 'to', 'label']);
const isLiveEdgePatch = (change)=> change.collection==='edges' && Object.keys(change.patch).every(key=> EDGE_LIVE_KEYS.has(key));

// Cockpit の Overview タブ: d3.unchi (ポンチ絵) をコンテンツエリア一杯に表示する。
// 図のデータは data/overview/ にあり、ノードをドラッグすると、動かした位置を overview/nodes に保存する。
// ノードや線を右クリックすると、右端にインスペクタを出し、項目を書き換えられる。
//
// 図ごとの知識 (編集できる項目・検証・patch への変換・d3.unchi の既定値) は @yanqirenshi/model.unchi が持つ。
// ここは view (d3.unchi) と model (model.unchi) とインスペクタ (colonoscope の ModelInspector) をつなぎ、
// model が返す { collection, id, patch } を PATCH /overview/{collection}/{id} で保存するだけ。
export default function Overview () {
    const { data, version, rebuild } = useDiagramData(OVERVIEW_COLLECTIONS, buildOverviewData);
    const collections = useCollections();
    const [patchRecord] = usePatchRecordMutation();

    // 右クリックした要素。{ collection: 'nodes' | 'edges', id }
    const [target, setTarget] = React.useState(null);
    const [error, setError] = React.useState(null);

    const box = React.useRef(null);
    const rectum = React.useRef(null);
    // 図を作り直すときに、いまのズーム / パンを引き継ぐため。({ version: 作り直したあとの版, transform })
    const view = React.useRef(null);

    // レコードは、読み込んだデータ (保存のたびに差し替わる) から id で引く。
    // d3.unchi に渡した複製 (コールバックの core) は、保存しても変わらないため。
    const latest = React.useRef(collections);
    latest.current = collections;

    const recordOf = ({ collection, id })=> findRecord(latest.current[collectionName(collection)], 'id', id);

    // インスペクタに渡すのは、既定値を重ねたレコード。(書いていない色なども、図に描いている値が初期値に出る)
    const record = target ? recordOf(target) : null;
    const current = React.useMemo(()=> record ? withDefaults(record) : null, [record]);

    // model が返した変更 ({ collection, id, patch }) を保存する。
    const save = (change)=> patchRecord({ name: collectionName(change.collection), id: change.id, patch: change.patch }).unwrap();

    // 保存したあとに図を作り直す。(サイズや色など、描き直さないと図に出ない変更のとき)
    // 作り直しても、いま見ている位置と拡大の度合いは変えない。
    const saveAndRebuild = async (change)=> {
        const zoom = [...(box.current?.querySelectorAll('svg') || [])].find(svg=> svg.__zoom)?.__zoom;
        // d3.unchi は、渡した x, y に倍率 k を掛けて使うので、k で割って渡す。
        view.current = zoom ? { version: version + 1, transform: { k: zoom.k, x: zoom.x / zoom.k, y: zoom.y / zoom.k } } : null;
        rebuild();

        try {
            await save(change);
        } catch (e) {
            // 保存できなかったときは、作り直すのをやめる。(次のドラッグの保存で作り直さないように)
            rebuild(false);
            view.current = null;
            throw e;
        }
    };

    // ドラッグの終わり: 動かした位置を保存する。(図は動かし終えているので、作り直さない)
    const onMove = async (core, move)=> {
        const node = recordOf({ collection: 'nodes', id: core.id });

        if (!node)
            return;

        try {
            await save(movePatch(node, move));
        } catch (e) {
            setError(errorMessage(e, '動かした位置を保存できません。'));
        }
    };

    // 右クリック: core は入力のレコードそのもの。
    const onInspect = (core)=> setTarget({ collection: collectionOf(core), id: core.id });

    // 適用: 変えた項目だけが patch に入る。不正な値は ModelError (利用者向けの日本語)。
    const onApply = async (values)=> {
        setError(null);

        try {
            const change = applyPatch(record, values);

            if (Object.keys(change.patch).length===0)
                return;

            if (!isLiveEdgePatch(change)) {
                await saveAndRebuild(change);
                return;
            }

            await save(change);

            // 角度とラベルは、描き直さずに図へ反映できる。
            const { from, to, label } = change.patch;

            rectum.current?.setEdgePorts(change.id, { from: from?.position, to: to?.position });

            if (label)
                rectum.current?.setEdgeLabel(change.id, mergePatch(record, change.patch).label);
        } catch (e) {
            setError(e instanceof ModelError ? e.message : errorMessage(e, '変更を保存できません。'));
        }
    };

    return (
        <Box ref={box} sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* ほかからデータが変わったときと、サイズを変えたときは、図を作り直す */}
          <Diagram key={version} data={data} rectum={rectum} onMove={onMove} onInspect={onInspect}
                   view={view.current?.version===version ? view.current.transform : null}/>

          {/* 項目は model (fieldsOf) が決める。コンテンツエリアの右端に、上から下まで */}
          <ModelInspector target={current}
                          fields={fieldsOf}
                          title={titleOf}
                          hide={['type']}
                          width={320}
                          onApply={onApply}
                          onClose={()=> setTarget(null)}
                          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 5 }}/>

          {error &&
           <Alert severity="error" onClose={()=> setError(null)}
                  sx={{ position: 'absolute', top: 8, left: 8, right: 8, whiteSpace: 'pre-wrap' }}>
             {error}
           </Alert>}
        </Box>
    );
}

function Diagram (props) {
    const data = props.data;

    // ドラッグの終わりと右クリックには、いつも最新の関数を呼ぶ。
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
                    dragend: (core, _node, move)=> onMove.current(core, move),
                    contextmenu: (core)=> onInspect.current(core),
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
