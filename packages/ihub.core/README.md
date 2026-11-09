# @yanqirenshi/ihub.core

iHub のコア (画面の部品) です。
アプリの設計データ (ER 図・TM・画面遷移図・システム構成図・Systemic Design・WBS など) を、図や表で見て、編集する画面を作ります。
データは、API サーバー ([@yanqirenshi/ihub.srv](../ihub.srv/README.md)) から読み書きします。

親の issue: [#65](https://github.com/yanqirenshi/iHub/issues/65)

## 入れる

```
npm install @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

次のパッケージは、アプリのものと 1 つにするため、アプリで入れます。(peerDependencies)

`react`・`react-dom`・`react-redux`・`@reduxjs/toolkit`・`react-router`・`react-router-dom`・`@mui/material`・`@mui/icons-material`・`@emotion/react`・`@emotion/styled`

`tion` (iHub が使うパッケージ) は、`react-router-dom` の 6 を求めているため、`react-router-dom` の 7 を使うときは、アプリの `package.json` に次の `overrides` が要ります。
(無いと、`npm install` が `ERESOLVE` で失敗します)

```json
{
  "overrides": {
    "tion": {
      "react-router-dom": "$react-router-dom"
    }
  }
}
```

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
| `help` | Help の内容 (`sections`) | iHub の 3 つ |
| `github` | GitHub の個人用アクセストークン (`token`) | 無し |

- 動的 `import()` (`wbs.page`) は、ページのあるアプリ側に書きます。(webpack がアプリのフォルダを束ねるため)
- 必須の項目が無いときは、起動したときに、どの項目が無いかを示すエラーになります。
- 詳しくは、`src/config.js` のコメントを見てください。

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
| `Frame`・`FrameTabs`・`FrameWbsNode`・`FrameWbsNodeTabs`・`Link`・`TableTMRelationships` など | 中間の部品 (`components/assemblies/index.js`) |
| `ItemWbsNode`・`LinkWBS`・`Tabs` など | 小さな部品 (`components/parts/index.js`) |
| `usePageTabs` | ページのタブ |
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
| `examples/app/wbs/` | `NotFoundWbsNodeData.js`・`NotFoundWbsNodeComponent.js` の雛形。`src/wbs/` にコピーして、設定の `wbs` に渡します |

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
