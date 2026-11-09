import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import D3Ter, { Rectum } from '@yanqirenshi/d3.ter';
import { ModelInspector } from '@yanqirenshi/colonoscope';
import { ModelError, applyPatch, fieldsOf, findById, movePatch, titleOf, withDefaults } from '@yanqirenshi/model.tm';

import { useDiagramData } from '../../manegers/diagram.js';
import { TM_COLLECTIONS, buildTmData } from '../../manegers/tm.js';
import { errorMessage, useCollections, usePatchRecordMutation } from '../../redux/api/dataApi.js';

// 初めのズーム / パン
const INITIAL_VIEW = { k: 0.7, x: 400.0, y: 400.0 };

// model.tm のコレクション ('entities' など) を、data/ のコレクション名にする。
const collectionName = (collection)=> `tm/${collection}`;

// ビジネス (/business) の TM タブ: d3.ter をコンテンツエリア一杯に表示する。
// 図のデータは data/tm/ にあり、エンティティをドラッグすると、動かした位置を tm/entities に保存する。
// エンティティの見出しを右クリックするとエンティティ、識別子・属性の行を右クリックするとその行が参照するマスタ、
// 結線をクリックするとリレーションシップを、右端のインスペクタに出し、項目を書き換えられる。
//
// 図ごとの知識 (編集できる項目・検証・patch への変換・既定値) は @yanqirenshi/model.tm が持つ。
// ここは view (d3.ter) と model (model.tm) とインスペクタ (colonoscope の ModelInspector) をつなぎ、
// model が返す { collection, id, patch } を PATCH /tm/{collection}/{id} で保存するだけ。
export default function TM () {
    const { data, version, rebuild } = useDiagramData(TM_COLLECTIONS, buildTmData);
    const collections = useCollections();
    const [patchRecord] = usePatchRecordMutation();

    // 右クリック (結線はクリック) した要素。{ collection: 'entities' | 'identifiers' | 'attributes' | 'relationships', id }
    const [target, setTarget] = React.useState(null);
    const [error, setError] = React.useState(null);

    // レコードは、読み込んだデータ (保存のたびに差し替わる) から id で引く。
    // d3.ter に渡した複製 (コールバックの _core) は、保存しても変わらないため。
    const latest = React.useRef(collections);
    latest.current = collections;

    const recordOf = ({ collection, id })=> findById(latest.current[collectionName(collection)], id);

    // インスペクタに渡すのは、既定値 (結線の角度など) を重ねたレコード。
    const record = target ? recordOf(target) : null;
    const current = React.useMemo(()=> record ? withDefaults(record) : null, [record]);

    // model が返した変更 ({ collection, id, patch }) を保存する。
    const save = (change)=> patchRecord({ name: collectionName(change.collection), id: change.id, patch: change.patch }).unwrap();

    // ドラッグの終わり: 動かした位置を保存する。(図は動かし終えているので、作り直さない)
    const onMove = async (core, move)=> {
        const entity = recordOf({ collection: 'entities', id: core.id });

        if (!entity)
            return;

        try {
            await save(movePatch(entity, move));
        } catch (e) {
            setError(errorMessage(e, '動かした位置を保存できません。'));
        }
    };

    // 適用: 変えた項目だけが patch に入る。不正な値は ModelError (利用者向けの日本語)。
    // 名前・種別・角度・記号は、描き直さないと図に出ないので、保存したあとに図を作り直す。
    const onApply = async (values)=> {
        setError(null);

        try {
            const change = applyPatch(record, values, target.collection);

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
          {/* ほかからデータが変わったときと、名前などを変えたときは、図を作り直す */}
          <Diagram key={version} data={data} onMove={onMove} onInspect={setTarget}/>

          {/* 項目は model (fieldsOf) が決める。マスタは collection を添える。コンテンツエリアの右端に、上から下まで */}
          <ModelInspector target={current}
                          fields={(t)=> fieldsOf(t, target?.collection)}
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

    // ドラッグの終わりと右クリック・クリックには、いつも最新の関数を呼ぶ。
    const onMove = React.useRef(props.onMove);
    onMove.current = props.onMove;

    const onInspect = React.useRef(props.onInspect);
    onInspect.current = props.onInspect;

    const [rectum, setRectum] = React.useState(null);

    React.useEffect(()=> {
        // 識別子・属性の行: その行が参照するマスタ (d._master._core) を出す。
        const master = (collection)=> (d)=> {
            const core = d?._master?._core;

            if (core)
                onInspect.current({ collection, id: core.id });
        };

        const r = new Rectum({
            transform: INITIAL_VIEW,
            svg: { style: { background: '#fff' } },
            // コールバックの d は d3.ter の内部のデータで、入力のレコードは d._core にある。
            callbacks: {
                entity: {
                    contextmenu: (d)=> onInspect.current({ collection: 'entities', id: d._core.id }),
                    // ドラッグの終わり (動いたときだけ)。core はエンティティ
                    dragend: (core, _entity, move)=> onMove.current(core, move),
                },
                identifier:   { contextmenu: master('identifiers') },
                attribute:    { contextmenu: master('attributes') },
                relationship: { click: (d)=> onInspect.current({ collection: 'relationships', id: d._core.id }) },
            },
        });

        r.data(data);

        setRectum(r);
    }, [data]);

    if (!rectum) return null;

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
          <D3Ter rectum={rectum}/>
        </Box>
    );
}
