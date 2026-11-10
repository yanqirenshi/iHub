import { useCallback, useRef } from 'react';

import { useConfig } from '../config.js';
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

// 図のカメラ (移動位置と拡大縮小 { k, x, y }) を、ブラウザの localStorage に保管して、次に開いたときに同じ位置に戻す。
// 人ごと・ブラウザごとの保管で、data/ は変えない。鍵は `ihub:{app.name}:view:{code}`。
// (開発中は、どのアプリも localhost:3000 で開くので、アプリの名前 app.name で分ける。code は図ごとの名前)
const VIEW_KEY = (app_name, code)=> `ihub:${app_name}:view:${code}`;

// localStorage が使えないとき (保管できない設定など) でも、図を作り直したときに位置を引き継げるように、このページの中の控えも持つ。
const viewMemory = new Map();

// { k, x, y } として使える値か。(数で、k は 0 より大きい) 使えないときは null
function validView (v) {
    if (!v || typeof v!=='object')
        return null;

    const ok = [v.k, v.x, v.y].every(n=> typeof n==='number' && Number.isFinite(n));

    return ok && v.k>0 ? { k: v.k, x: v.x, y: v.y } : null;
}

// 保管した値。無い・壊れている・localStorage が使えないときは null (= 初めの位置)
function readView (key) {
    try {
        const v = validView(JSON.parse(window.localStorage.getItem(key)));

        if (v)
            return v;
    } catch (e) {
        // 使えない・壊れた値: 黙って、控え (無ければ初めの位置) を使う
    }

    return viewMemory.get(key) || null;
}

function writeView (key, view) {
    const v = validView(view);

    if (!v)
        return;

    viewMemory.set(key, v);

    try {
        window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {
        // 保管できなくても、図は動く
    }
}

// 図のカメラを保管して戻す。戻り値の関数に、作った Rectum (d3 の図) を渡す。
//
//   const bindView = useDiagramView('er');
//   ...
//   const rectum = new Rectum({ transform: INITIAL_VIEW, ... });
//   bindView(rectum);       // 保管した値があれば、その位置に戻す。操作の終わりに保管する
//   rectum.data(data);
//
// - code: 図ごとの名前。(例: 'er')
// - 保管した値が無い (初めて開く)・壊れている・localStorage が使えないときは、何もせず、Rectum の初めの位置のまま。
// - 図を作り直すたびに呼ぶ。(保管した位置で作り直される)
// - 戻したときは保管し直さない。(d3.svg の view() は onViewChange を呼ばない)
export function useDiagramView (code) {
    const { app } = useConfig();
    const key = VIEW_KEY(app.name, code);

    return useCallback((rectum)=> {
        if (typeof rectum.view!=='function' || typeof rectum.onViewChange!=='function')
            return rectum;

        const saved = readView(key);

        if (saved)
            rectum.view(saved);

        rectum.onViewChange((view)=> writeView(key, view));

        return rectum;
    }, [key]);
}
