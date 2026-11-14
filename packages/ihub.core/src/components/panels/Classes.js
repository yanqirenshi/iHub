import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { ClassDiagram } from '@yanqirenshi/d3.classes';
import { ModelInspector } from '@yanqirenshi/colonoscope';

import { useConfig } from '../../config.js';
import { useDiagramData, useDiagramView } from '../../manegers/diagram.js';
import {
    CLASSES_COLLECTIONS, ModelError, applyPatch, buildClassesData, fieldsOf, findById, movePatch, titleOf, withDefaults,
} from '../../manegers/classes.js';
import { errorMessage, useCollections, usePatchRecordMutation } from '../../redux/api/dataApi.js';

// 'classes' / 'relationships' を、data/ のコレクション名にする。
const collectionName = (collection)=> `classes/${collection}`;

// 線をクリックしたと見なす、線からの距離 (画面の px)。(線は 1px と細いため)
const LINE_TOLERANCE = 6;

// クラス (/classes) のクラス図タブ: d3.classes をコンテンツエリア一杯に表示する。
// 図のデータは data/classes/ にあり、クラスの箱をドラッグすると、動かした位置を classes/classes に保存する。
// 箱を右クリックするとクラス、線をクリック (か右クリック) すると関係を、右端のインスペクタに出し、項目を書き換えられる。
//
// 図の知識 (編集できる項目・patch への変換・図に渡す形) は manegers/classes.js が持つ。
// ここは view (d3.classes) と model (manegers/classes.js) とインスペクタ (colonoscope の ModelInspector) をつなぎ、
// model が返す { collection, id, patch } を PATCH /classes/{collection}/{id} で保存するだけ。(TM と同じ流儀)
export default function Classes () {
    const { diagrams } = useConfig();
    const header = diagrams.classes.header;
    const build = React.useCallback((collections)=> buildClassesData(collections, { header }), [header]);

    const { data, version, rebuild } = useDiagramData(CLASSES_COLLECTIONS, build);
    const collections = useCollections();
    const [patchRecord] = usePatchRecordMutation();

    // 右クリック (線はクリック) した要素。{ collection: 'classes' | 'relationships', id }
    const [target, setTarget] = React.useState(null);
    const [error, setError] = React.useState(null);

    // レコードは、読み込んだデータ (保存のたびに差し替わる) から id で引く。
    const latest = React.useRef(collections);
    latest.current = collections;

    const recordOf = ({ collection, id })=> findById(latest.current[collectionName(collection)] || [], id);

    const record = target ? recordOf(target) : null;
    const current = React.useMemo(()=> record ? withDefaults(record) : null, [record]);

    const save = (change)=> patchRecord({ name: collectionName(change.collection), id: change.id, patch: change.patch }).unwrap();

    // ドラッグの終わり: 動かした位置を保存する。(図は動かし終えているので、作り直さない)
    const onMove = async (id, position)=> {
        const found = recordOf({ collection: 'classes', id });
        const change = found && movePatch(found, position);

        if (!change)
            return;

        try {
            await save(change);
        } catch (e) {
            setError(errorMessage(e, '動かした位置を保存できません。'));
        }
    };

    // 適用: 変えた項目だけが patch に入る。不正な値は ModelError (利用者向けの日本語)。
    // 名前・位置・線の位置などは、描き直さないと図に出ないので、保存したあとに図を作り直す。
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

    const skipped = data.skipped.length > 0
          ? `端のクラスが見つからない関係は、描いていません。(${data.skipped.join(', ')})` : null;

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* ほかからデータが変わったときと、名前などを変えたときは、図を作り直す */}
          <Diagram key={version} data={data} onMove={onMove} onInspect={setTarget} onError={setError}/>

          {data.classes.length===0 &&
           <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, textAlign: 'center', color: '#999', pointerEvents: 'none' }}>
             クラスがありません。data/classes/classes.json に書くと、ここに描きます。
           </Box>}

          <ModelInspector target={current}
                          fields={fieldsOf}
                          title={titleOf}
                          width={320}
                          onApply={onApply}
                          onClose={()=> setTarget(null)}
                          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 5 }}/>

          {(error || skipped) &&
           <Alert severity={error ? 'error' : 'warning'} onClose={()=> setError(null)}
                  sx={{ position: 'absolute', top: 8, left: 8, right: 8, whiteSpace: 'pre-wrap' }}>
             {error || skipped}
           </Alert>}
        </Box>
    );
}

