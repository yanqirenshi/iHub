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
//                 (古い名前の PAGE_COCKPIT は、PAGE_BRIDGE の別名として効く。両方あるときは PAGE_BRIDGE を優先して重ねる)
//                 selected   … 上書きする
//                 list       … code が同じものは差し替え、無いものは末尾に足す。{ code, hidden: true } は消す
//   panels:     { PAGE_DATA: { dfd: Dfd } }           タブの code → パネルの部品。既定に重ねる。({ tab })=> 部品。(既定 {})
//   help:       { sections }                          Help の内容。(部品の配列。各部品は { size } を受け取る。既定 いまの 3 つ)
//   github:     { token }                             個人用アクセストークン
//   diagrams:   { er: { grid }, tm: { grid }, classes: { grid, header } }
//                                                     ER 図・TM 図・クラス図の設定。grid は d3.er・d3.ter・d3.classes の grid の設定を、そのまま渡す。
//                 (例: { draw: false } でグリッド線を描かない。{ size, span } でグリッドの範囲と間隔。既定 渡さない)
//                 classes.header … クラスの箱のヘッダーの色。{ by: 'layer', colors: { domain: '#fde68a', ... } }
//                                  by はクラスのレコードの項目のパス、colors は項目の値 → 色 (文字列) か d3.classes の header ({ background, font })。(既定 塗らない)
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
    diagrams: { er: {}, tm: {}, classes: {} },
};

function required (value, path) {
    if (value===undefined || value===null)
        throw new Error(`IHub の設定に ${path} がありません。`);

    return value;
}

// 古い名前のページ id。(新しい id → 古い id)
// 古い id で tabs・panels を書いているアプリが、そのまま効くようにする。
export const PAGE_ID_ALIASES = {
    PAGE_BRIDGE: 'PAGE_COCKPIT',
};

// 古い id の tabs・panels を、新しい id に重ねる。両方あるときは、新しい id を優先する。
//   tabs   … list は、古い id の list のあとに、新しい id の list を重ねる。selected は新しい id を優先
//   panels … code が同じものは、新しい id が上書きする
function withPageAliases (tabs, panels) {
    const t = { ...tabs };
    const p = { ...panels };

    for (const [id, old] of Object.entries(PAGE_ID_ALIASES)) {
        if (tabs[old])
            t[id] = tabs[id]
                ? { ...tabs[old], ...tabs[id], selected: tabs[id].selected ?? tabs[old].selected, list: [...(tabs[old].list || []), ...(tabs[id].list || [])] }
                : tabs[old];

        if (panels[old])
            p[id] = { ...panels[old], ...panels[id] };
    }

    return { tabs: t, panels: p };
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

    const { tabs, panels } = withPageAliases({ ...DEFAULT_CONFIG.tabs, ...config.tabs },
                                             { ...DEFAULT_CONFIG.panels, ...config.panels });

    return {
        ...config,
        app:        { ...DEFAULT_CONFIG.app,        ...config.app },
        menuColors: { ...DEFAULT_CONFIG.menuColors, ...config.menuColors },
        colors:     { ...DEFAULT_CONFIG.colors,     ...config.colors },
        tabs,
        panels,
        help:       { ...DEFAULT_CONFIG.help,       ...config.help },
        github:     { ...DEFAULT_CONFIG.github,     ...config.github },
        diagrams:   {
            er: { ...DEFAULT_CONFIG.diagrams.er, ...config.diagrams?.er },
            tm: { ...DEFAULT_CONFIG.diagrams.tm, ...config.diagrams?.tm },
            classes: { ...DEFAULT_CONFIG.diagrams.classes, ...config.diagrams?.classes },
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
