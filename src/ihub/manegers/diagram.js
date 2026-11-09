import { useCallback, useRef } from 'react';

import { isWrittenHere, useGetDataQuery } from '../redux/api/dataApi.js';

// 図 (d3 のライブラリ) に渡すデータを作る。
// names は使うコレクション、build は { 'er/entities': [...], ... } から図のデータを作る関数。
// このタブの書き込み (ドラッグした位置の保存) では作り直さず、ほかからの変更 (エディタ・git・別のタブ) のときだけ作り直す。
// (作り直すと、図を描き直して、表示している位置が初めに戻るため)
// 戻り値の version は、作り直すたびに増える。図の部品の key に使う。
// 戻り値の rebuild() を呼ぶと、このタブの次の書き込みのあとにも作り直す。
// (サイズの変更など、描き直さないと図に出ない書き込みの前に呼ぶ。書き込めなかったときは rebuild(false) で取り消す)
export function useDiagramData (names, build) {
    const { data: all } = useGetDataQuery();
    const built = useRef(null);
    const force = useRef(false);

    const etags = names.map(name=> all.etags[name]);

    const changed = !built.current
          || etags.some((etag, i)=> etag!==built.current.etags[i] && (force.current || !isWrittenHere(etag)));

    if (changed) {
        force.current = false;

        built.current = {
            etags,
            version: built.current ? built.current.version + 1 : 0,
            data: build(Object.fromEntries(names.map(name=> [name, all.collections[name]]))),
        };
    } else {
        built.current.etags = etags;
    }

    const rebuild = useCallback((on = true)=> { force.current = on; }, []);

    return { ...built.current, rebuild };
}

// 入れ子のレコード (children) も含めて、id からレコードを引く。(無ければ null)
export function findRecord (records, key, id) {
    for (const record of records) {
        if (record[key]===id)
            return record;

        const found = findRecord(record.children || [], key, id);

        if (found)
            return found;
    }

    return null;
}
