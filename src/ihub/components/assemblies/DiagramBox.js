import React, { useCallback, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import DiagramInspector from '../parts/DiagramInspector.js';
import { useDiagramData, useSavePositions } from '../../manegers/diagram.js';

// 図 (d3 のライブラリ) を囲む部品。
// ドラッグで動かしたノードの位置を保存し、ほかからデータが変わったときは図を作り直す。
// 図の要素を右クリックしたら、右端にインスペクタを出す。
//   names:     図に使うコレクション
//   build:     コレクションから、図に渡すデータを作る関数
//   positions: 位置を保存する先 ({ selector, collection, key })
//   inspector: インスペクタの見出しと項目 ({ title, fields })
//   render:    図に渡すデータと、右クリックの受け口 (onInspect) を受け取り、図の部品を返す関数
export default function DiagramBox (props) {
    const ref = useRef(null);

    const { data, version } = useDiagramData(props.names, props.build);
    const [error, closeError] = useSavePositions(ref, props.positions);

    const [target, setTarget] = useState(null);

    // 図を作り直したあとも使えるよう、参照を変えない。
    const onInspect = useCallback((t)=> setTarget(t), []);

    return (
        <Box ref={ref} sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <React.Fragment key={version}>
            {props.render(data, onInspect)}
          </React.Fragment>

          {props.inspector &&
           <DiagramInspector target={target}
                             title={props.inspector.title}
                             fields={props.inspector.fields}
                             onClose={()=> setTarget(null)}/>}

          {error &&
           <Alert severity="error" onClose={closeError}
                  sx={{ position: 'absolute', top: 8, left: 8, right: 8, whiteSpace: 'pre-wrap' }}>
             {error}
           </Alert>}
        </Box>
    );
}