// 点 (px, py) と線分 (a, b) の距離。
function distanceToSegment (px, py, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = dx * dx + dy * dy;
    const t = length===0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / length));

    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

// 押した位置にある関係の id。(線は細いので、LINE_TOLERANCE の内なら、その線と見なす) 無ければ null。
function relationshipAt (container, event) {
    const direct = event.target.closest?.('g.relationship');

    if (direct)
        return direct.getAttribute('data-id');

    let found = null;
    let nearest = LINE_TOLERANCE;

    for (const line of container.querySelectorAll('g.relationship line')) {
        const matrix = line.getScreenCTM();

        if (!matrix)
            continue;

        const point = (x, y)=> new DOMPoint(Number(line.getAttribute(x)), Number(line.getAttribute(y))).matrixTransform(matrix);
        const distance = distanceToSegment(event.clientX, event.clientY, point('x1', 'y1'), point('x2', 'y2'));

        if (distance <= nearest) {
            nearest = distance;
            found = line.closest('g.relationship').getAttribute('data-id');
        }
    }

    return found;
}

const classAt = (event)=> event.target.closest?.('g.class-box')?.getAttribute('data-id') ?? null;

// d3.classes のカメラ (ズーム・パン) を、useDiagramView に渡せる形にする。
// d3.classes には、カメラを読み書きする口が無いので、d3-zoom が svg に持たせている現在値 (__zoom) と、
// ズーム・パンで書き換わる g.viewport の transform を使う。
function cameraOf (svg, disposers) {
    const viewport = svg.querySelector('g.viewport');

    // 保管した位置に戻したときは、知らせない。(quiet)
    // 全体が見えるようにしたときは知らせて、保管する。(図を作り直したときに、同じ位置で描くため)
    let written = false;

    const write = ({ k, x, y }, quiet = true)=> {
        written = quiet;

        // 次のズーム・パンが、この位置から始まるように、d3-zoom の現在値も差し替える。
        // (ZoomTransform は公開されていないので、今の値のコンストラクタで作る)
        if (svg.__zoom)
            svg.__zoom = new svg.__zoom.constructor(k, x, y);

        viewport.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
    };

    // クラスが全部見えるようにする。(大きくはしない) 図の大きさがまだ無いときは、false。
    const fit = ()=> {
        const box = svg.querySelector('g.classes')?.getBBox();
        const width = svg.clientWidth;
        const height = svg.clientHeight;

        if (!box || box.width===0 || width===0 || height===0)
            return false;

        const margin = 40;
        const k = Math.max(0.1, Math.min(1, (width - margin * 2) / box.width, (height - margin * 2) / box.height));

        write({
            k,
            x: (width - box.width * k) / 2 - box.x * k,
            y: (height - box.height * k) / 2 - box.y * k,
        }, false);

        return true;
    };

    const camera = {
        // 保管した位置に戻したか。(戻していなければ、初めて開いた図なので、全体が見えるようにする)
        restored: false,
        view: (v)=> {
            camera.restored = true;
            write(v);
        },
        // ズーム・パンが落ち着いたら知らせる。(操作の途中は知らせない)
        onViewChange: (listener)=> {
            let timer = null;

            const observer = new MutationObserver(()=> {
                if (written) {
                    written = false;
                    return;
                }

                clearTimeout(timer);
                timer = setTimeout(()=> {
                    const t = svg.__zoom;

                    if (t)
                        listener({ k: t.k, x: t.x, y: t.y });
                }, 300);
            });

            // 見張る前に戻した位置 (view) の印は、見張りには届かないので、消しておく。(次の操作を取りこぼさないように)
            written = false;
            observer.observe(viewport, { attributes: true, attributeFilter: ['transform'] });
            disposers.push(()=> {
                clearTimeout(timer);
                observer.disconnect();
            });
        },
        // 全体が見えるようにする。図に大きさが付く前 (描いた直後) なら、大きさが付いてから行う。
        fit: ()=> {
            if (fit())
                return;

            const observer = new ResizeObserver(()=> {
                if (fit())
                    observer.disconnect();
            });

            observer.observe(svg);
            disposers.push(()=> observer.disconnect());
        },
    };

    return camera;
}

