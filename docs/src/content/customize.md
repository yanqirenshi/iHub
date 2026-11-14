# カスタマイズ

## 設定の渡し方 (`src/index.js`)

iHub 本体 (`@yanqirenshi/ihub.core`) は、アプリのファイル (`src/config/`・`src/operators/`・`src/wbs/` など) を import しません。
アプリに固有のものは、`src/index.js` で設定 (`config`) にまとめて、`<IHub>` に渡します。

```jsx
import { IHub } from '@yanqirenshi/ihub.core';
// (ほかの import は省略)

// 作り直さないように、モジュールの中で 1 つだけ作ります。
const config = {
    app: { name: 'iHub' },
    menus: { pages: PAGES, makePages },
    menuColors: ACCOUNT_MENU_COLORS,
    colors: COLORS,
    operators: { items: OPERATOR_ITEMS, Leafs: Operators, labels: { withIcons, withoutIcons } },
    wbs: {
        page: (path)=> import(`./wbs/${path}.js`),
        NotFoundData: NotFoundWbsNodeData,
        NotFoundComponent: NotFoundWbsNodeComponent,
    },
    github: { token: process.env.REACT_APP_GITHU_PARSONAL_TOKEN },
};

root.render(
    <React.StrictMode>
      <IHub config={config}>
        <Router/>
      </IHub>
    </React.StrictMode>
);
```

