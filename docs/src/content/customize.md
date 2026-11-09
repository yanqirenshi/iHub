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

- WBS のページを読み込む動的 `import()` は、ページのあるアプリ側 (`src/index.js`) に書きます。(webpack が、アプリのフォルダを束ねるため)
- 必須の項目が無いときは、起動したときに、どの項目が無いかを示すエラーになります。
- 部品から設定を読むときは、`import { useConfig } from '@yanqirenshi/ihub.core'` の `useConfig()` を使います。

## ページのタブとパネルを足す

タブのあるページ (`pages.Data`・`pages.Batchs`・`pages.Business` など) は、タブの一覧と、タブごとのパネルの表で描いています。
アプリは、コアの中を触らずに、`config.tabs` でタブを、`config.panels` でパネルを重ねられます。
(ページの id は、`PAGE_DATA`・`PAGE_BATCHS`・`PAGE_BUSINESS`・`PAGE_DESIGN` などです。一覧は、`@yanqirenshi/ihub.core` の README の「ページの id」にあります)

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

### そのほかの見た目

`src/index.css` に、CSS を書きます。
`src/index.css` は、iHub の CSS (`@yanqirenshi/ihub.core` の `index.css`) のあとに読み込むので、iHub の見た目を上書きできます。
(`src/index.js` で、`<IHub>` を import したあとに、`import './index.css'` を書きます)

## アプリの名前を出す

画面などに出る名前は、次のところで変えます。

| ファイル | 変えるところ | 出るところ |
|---|---|---|
| `src/config/ACCOUNT_MENUS.js` | 先頭のページの `label` | サイドメニューのページの名前 |
| `data/wbs/projects.json` | プロジェクトの `name` | WBS の最上位のノード |
| `public/index.html` | `<title>` | ブラウザのタブ |
| `package.json` | `name` | パッケージの名前 (`npm start` のログなど) |

