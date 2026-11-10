# @yanqirenshi/ihub.core

iHub のコア (画面の部品) です。
アプリの設計データ (ER 図・TM・画面遷移図・システム構成図・Systemic Design・WBS など) を、図や表で見て、編集する画面を作ります。
データは、API サーバー ([@yanqirenshi/ihub.srv](../ihub.srv/README.md)) から読み書きします。

親の issue: [#65](https://github.com/yanqirenshi/iHub/issues/65)

## 入れる

新しいアプリは、雛形から作ります。(マニュアルの「導入のしかた」)

```
npx --yes --package=@yanqirenshi/ihub.core --package=@yanqirenshi/ihub.srv -- ihub-srv init --app
npm install
npx ihub-srv init
npm start
```

`ihub-srv init --app` が、`package.json`・`src/index.js` などのアプリのファイルを作ります。
(雛形の `package.json` は React 19 を使います。React 18.3.1 以上の 18 でも動きます)
すでにあるアプリに入れるときは、次のとおりです。

```
npm install @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

iHub をコピーして使っていたアプリは、マニュアルの「コピー版からの移行」を見てください。

次のパッケージは、アプリのものと 1 つにするため、アプリで入れます。(peerDependencies)

`react`・`react-dom` (18.3.1 以上の 18 か 19)・`react-redux`・`@reduxjs/toolkit`・`react-router-dom`・`@mui/material`・`@mui/icons-material`・`@emotion/react`・`@emotion/styled`

## 使う

アプリの `src/index.js` で、設定 (`config`) を組み立てて、`<IHub>` に渡します。
参照アプリ (このリポジトリのルートの `src/index.js`) が、そのまま見本です。

```jsx
import { IHub, pages } from '@yanqirenshi/ihub.core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router-dom';

import { PAGES, makePages } from './config/ACCOUNT_MENUS.js';
import OPERATOR_ITEMS from './config/OPERATOR_ITEMS.js';
import Operators from './operators/Operators.js';
import { withIcons, withoutIcons } from './operators/labels.js';
import NotFoundWbsNodeData from './wbs/NotFoundWbsNodeData.js';
import NotFoundWbsNodeComponent from './wbs/NotFoundWbsNodeComponent.js';
import './index.css';

// 設定は、モジュールの中で 1 つだけ作ります。(作り直すと、ストアも作り直されます)
const config = {
    app:       { name: 'my-app' },
    menus:     { pages: PAGES, makePages },
    operators: { items: OPERATOR_ITEMS, Leafs: Operators, labels: { withIcons, withoutIcons } },
    wbs: {
        page: (path)=> import(`./wbs/${path}.js`),
        NotFoundData: NotFoundWbsNodeData,
        NotFoundComponent: NotFoundWbsNodeComponent,
    },
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <IHub config={config}>
        <Routes>
          <Route path='/'     element={<pages.Cockpit/>} />
          <Route path='/data' element={<pages.Data/>} />
          <Route path='/wbs/:wbs_id' element={<pages.WbsNode/>} />
        </Routes>
      </IHub>
    </React.StrictMode>
);
```

### 設定 (config)

| 項目 | 内容 | 既定 |
|---|---|---|
| `app.name` | 画面の名前。書き込んだ画面の id を API サーバーへ送るヘッダー名 (`X-{name}-Client`) に使う。API サーバー (`ihub-srv --app-name`・`createApp` の `app_name`) と同じ名前にする | `iHub` |
| `menus` | サイドメニュー。`pages` は既定のページ、`makePages` は個人の設定 (on/off) を反映したページを作る関数 | (必須) |
| `menuColors` | サイドメニューの色 (`background`・`text`・`avatar`) | `{}` |
| `colors` | 配色 (`base`・`main`・`sub`・`accent`)。CSS の色 (`'#rrggbb'`) | `{}` |
| `operators` | ドック。`items` はボタンの一覧、`Leafs` は吹き出しの中身、`labels` は `{ withIcons, withoutIcons }` | (必須) |
| `wbs` | WBS のノードのページ。`page` はページを読み込む関数、`NotFoundData`・`NotFoundComponent` はページが無いときの表示 | (必須) |
| `tabs` | ページのタブ。`{ ページの id: { selected, list } }`。既定のタブに重ねる ([ページのタブとパネルを足す](#ページのタブとパネルを足す)) | `{}` |
| `panels` | タブの code → パネルの部品。`{ ページの id: { code: 部品 } }`。既定に重ねる | `{}` |
| `help` | Help の内容 (`sections`。部品の配列) | iHub の 3 つ |
| `github` | GitHub の個人用アクセストークン (`token`) | 無し |

- 動的 `import()` (`wbs.page`) は、ページのあるアプリ側に書きます。(webpack がアプリのフォルダを束ねるため)
- 必須の項目が無いときは、起動したときに、どの項目が無いかを示すエラーになります。
- 詳しくは、`src/config.js` のコメントを見てください。

## ページのタブとパネルを足す

タブのあるページ (`pages.Data`・`pages.Batchs`・`pages.Business` など) は、タブの一覧と、タブごとのパネルの表で描いています。
アプリは、コアの中を触らずに、`config.tabs` でタブを、`config.panels` でパネルを重ねられます。
(ページの id は、`hooks/usePageTabs.js` の `TAB_DEFS` の名前です。`PAGE_DATA`・`PAGE_BATCHS`・`PAGE_BUSINESS`・`PAGE_DESIGN` など)

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

### ページの id

| ページの id | ページ | タブの code | 初めに開くタブ |
|---|---|---|---|
| `PAGE_API` | `pages.Api` (参照アプリでは `/api`) | `wbs`・`help` | `wbs` |
| `PAGE_BATCHS` | `pages.Batchs` (参照アプリでは `/batchs`) | `wbs`・`help` | `wbs` |
| `PAGE_BPMN` | `docPages.BPMN` (参照アプリでは `/bpmn`) | `palettes`・`styles`・`methods`・`overview` | `palettes` |
| `PAGE_BUSINESS` | `pages.Business` (参照アプリでは `/business`) | `systemic-design`・`tm`・`procedures`・`wbs`・`help` | `tm` |
| `PAGE_COCKPIT` | `pages.Cockpit` (参照アプリでは `/`) | `cockpit`・`overview` | `cockpit` |
| `PAGE_CLASSES` | `pages.Classes` (参照アプリでは `/classes`) | `class-diagram`・`wbs`・`help` | `class-diagram` |
| `PAGE_DATA` | `pages.Data` (参照アプリでは `/data`) | `er-diagram`・`wbs`・`help` | `er-diagram` |
| `PAGE_DDD` | `pages.DDD` (参照アプリでは `/ddd`) | `ubiquitous-language`・`model-driven-design`・`hands-on-modeler`・`declarative-design`・`layer-architecture`・`overview` | `layer-architecture` |
| `PAGE_DESIGN` | `pages.Design` (参照アプリでは `/design`) | `ui-panels`・`ui-assemblies`・`ui-parts`・`ui-events`・`wbs`・`help` | `ui-parts` |
| `PAGE_DEVOPS` | `pages.DevOps` (参照アプリでは `/devops`) | `bpmn`・`wbs`・`help` | `bpmn` |
| `PAGE_MARKETS` | `pages.Markets` (参照アプリでは `/markets`) | `user-scenario`・`customer-journey-map`・`use-case`・`wbs`・`help` | `user-scenario` |
| `PAGE_MESSAGES` | `pages.Messages` (参照アプリでは `/message`) | `model`・`wbs`・`help` | `wbs` |
| `PAGE_ORGANIZATIONS` | `pages.Organizations` (参照アプリでは `/organizations`) | `wbs`・`help` | `wbs` |
| `PAGE_SCREENS` | `pages.Screens` (参照アプリでは `/screens`) | `screen-transition-diagram`・`screens`・`wbs`・`help` | `screen-transition-diagram` |
| `PAGE_SYSTEMS` | `pages.SystemEnvironment` (参照アプリでは `/system-environment`) | `system-configuration-diagram`・`wbs`・`help` | `system-configuration-diagram` |
| `PAGE_ACCOUNT` | `pages.Account` (参照アプリでは `/account`) | `menus`・`operators`・`pages` | `menus` |
| `PAGE_EXTERNAL_RESOURCES` | `pages.ExternalResources` (参照アプリでは `/external-resources`) | `wbs` | `wbs` |
| `PAGE_SCRUM` | `pages.Scrum` (参照アプリでは `/scrum`) | `timeline`・`gantt-chart`・`issues`・`pull-requests`・`repositories`・`projects`・`account`・`help` | `projects` |

タブの名前 (label) は、`hooks/usePageTabs.js` の `TAB_DEFS` にあります。
`TabbedPage` で作った自分のページは、`pageId` に、好きな id (`PAGE_MY` など) を付けられます。

## GitHub との接続

画面は、GitHub (Scrum・コックピット・Issue の追加) に、次のどちらかのトークンで接続します。
両方あるときは、OAuth のトークンを先に使います。

1. OAuth で得たトークン。API サーバー ([@yanqirenshi/ihub.srv](../ihub.srv/README.md)) に OAuth App の Client ID と Client secret を設定すると使えます。(環境変数 `GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET`、または `createApp({ github })`)
Scrum のページの Account タブの `GithubOAuth` (認証・切断のボタンと状態) で、認証します。
2. 個人用アクセストークン。設定の `github.token` に渡します。

どちらも設定しないときは、GitHub には接続しません。(ほかの機能は、いままでどおり使えます)
OAuth App の作り方と環境変数は、[GitHub との連携](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/github.md) を見てください。
`GithubOAuth` は、自分のページにも置けます。(`import { GithubOAuth } from '@yanqirenshi/ihub.core'`)

## 公開しているもの

```js
import { IHub, pages, Frame } from '@yanqirenshi/ihub.core';
```

| 名前 | 内容 |
|---|---|
| `IHub` | 画面全体。テーマ・全体のスタイル・Redux のストア・ルーター・データの読み込み・GitHub の接続をまとめて、`children` を描く |
| `ConfigProvider`・`useConfig`・`resolveConfig`・`DEFAULT_CONFIG`・`clientHeaderName` | 設定 |
| `createStore` | 設定からストアを作る (`IHub` が使う) |
| `pages` | ページ (`pages.Cockpit`・`pages.Data`・`pages.WbsNode` など) |
| `docPages` | ドキュメントのページ (`docPages.ER`・`docPages.TM` など) |
| `panels` | ページの中身 (`panels.ER`・`panels.TM` など) |
| `GithubOAuth`・`Frame`・`FrameTabs`・`FrameWbsNode`・`FrameWbsNodeTabs`・`TabbedPage`・`Link`・`TableTMRelationships` など | 中間の部品 (`components/assemblies/index.js`) |
| `ItemWbsNode`・`LinkWBS`・`Tabs` など | 小さな部品 (`components/parts/index.js`) |
| `HelpSlide` | Help のセクションで使う、1 枚のスライド (0.2.4 以降。[Help を差し替える](#help-を差し替える)) | 
| `HelpSlide` | Help のセクションで使う、1 枚のスライド (0.2.4 以降。[Help を差し替える](#help-を差し替える)) |
| `usePageTabs`・`mergeTabs` | ページのタブ |
| `manegers`・`wbs`・`useWbs`・`sogh` | データのマネージャ |
| `dataApi`・`useGetDataQuery`・`usePatchCollectionMutation`・`useAddRecordMutation`・`usePatchRecordMutation`・`useCollections`・`errorMessage` | API サーバーからのデータの読み書き |
| `fetchRepositories`・`fetchProjectsV2` | GitHub (Scrum) |

## CSS

`<IHub>` が、bulma と iHub の CSS (`index.css`) を読みます。
アプリの `index.css` は、iHub の CSS のあとに読み込んで、見た目を上書きします。
そのため、`src/index.js` では、`@yanqirenshi/ihub.core` の import より後に、アプリの `index.css` を import してください。

`index.css` だけを読みたいときは、`@yanqirenshi/ihub.core/index.css` で読めます。

## 雛形 (examples)

| パス | 内容 |
|---|---|
| `examples/data/` | `data/` の雛形。`ihub-srv init` がコピーします |
| `examples/wbs/` | WBS のノードのページの例。`src/wbs/` にコピーして使えます |
| `examples/app/` | アプリのファイル (`src/`・`public/`・`.gitignore` など) の雛形。`ihub-srv init --app` がコピーします。`src/` と `public/` は、iHub のリポジトリの参照アプリから、ビルドのときに作ります |

`@yanqirenshi/ihub.core/examples/*` から、パスで読めます。

## ビルド

`src/` を、Babel で `dist/` (ESM) に変換します。
(CRA は、`node_modules` の JSX を変換しないため)

```
npm run build -w @yanqirenshi/ihub.core
```

- 開発中は、`npm run build:watch -w @yanqirenshi/ihub.core` で、直すたびに自動でビルドします。(iHub のリポジトリのルートの `npm start` が、一緒に動かします)
- `dist/` は、git に入れません。
- `package.json` に `"type": "module"` は書いていません。(webpack が、`dist/` を厳密な ESM として扱い、`import sogh from 'sogh'` のように、CommonJS のパッケージの既定の import が動かなくなるため)
