import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Sitemap, { Rectum } from '@yanqirenshi/d3.sitemap';
import { ModelInspector } from '@yanqirenshi/colonoscope';
import { ModelError, applyPatch, fieldsOf, findById, movePatch, titleOf, withDefaults } from '@yanqirenshi/model.sitemap';

import { useDiagramData } from '../../../manegers/diagram.js';
import { SITEMAP_COLLECTIONS, buildSitemapData } from '../../../manegers/sitemap.js';
import { errorMessage, useCollections, usePatchRecordMutation } from '../../../redux/api/dataApi.js';

// 初めのズーム / パン
const INITIAL_VIEW = { k: 1.0, x: 0.0, y: 0.0 };

const style = {
    background: '#f3f3f3',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
};

// model.sitemap のコレクション ('nodes' / 'edges') を、data/ のコレクション名にする。
const collectionName = (collection)=> `sitemap/${collection}`;

// 画面 (/screens) の画面遷移図タブ: d3.sitemap をコンテンツエリア一杯に表示する。
// 図のデータは data/sitemap/ にあり、画面のノードをドラッグすると、動かした位置を sitemap/nodes に保存する。
// ノードを右クリックすると、右端のインスペクタに出し、項目を書き換えられる。
// (線は、d3.sitemap にクリックの通知が無いので、インスペクタを開けない)
//
// 図ごとの知識 (編集できる項目・検証・patch への変換・既定値) は @yanqirenshi/model.sitemap が持つ。
// ここは view (d3.sitemap) と model (model.sitemap) とインスペクタ (colonoscope の ModelInspector) をつなぎ、
// model が返す { collection, id, patch } を PATCH /sitemap/{collection}/{id} で保存するだけ。
export default function ScreenTransitionDiagram () {
    const { data, version, rebuild } = useDiagramData(SITEMAP_COLLECTIONS, buildSitemapData);
    const collections = useCollections();
    const [patchRecord] = usePatchRecordMutation();

    // 右クリックしたノードの id
    const [target, setTarget] = React.useState(null);
    const [error, setError] = React.useState(null);

    // レコードは、読み込んだデータ (保存のたびに差し替わる) から id で引く。(子のノードも探す)
    // d3.sitemap に渡した複製 (コールバックの core) は、保存しても変わらないため。
    const latest = React.useRef(collections);
    latest.current = collections;

    const nodeOf = (id)=> findById(latest.current[collectionName('nodes')], id);

    // インスペクタに渡すのは、既定値 (枠線・背景色など、図に描いている値) を重ねたレコード。
    const record = target!==null ? nodeOf(target) : null;
    const current = React.useMemo(()=> record ? withDefaults(record) : null, [record]);

    // model が返した変更 ({ collection, id, patch }) を保存する。
    const save = (change)=> patchRecord({ name: collectionName(change.collection), id: change.id, patch: change.patch }).unwrap();

    // ドラッグの終わり: 動かした位置を保存する。(図は動かし終えているので、作り直さない)
    // 子のノードの position は親の中での位置なので、親を動かしても親の patch だけでよい。
    const onMove = async (core, move)=> {
        const node = nodeOf(core.id);

        if (!node)
            return;

        try {
            await save(movePatch(node, move));
        } catch (e) {
            setError(errorMessage(e, '動かした位置を保存できません。'));
        }
    };

    // 適用: 変えた項目だけが patch に入る。不正な値は ModelError (利用者向けの日本語)。
    // 名称・色・サイズは、描き直さないと図に出ないので、保存したあとに図を作り直す。
    const onApply = async (values)=> {
        setError(null);

        try {
            const change = applyPatch(record, values);

            if (Object.keys(change.patch).length===0)
                return;

            rebuild();

            try {
                await save(change);
            } catch (e) {
                // 保存できなかったときは、作り直すのをやめる。(次のドラッグの保存で作り直さないように)
                rebuild(false);
                throw e;
            }
        } catch (e) {
            setError(e instanceof ModelError ? e.message : errorMessage(e, '変更を保存できません。'));
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* ほかからデータが変わったときと、名称などを変えたときは、図を作り直す */}
          <Diagram key={version} data={data} onMove={onMove} onInspect={setTarget}/>

          {/* 項目は model (fieldsOf) が決める。コンテンツエリアの右端に、上から下まで */}
          <ModelInspector target={current}
                          fields={fieldsOf}
                          title={titleOf}
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
            transform: INITIAL_VIEW,
            // コールバックの core は入力のレコードそのもの。(子のノードも)
            callbacks: {
                node: {
                    contextmenu: (core)=> onInspect.current(core.id),
                    // ドラッグの終わり (動いたときだけ)
                    dragend: (core, _node, move)=> onMove.current(core, move),
                },
            },
        });

        r.data(data);

        setRectum(r);
    }, [data]);

    if (!rectum) return null;

    return (
        <Box sx={style}>
          <D3Sitemap rectum={rectum}/>
        </Box>
    );
}