function Diagram (props) {
    const data = props.data;

    const container = React.useRef(null);

    // ドラッグの終わりと右クリック・クリックには、いつも最新の関数を呼ぶ。
    const handlers = React.useRef(props);
    handlers.current = props;

    // カメラ (移動位置と拡大縮小) を、ブラウザに保管して、次に開いたときに戻す。
    const bindView = useDiagramView('classes');

    // 設定の diagrams.classes.grid (d3.classes の grid の設定。例: { draw: false }) を、そのまま渡す。
    const { diagrams } = useConfig();
    const grid = diagrams.classes.grid;

    React.useEffect(()=> {
        const root = container.current;
        const disposers = [];

        // 描いたクラスの入力。d3.classes はドラッグで、この position を書き換える。
        const inputs = new Map(data.classes.map(d=> [d.id, d]));

        try {
            const diagram = new ClassDiagram(root, { ...(grid!==undefined && { grid }) });

            diagram.loadFromData({ classes: data.classes, relationships: data.relationships }).render();

            disposers.push(()=> diagram.clear());
        } catch (e) {
            // id の重複などで描けないとき。(API の書き込みでは検証するが、エディタで直接変えたファイルは、起動のときには検証しない)
            handlers.current.onError(`クラス図を描けません。(${e.message})`);
        }

        const svg = root.querySelector('svg');

        if (svg) {
            const camera = cameraOf(svg, disposers);

            // 保管した位置があれば戻す。無ければ (初めて開いた図は)、全体が見えるようにする。
            bindView(camera);

            if (!camera.restored)
                camera.fit();
        }

        // d3.classes には、ドラッグの終わりと右クリックを知らせる口が無いので、DOM で拾う。
        // d3-drag が mousedown・mouseup の伝播を止めるので、capture で拾う。
        let dragging = null;

        const onMouseDown = (event)=> {
            dragging = event.button===0 ? classAt(event) : null;
        };

        const onMouseUp = ()=> {
            if (!dragging)
                return;

            const id = dragging;
            dragging = null;

            const input = inputs.get(id);

            if (input)
                handlers.current.onMove(id, input.position);
        };

        const onContextMenu = (event)=> {
            const class_id = classAt(event);
            const relationship_id = class_id===null ? relationshipAt(root, event) : null;

            if (class_id===null && relationship_id===null)
                return;

            event.preventDefault();

            if (class_id!==null)
                handlers.current.onInspect({ collection: 'classes', id: class_id });
            else
                handlers.current.onInspect({ collection: 'relationships', id: relationship_id });
        };

        const onClick = (event)=> {
            if (classAt(event)!==null)
                return;

            const relationship_id = relationshipAt(root, event);

            if (relationship_id!==null)
                handlers.current.onInspect({ collection: 'relationships', id: relationship_id });
        };

        root.addEventListener('mousedown', onMouseDown, { capture: true });
        window.addEventListener('mouseup', onMouseUp, { capture: true });
        root.addEventListener('contextmenu', onContextMenu);
        root.addEventListener('click', onClick);

        return ()=> {
            root.removeEventListener('mousedown', onMouseDown, { capture: true });
            window.removeEventListener('mouseup', onMouseUp, { capture: true });
            root.removeEventListener('contextmenu', onContextMenu);
            root.removeEventListener('click', onClick);

            for (const dispose of disposers)
                dispose();

            root.innerHTML = '';
        };
    }, [bindView, data, grid]);

    return (
        <Box ref={container}
             sx={{
                 width: '100%',
                 height: '100%',
                 background: '#fff',
                 '& g.relationship': { cursor: 'pointer' },
             }}/>
    );
}