| 項目 | 内容 | 既定 |
|---|---|---|
| `app.name` | 画面の名前。書き込んだ画面の id を API サーバーへ送るヘッダー名 (`X-{name}-Client`) にも使います。英数字とハイフン以外の文字は `-` にして、小文字にします | `iHub` |
| `menus` | サイドメニュー。`pages` は既定のページ (`ACCOUNT_MENUS.js` の `PAGES`)、`makePages` は個人の設定 (on/off) を反映したページを作る関数です | (必須) |
| `menuColors` | サイドメニューの色 (`ACCOUNT_MENU_COLORS.js`) | `{}` |
| `colors` | アプリの配色 (`COLORS.js`) | `{}` |
| `operators` | ドック。`items` はボタンの一覧、`Leafs` は吹き出しの中身、`labels` はボタンのアイコンを差し込む関数 | (必須) |
| `wbs` | WBS のノードのページ。`page` はページを読み込む関数、`NotFoundData` はデータに無いとき、`NotFoundComponent` はページのファイルが無いときの表示です | (必須) |
| `tabs` | ページのタブ。`{ ページの id: { selected, list } }`。既定のタブに重ねる (下の「ページのタブとパネルを足す」) | `{}` |
| `panels` | タブの code → パネルの部品。`{ ページの id: { code: 部品 } }`。既定に重ねる | `{}` |
| `help` | Help の内容 (`sections`。部品の配列) | iHub の 3 つ |
| `github` | GitHub の個人用アクセストークン (`token`) | 無し |
| `diagrams` | ER 図・TM 図・クラス図の設定。`{ er: { grid }, tm: { grid }, classes: { grid, header } }`。`grid` は、d3.er・d3.ter・d3.classes の `grid` の設定を、そのまま渡す ([図のグリッド線](#/customize))。`classes.header` は、クラス図の見出しの色 ([クラス図の見出しの色](#/customize)) | 渡さない |

- WBS のページを読み込む動的 `import()` は、ページのあるアプリ側 (`src/index.js`) に書きます。(webpack が、アプリのフォルダを束ねるため)
- 必須の項目が無いときは、起動したときに、どの項目が無いかを示すエラーになります。
- 部品から設定を読むときは、`import { useConfig } from '@yanqirenshi/ihub.core'` の `useConfig()` を使います。

## ページのタブとパネルを足す

タブのあるページ (`pages.Data`・`pages.Batchs`・`pages.Business` など) は、タブの一覧と、タブごとのパネルの表で描いています。
アプリは、コアの中を触らずに、`config.tabs` でタブを、`config.panels` でパネルを重ねられます。
(ページの id は、`PAGE_DATA`・`PAGE_BATCHS`・`PAGE_BUSINESS`・`PAGE_DESIGN` などです。一覧は、`@yanqirenshi/ihub.core` の README の「ページの id」にあります)
(艦橋のページの id は `PAGE_BRIDGE` です。0.2.x までの `PAGE_COCKPIT` も、別名として効きます。両方あるときは `PAGE_BRIDGE` を優先して重ねます)

例: Batchs のページに、DFD のタブを足します。(UkiyoSnow/hub が、`usePageTabs.js` と `pages/Batchs.js` を書き換えて足していたものです)

```jsx
import Dfd from './components/panels/Dfd.js';

const config = {
    // (省略)
    tabs:   { PAGE_BATCHS: { list: [{ code: 'dfd', label: 'DFD' }] } },   // タブを足す
    panels: { PAGE_BATCHS: { dfd: Dfd } },                              // そのタブに出すパネル
};
```

- パネルは、`({ tab })` を受け取る関数の部品です。`tab` は、選んでいるタブ (`{ code, label }`) です。
- パネルの部品は、モジュールの中で 1 つだけ作ります。(描画のたびに作り直すと、タブを切り替えるたびに作り直されます)
- 選んだタブは、URL の `?tab=` で決まります。(例: `/batchs?tab=dfd`)

`tabs[ページの id]` の重ね方:

| 項目 | 内容 |
|---|---|
| `selected` | 初めに開くタブの code。既定を上書きします |
| `list` | タブの一覧。`code` が同じものは差し替え、無いものは末尾に足します |
| `{ code, hidden: true }` | そのタブを消します。(消したタブが初めに開くタブのときは、先頭のタブになります) |

```jsx
tabs: {
    PAGE_BATCHS: {
        selected: 'dfd',                                  // 初めに DFD を開く
        list: [
            { code: 'dfd', label: 'DFD' },                // 足す
            { code: 'wbs', label: '作業' },               // 名前を変える (差し替え)
            { code: 'help', hidden: true },               // Help のタブを消す
        ],
    },
},
```

`panels[ページの id][code]` は、既定のパネルを上書きします。
(既定のタブのパネルも、同じ code で差し替えられます。例: `panels: { PAGE_DATA: { 'er-diagram': MyEr } }`)
設定を渡さないときは、いままでどおりのタブとパネルです。

設計のページ (`PAGE_DESIGN`) の 4 つのパネル (`ui-panels`・`ui-assemblies`・`ui-parts`・`ui-events`) は、WBS の表を出します。
`panels.DesignPanels`・`DesignAssemblies`・`DesignParts`・`DesignEvents` は、`start_id` (この id のノードから下だけを出す。無いときは `"1"`) を受け取れます。(0.2.2 以降)

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// 部品は、モジュールの中で 1 つだけ作る。
const withStartId = (Panel, start_id)=> function DesignWbs () { return <Panel start_id={start_id}/>; };

panels: { PAGE_DESIGN: { 'ui-panels': withStartId(panels.DesignPanels, '1007') } }
```

アプリのページも、同じ形で作れます。

```jsx
import { TabbedPage } from '@yanqirenshi/ihub.core';

const PANELS = { overview: Overview, notes: Notes };

export default function MyPage () {
    return <TabbedPage pageId="PAGE_MY" panels={PANELS}/>;
}

// 設定: tabs: { PAGE_MY: { selected: 'overview', list: [{ code: 'overview', label: '概要' }, { code: 'notes', label: 'メモ' }] } }
```

## Help を差し替える

`config.help.sections` に、部品の配列を渡すと、Help のページの内容 (縦に並ぶスライド) が変わります。
各部品は、`{ size }` (画面に収まる大きさ `{ w, h }`) を受け取ります。
既定は、iHub の 3 つです。

```jsx
import Section01 from './components/help/Section01.js';
import Section02 from './components/help/Section02.js';

const config = {
    // (省略)
    help: { sections: [Section01, Section02] },
};
```

セクションの中の 1 枚のスライドは、`HelpSlide` (`@yanqirenshi/ihub.core` が export します。0.2.4 以降) で作れます。
`HelpSlide` は、画面に収まる大きさ (`size`) の枠の中に、子要素を出します。
セクションは、`@splidejs/react-splide` の `Splide` で、スライドを並べます。(`@splidejs/react-splide` は、アプリの `dependencies` に、iHub 本体と同じ版の範囲 (`^0.7.12`) で入れてください)

```jsx
import { Splide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { HelpSlide } from '@yanqirenshi/ihub.core';

export default function Section01 ({ size }) {
    return (
        <Splide options={ { rewind: true } } aria-label="Help">
          <HelpSlide size={size}>
            <h2>はじめに</h2>
            <p>この画面の使い方です。</p>
          </HelpSlide>
        </Splide>
    );
}
```

## ページを足して、サイドメニューに出す

例として、`/my-page` に「自分のページ」を足します。

### 1. ページの部品を作る

`src/components/pages/MyPage.js` を作ります。
`Frame` で囲むと、サイドメニューとドックが付きます。

```jsx
import React from 'react';
import Container from '@mui/material/Container';

import { Frame } from '@yanqirenshi/ihub.core';

export default function MyPage () {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            自分のページです。
          </Container>
        </Frame>
    );
}
```

### 2. URL を決める

`src/Router.js` に、ルートを足します。

```jsx
import MyPage from './components/pages/MyPage.js';

// <Routes> の中に足す
<Route path='/my-page' element={<MyPage/>} />
```

### 3. サイドメニューに項目を足す

`src/config/ACCOUNT_MENUS.js` の項目の一覧 (`MAIN` など) に、項目を足します。

```js
const MAIN = [
    // (省略)
    { code: 'my-page', url: '/my-page', label: '自分のページ', icon: ICONS.data },
];
```

同じファイルの `ACCOUNT_MENU_PAGES` で、どのページ (iHub・Docs・Etc) に出すかを決めます。

```js
export const ACCOUNT_MENU_PAGES = [
    {
        label: 'iHub',
        items: [
            // (省略)
            { code: 'my-page', active: true },
        ],
    },
    // (省略)
];
```

- `code` は、ほかの項目と重ならないようにします。(重なると、起動したときにエラーになります)
- `active` は、表示するかどうかの既定値です。
- 先頭のページを、初めに開きます。
ページの名前 (`label`) は、アプリの名前などに変えてかまいません。

### 4. アイコンを足す (必要なとき)

`src/config/ICONS.js` に、SVG のパス (viewBox が `0 0 24 24` のもの) で、アイコンを足します。

```js
const ICONS = {
    // (省略)
    myPage: icon("M3 13h8V3H3zm0 8h8v-6H3z"),
};
```

## ドックのボタンを変える

ドックのボタンは、次の 3 つのファイルで決まります。

| ファイル | 内容 |
|---|---|
| `src/config/OPERATOR_ITEMS.js` | ボタンの一覧 (code・ラベル) |
| `src/operators/Operators.js` | ボタンの code ごとに、吹き出しの中身を選ぶ |
| `src/operators/labels.js` | ボタンのアイコン (Manipulater が持っていないもの) |

ボタンを足すときは、3 つを合わせて変えてください。
この 3 つは、`src/index.js` の設定の `operators` で iHub に渡しています。
アイコンの色には、ドックの色 (`src/operators/dockColor.js`。配色の主の色) を使います。
GitHub のボタンの吹き出し (Issue の追加) は、ihub.core の部品 [ProjectItemForm](#/components/assemblies/ProjectItemForm) を使います。(0.5.0 以降の雛形。`Operators.js` が `<ProjectItemForm root={root}/>` を描きます)

## 見た目を変える

### アプリの配色

`src/config/COLORS.js` に 4 つの色を書くと、アプリの配色をまとめて決められます。
色は、CSS の色 (`'#rrggbb'`) で書きます。
`null` のときは、それぞれの部品のこれまでの色になります。

| 名前 | 使うところ |
|---|---|
| `base` (地の色) | 画面の背景、CSS のクラス `theme-color1〜5` |
| `main` (主の色) | 文字、MUI の primary (タブ・スイッチなど)、ドックのボタンと吹き出しの枠、サイドメニューの背景、CSS のクラス `text-color1` |
| `sub` (補助の色) | 補助の文字 (MUI の text.secondary)、区切りの線、CSS のクラス `text-color2` |
| `accent` (差し色) | MUI の secondary、CSS のクラス `pair-color1〜5` |

iHub は、「梅紫と藤鼠」の配色にしています。

```js
const COLORS = {
    base: '#F4F1F6',   // 白藤
    main: '#574C57',   // 滅紫
    sub: '#A6A5C4',    // 藤鼠
    accent: '#9D5B8B', // 梅紫
};
```

- サイドメニューの背景は、`ACCOUNT_MENU_COLORS.js` の `background` を決めたときは、そちらを使います。
iHub は、サイドメニューを差し色の梅紫にするため、`background` に `{ r: 157, g: 91, b: 139 }` を書いています。
- ドックの選んでいないボタンの色 (灰色) は、変えられません。(@yanqirenshi/manipulater で決まっています)
- 部品のコードに直接書いてある色は、配色の設定では変わりません。

### サイドメニューの色

`src/config/ACCOUNT_MENU_COLORS.js` で、サイドメニューの背景の色と、文字の色を決めます。
iHub 本体 (`node_modules/` の中) を直す必要はありません。

| 項目 | 書き方 | 内容 |
|---|---|---|
| `background` | `{ r, g, b }` (0〜255) | 背景の色です。選択中の項目は白い背景になり、この色が文字の色になります。 |
| `text` | CSS の色 (`'#2b2b2b'` など) | 文字とアイコンの色です。背景が明るくて、白い文字が読みにくいときにだけ決めます。 |
| `avatar` | CSS の色 | メニューを開いているときの、アカウントの円 (アバターの周り) の色です。`null` のときは、配色の差し色 (`accent`) になります。(`accent` も `null` のときは、これまでの水色) |

`background` が `null` のときは、配色の主の色 (`COLORS.js` の `main`) を使います。
どちらも `null` のときは、iHub の既定の色 (紫の背景に、白い文字) になります。

背景を暗い色にするときは、`background` だけを決めます。
文字とアイコンは、白のままです。

```js
const ACCOUNT_MENU_COLORS = {
    background: { r: 3, g: 57, b: 115 },
    text: null,
};
```

背景を明るい色にするときは、`text` に暗い色を決めます。

```js
const ACCOUNT_MENU_COLORS = {
    background: { r: 255, g: 217, b: 0 },
    text: '#2b2b2b',
};
```

- `text` は、選択中の項目とページの一覧 (どちらも白い背景) の文字にも使います。
白い背景でも読める、暗い色にしてください。
- `text` を決めると、アイコンは白く反転せずに、SVG の色のまま表示されます。
SVG に色を付けていないときは、黒になります。

`text` を決めたときに、アイコンを文字と同じ暗い色にするには、`src/config/ICONS.js` の `<svg>` に `fill` を付けます。

```js
function icon (d, fillRule) {
    // (省略)
    return 'data:image/svg+xml,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2b2b2b">${path}</svg>`
    );
}
```

### 図のグリッド線を消す

ER 図・TM 図・クラス図は、背景にグリッド線を描きます。
設定の `diagrams` で、図ごとに、d3.er・d3.ter・d3.classes の `grid` の設定を渡せます。(値は、iHub では解釈せずに、そのまま渡します)

```jsx
const config = {
    // (省略)
    diagrams: {
        er: { grid: { draw: false } },         // ER 図のグリッド線を描かない
        tm: { grid: { draw: false } },         // TM 図のグリッド線を描かない
        classes: { grid: { draw: false } },    // クラス図のグリッド線を描かない (0.6.0 以降。d3.classes は draw だけを読む)
    },
};
```

| `grid` の項目 | 内容 | 既定 |
|---|---|---|
| `draw` | `false` にすると、グリッド線を描かない | `true` |
| `size` | グリッドを描く範囲 (原点から上下左右に、この大きさまで) | `10000` |
| `span` | グリッドの間隔 | `100` |

- `diagrams` を渡さないとき (または `grid` を渡さないとき) は、これまでどおり、グリッド線が出ます。
- ER 図・TM 図・クラス図は、それぞれ別に設定できます。(1 つだけ消すと、ほかは出ます)
- それ以外の図 (Overview・画面遷移図など) は、対象外です。
- (0.2.5 以降。クラス図は 0.6.0 以降)

### クラス図の見出しの色

クラス図の箱の見出し (クラス名の行) は、設定の `diagrams.classes.header` で、クラスの項目の値ごとに塗り分けられます。(0.6.0 以降)
雛形のアプリは、`layer` の値で塗り分けます。

```jsx
const config = {
    // (省略)
    diagrams: {
        classes: {
            header: {
                by: 'layer',                    // クラスのレコード (classes/classes.json) の項目。ドット区切りのパスでもよい
                colors: {                       // 項目の値 → 色
                    domain:      '#fde68a',     // 文字列は、見出しの背景の色
                    application: '#fecaca',
                    adapter:     '#bbf7d0',
                    framework:   { background: { color: '#1e3a8a' }, font: { color: '#ffffff' } },   // d3.classes の header の形でもよい
                },
            },
        },
    },
};
```

- `colors` に無い値のクラスと、`by` の項目が無いクラスは、塗りません。(白のまま)
- クラスのレコードに `header` (d3.classes の形。`{ background: { color }, font: { color } }`) を書くと、設定の色に重ねます。(レコードのほうを優先します)
- 色は、データには書きません。(色を変えるときに、データを書き換えなくて済むように)

### そのほかの見た目

`src/index.css` に、CSS を書きます。
`src/index.css` は、iHub の CSS (`@yanqirenshi/ihub.core` の `index.css`) のあとに読み込むので、iHub の見た目を上書きできます。
(`src/index.js` で、`<IHub>` を import したあとに、`import './index.css'` を書きます)

## アプリが足した図の位置を覚える

iHub の 7 つの図 (0.3.x までは 5 つ、0.5.x までは 6 つ) は、動かした位置と拡大の度合いを、ブラウザに覚えます。([図の編集](#/diagrams) の「図の位置と拡大を覚える」)
アプリが足したパネルの図 (d3.* の `Rectum`) でも、`useDiagramView` で同じように覚えられます。(0.2.7 以降)

```jsx
import React from 'react';
import { Rectum } from '@yanqirenshi/d3.dfd';
import { useDiagramView } from '@yanqirenshi/ihub.core';

const INITIAL_VIEW = { k: 1.0, x: 0.0, y: 0.0 };

function Diagram ({ data }) {
    // 図の code。アプリの図ごとに、ほかと重ならない名前にする。(iHub の図は er・tm・std・scd・overview・schedule)
    const bindView = useDiagramView('dfd');
    const [rectum, setRectum] = React.useState(null);

    React.useEffect(()=> {
        const r = new Rectum({ transform: INITIAL_VIEW });

        bindView(r);      // 覚えた位置があれば、その位置に戻す。操作が終わるたびに、覚える

        r.data(data);

        setRectum(r);
    }, [bindView, data]);

    // (省略) rectum を、図の部品に渡して描く
}
```

- `bindView(rectum)` は、`Rectum` を作ったあと、`data()` を呼ぶ前に呼びます。図を作り直すたびに呼ぶと、覚えた位置で作り直されます。
- 覚えたものが無い (初めて開く)・壊れている・`localStorage` が使えないときは、何もしません。`Rectum` の初めの位置 (`transform`) のままです。
- 鍵は、`ihub:{app.name}:view:{code}` です。
- `Rectum` のコンストラクタに `view`・`onViewChange` を渡す必要はありません。作ったあとに `bindView` を呼べば、位置を戻すことと、操作のたびに覚えることの両方を行います。
- `Rectum` が `view`・`onViewChange` を持つ必要があります。(`@yanqirenshi/assh0le` 0.5.9 以降。iHub の `dependencies` に入っています。古い `package-lock.json` のアプリは、`npm install` で更新されます)

## アプリの名前を出す

画面などに出る名前は、次のところで変えます。

| ファイル | 変えるところ | 出るところ |
|---|---|---|
| `src/config/ACCOUNT_MENUS.js` | 先頭のページの `label` | サイドメニューのページの名前 |
| `data/wbs/projects.json` | プロジェクトの `name` | WBS の最上位のノード |
| `public/index.html` | `<title>` | ブラウザのタブ |
| `package.json` | `name` | パッケージの名前 (`npm start` のログなど) |

