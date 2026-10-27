import React from 'react';

import Colonoscope, { getByPath } from '@yanqirenshi/colonoscope';

// 図の要素を右クリックしたときに、コンテンツエリアの右端に出すインスペクタ。(表示のみ)
// colonoscope をそのまま使わずに包むのは、図ごとに違う「どこに名前があるか」をここで吸収するため。
//   target:  右クリックした要素のデータ (null のときは出さない)
//   title:   見出し (関数)。要素のデータから名前を返す
//   fields:  「プロパティ」タブに並べる項目 [{ path, label }]。すべて読み取り専用
//   onClose: 閉じるとき
const WIDTH = 320;

// 内部の値 (d3 が付けた _xxx や、ライブラリが付けた循環参照) を外して、JSON で見られる形にする。
function plain (target) {
    const seen = new WeakSet();

    return JSON.parse(JSON.stringify(target, (key, value)=> {
        if (key.startsWith('_') && key!=='_id')
            return undefined;

        if (value && typeof value==='object') {
            if (seen.has(value))
                return undefined;

            seen.add(value);
        }

        return value;
    }));
}

export default function DiagramInspector (props) {
    const { target, title, fields = [], onClose } = props;

    // colonoscope は、項目の値が文字列でないと描画できず、画面ごと落ちる。
    // d3 が正規化したデータでは、同じ名前の項目がオブジェクトのこともあるので、
    // 文字・数値・真偽値として読める項目だけを並べ、読めないときは見出しを代わりの値にする。
    const readable = (t, path)=> {
        const v = getByPath(t, path);

        return typeof v==='string' || typeof v==='number' || typeof v==='boolean';
    };

    const safeTitle = (t)=> {
        const v = typeof title==='function' ? title(t) : title;

        return typeof v==='string' && v!=='' ? v : String(t._id ?? t.id ?? '');
    };

    const tabs = [
        {
            key: 'props',
            label: 'プロパティ',
            fields: target
                ? fields.filter(f=> readable(target, f.path)).map(f=> ({ ...f, type: 'readonly' }))
                : [],
        },
        {
            key: 'json',
            label: 'JSON',
            content: (t)=> (
                <pre style={{ margin: 0, padding: 8, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(plain(t), null, 2)}
                </pre>
            ),
        },
    ];

    return (
        <Colonoscope target={target}
                     title={safeTitle}
                     tabs={tabs}
                     width={WIDTH}
                     onClose={onClose}
                     // コンテンツエリアの右端に、上から下まで。図のドラッグを邪魔しないよう、枠の外には広げない。
                     style={{ position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 5 }}/>
    );
}

export { getByPath };
