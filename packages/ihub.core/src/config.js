import React from 'react';

import Section01 from './components/pages/Help/Section01.js';
import Section02 from './components/pages/Help/Section02.js';
import Section03 from './components/pages/Help/Section03.js';

// iHub の設定。
// アプリ (src/index.js) が組み立てて <IHub config={config}> に渡し、
// コアの部品は useConfig() で読む。(コアからアプリのファイルを import しないため)
//
// {
//   app:        { name }                              画面の名前。書き込んだ画面の id を送るヘッダー名 (X-{name}-Client) に使う。(既定 'iHub')
//   menus:      { pages, makePages }                  サイドメニュー。(必須)
//                 pages      … 既定のページ。先頭のページを、初めに開く
//                 makePages  … 個人の設定 (on/off) を反映したページを作る関数。(actives)=> pages
//   menuColors: { background, text, avatar }          サイドメニューの色。(既定 {})
//   colors:     { base, main, sub, accent }           配色。(既定 {})
//   operators:  { items, Leafs, labels }              ドック。(必須)
//                 items      … ドックのボタン ({ a, b, c })
//                 Leafs      … ボタンを開いたときの部品
//                 labels     … { withIcons, withoutIcons }
//   wbs:        { page, NotFoundData, NotFoundComponent }   WBS のノードのページ。(必須)
//                 page       … (path)=> import(...)。動的 import は、ページのあるアプリ側に置く
//   tabs:       { PAGE_DATA: { selected, list } }     ページのタブ。既定 (hooks/usePageTabs.js の TAB_DEFS) に重ねる。(既定 {})
//                 selected   … 上書きする
//                 list       … code が同じものは差し替え、無いものは末尾に足す。{ code, hidden: true } は消す
//   panels:     { PAGE_DATA: { dfd: Dfd } }           タブの code → パネルの部品。既定に重ねる。({ tab })=> 部品。(既定 {})
//   help:       { sections }                          Help の内容。(部品の配列。各部品は { size } を受け取る。既定 いまの 3 つ)
//   github:     { token }                             個人用アクセストークン
//   diagrams:   { er: { grid }, tm: { grid } }        ER 図・TM 図の設定。grid は d3.er・d3.ter の grid の設定を、そのまま渡す。
//                 (例: { draw: false } でグリッド線を描かない。{ size, span } でグリッドの範囲と間隔。既定 渡さない)
// }
//
// 設定は作り直さずに、モジュールの中で 1 つだけ作って渡す。(作り直すと、ストアも作り直される)

// いまの iHub の値。(設定に無い項目に使う)
export const DEFAULT_CONFIG = {
    app: { name: 'iHub' },
    menuColors: {},
    colors: {},
    tabs: {},
    panels: {},
    help: { sections: [Section01, Section02, Section03] },
    github: { token: undefined },
    diagrams: { er: {}, tm: {} },
};

function required (value, path) {
    if (value===undefined || value===null)
        throw new Error(`IHub の設定に ${path} がありません。`);

    return value;
}

// 設定の無い項目を、既定で埋める。必須の項目が無いときは、どれが無いかを示して止まる。
export function resolveConfig (config = {}) {
    required(config.menus?.pages,                'menus.pages');
    required(config.menus?.makePages,            'menus.makePages');
    required(config.operators?.items,            'operators.items');
    required(config.operators?.Leafs,            'operators.Leafs');
    required(config.operators?.labels?.withIcons,    'operators.labels.withIcons');
    required(config.operators?.labels?.withoutIcons, 'operators.labels.withoutIcons');
    required(config.wbs?.page,                   'wbs.page');
    required(config.wbs?.NotFoundData,           'wbs.NotFoundData');
    required(config.wbs?.NotFoundComponent,      'wbs.NotFoundComponent');

    return {
        ...config,
        app:        { ...DEFAULT_CONFIG.app,        ...config.app },
        menuColors: { ...DEFAULT_CONFIG.menuColors, ...config.menuColors },
        colors:     { ...DEFAULT_CONFIG.colors,     ...config.colors },
        tabs:       { ...DEFAULT_CONFIG.tabs,       ...config.tabs },
        panels:     { ...DEFAULT_CONFIG.panels,     ...config.panels },
        help:       { ...DEFAULT_CONFIG.help,       ...config.help },
        github:     { ...DEFAULT_CONFIG.github,     ...config.github },
        diagrams:   {
            er: { ...DEFAULT_CONFIG.diagrams.er, ...config.diagrams?.er },
            tm: { ...DEFAULT_CONFIG.diagrams.tm, ...config.diagrams?.tm },
        },
    };
}

// 書き込んだ画面 (タブ) の id を API サーバーへ送るヘッダー名。
// X-{アプリ名}-Client。アプリ名の英数字とハイフン以外は - にして、小文字にする。
// @yanqirenshi/ihub.srv の clientHeader (app.mjs) と同じ規則。(ブラウザで動くため、srv を import できず、規則を複製している)
export function clientHeaderName (app_name) {
    return `x-${app_name.replace(/[^A-Za-z0-9-]+/g, '-').toLowerCase()}-client`;
}

const ConfigContext = React.createContext(null);

export function ConfigProvider ({ config, children }) {
    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

// resolveConfig を通した設定を返す。
export function useConfig () {
    const config = React.useContext(ConfigContext);

    if (!config)
        throw new Error('useConfig は、<IHub> の中で使ってください。');

    return config;
}
