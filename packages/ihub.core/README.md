# @yanqirenshi/ihub.core

iHub のコア (画面の部品) です。
アプリの設計データ (ER 図・TM・クラス図・画面遷移図・システム構成図・Systemic Design・WBS など) を、図や表で見て、編集する画面を作ります。
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

求める版と、推奨 (雛形の版) の表は、マニュアルの [導入のしかた](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/setup.md) の「アプリで入れるパッケージの版」にあります。(Node.js は 22 以上)

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
          <Route path='/'     element={<pages.Bridge/>} />
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
| `diagrams` | d3.* で描く図の設定。`{ er, tm, classes, std, scd, overview, schedule }` のそれぞれに `{ grid }` (クラス図は `{ grid, header }`)。`grid` は、d3.* の `grid` の設定で、既定の `{ draw: false }` (グリッド線を描かない。0.7.0 以降) に重ねて渡す ([図のグリッド線](#図のグリッド線を消す))。`classes.header` は、クラスの箱のヘッダーの色 ([クラス図](#クラス図)) | 7 つの図とも `{ grid: { draw: false } }` |

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
| `PAGE_BRIDGE` | `pages.Bridge` (参照アプリでは `/`。0.3.0 以降) | `cockpit`・`overview`・`schedule` | `cockpit` |
| `PAGE_BUSINESS` | `pages.Business` (参照アプリでは `/business`) | `systemic-design`・`tm`・`entities`・`identifiers`・`attributes`・`relationships`・`procedures`・`wbs`・`help` (`entities`〜`relationships` は 0.12.0 以降。[ビジネスのページの TM の表](#ビジネスのページの-tm-の表)) | `tm` |
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
| `PAGE_SCRUM` | `pages.Scrum` (参照アプリでは `/scrum`) | `repositories`・`projects`・`account`・`help` | `projects` |

タブの名前 (label) は、`hooks/usePageTabs.js` の `TAB_DEFS` にあります。
`TabbedPage` で作った自分のページは、`pageId` に、好きな id (`PAGE_MY` など) を付けられます。

- 艦橋のページは、0.2.x まで「コックピット」でした。古い名前の `pages.Cockpit`・`panels.cockpit`・設定の `tabs.PAGE_COCKPIT`・`panels.PAGE_COCKPIT` は、別名として、そのまま使えます。(`PAGE_BRIDGE` と両方あるときは、`PAGE_BRIDGE` を優先して重ねます。古い名前は、将来の minor で消すことがあります)
- 艦橋のページの中の、自分が担当している Issue をカードで並べるタブの名前 (code `cockpit`・表示 `Cockpit`) は、変わっていません。

## 艦橋の Schedule タブ

艦橋 (`/`) の Schedule タブは、予定を、矢羽根 ([@yanqirenshi/d3.yabane](https://github.com/Foolsgolds/Assholes/tree/main/packages/d3.yabane)) で並べます。(0.4.0 以降) 矢羽根・WBS の箱・プロジェクトの箱を Ctrl + クリック (Mac は ⌘ + クリック) すると、インスペクタで書き換えられます。(0.9.0 以降。0.10.x までは右クリック。下の「Ctrl + クリックで書き換える」。0.8.x までは、見るだけでした)
WBS とプロジェクトの行には、マイルストーンを △ で描けます。(0.10.0 以降。下の「マイルストーン」)
予定は、WBS (`data/wbs/`) とは切り離して、`data/master_schedule/` に書きます。(0.7.0 以降) ファイルの形は、d3.yabane の入力と同じです。(0.8.0 以降。d3.yabane のショーケースのファイルを、そのまま置けます)

| ファイル | 中身 |
|---|---|
| `data/master_schedule/projects.json` | プロジェクト。いちばん左の列に描きます。(任意) |
| `data/master_schedule/wbs.json` | WBS (行)。プロジェクトの右に、入れ子の列で並びます。 |
| `data/master_schedule/workpackages.json` | ワークパッケージ。矢羽根になります。 |
| `data/master_schedule/milestones.json` | マイルストーン。WBS かプロジェクトの行に、△ で描きます。(任意。0.10.0 以降) |

どのファイルも、無くても動きます。(ワークパッケージも、描けるマイルストーンも無いときは、図の代わりに、書き方の知らせを出します)
0.7.0 の `rows.json` は `wbs.json` に、`items.json` は `workpackages.json` に、名前を変えてください。(古い名前のファイルがあると、`ihub-srv check` が知らせます)

```json
// projects.json
[
  { "id": 10, "name": "Project 10", "background": { "color": "#eaf4fc" } },
  { "id": 20, "name": "Project 20" }
]

// wbs.json
[
  { "id": 11,  "name": "WBS 10-1",   "project": 10 },
  { "id": 111, "name": "WBS 10-1-1", "parent": 11 },
  { "id": 21,  "name": "WBS 20-1",   "project": 20 }
]

// workpackages.json
[
  { "id": 1000, "parent": 111, "name": "画面の作成", "plan": { "from": "2026-11-01", "to": "2026-11-30" } },
  { "id": 1001, "parent": 11,  "name": "API", "plan": { "from": "2026-11-10", "to": "2026-12-10" }, "wbs": 1000003 },
  { "id": 1002, "project": 20, "name": "公開", "plan": { "from": "2026-12-15", "to": "2026-12-15" }, "url": "https://example.com/release" }
]

// milestones.json
[
  { "id": 1, "parent": 111, "name": "レビュー", "date": "2026-11-20" },
  { "id": 2, "project": 20, "name": "リリース", "date": "2026-12-20", "background": { "color": "#ffd900" } }
]
```

- プロジェクト: `id`・`name` を書きます。`id` は、プロジェクトの中で重ならないようにします。(WBS と同じ `id` でも構いません)
- WBS: `id`・`name` を書きます。最上位の WBS は、`project` にプロジェクトの `id` を書くと、そのプロジェクトの直下に入ります。`parent` に親の WBS の `id` を書くと、入れ子になり、深さごとに列が分かれます。(`parent` と `project` の両方があるときは、`parent` を使います)
- ワークパッケージ: `id`・`name`・`plan` と、`parent` (WBS の `id`) か `project` (プロジェクトの `id`) の少なくとも 1 つを書きます。(両方があるときは、`parent` を使います)
  - `plan` の `from`・`to` は、`'YYYY-MM-DD'` の日付で、どちらも書きます。`to` は、`from` と同じ日か、あとの日です。
  - `result` (実績の期間)・`progress` (進捗) も書けますが、描きません。(d3.yabane も、まだ描きません)
- WBS とワークパッケージの `id` は、またいで重ならないようにします。
- マイルストーン: `id`・`name`・`date` と、`parent` (WBS の `id`) か `project` (プロジェクトの `id`) の少なくとも 1 つを書きます。(0.10.0 以降。両方があるときは、`parent` を使います。下の「マイルストーン」)
- 行き先 (ワークパッケージ。任意) は、次のどちらか 1 つです。(両方は書けません)
  - `wbs`: **`data/wbs/` の** WBS のノード (プロジェクト・WBS・ワークパッケージ) の `id`。(`master_schedule/wbs` の `id` ではありません) 矢羽根を押すと、そのページ (`/wbs/{id}`) へ移ります。
  - `url`: `http://` か `https://` で始まる URL。矢羽根を押すと、そのページを新しいタブで開きます。
  - どちらも書かないと、矢羽根を押しても、何も起きません。
- 見た目 (任意。d3.yabane の共有型。書いた項目だけが、d3.yabane の既定に重なります): プロジェクト・WBS・ワークパッケージ・マイルストーンに書けます。

  | 項目 | 中身 | d3.yabane の既定 |
  |---|---|---|
  | `background` | `{ color, opacity }` (`opacity` は 0〜1) | `color` 白 |
  | `stroke` | `{ color, width, type }` (`type` は `solid`・`dashed`・`dotted`) | `#0e9aa7`・太さ 4・実線 (マイルストーンは `#e95464`・太さ 4・実線) |
  | `font` | `{ size, color, weight }` (`weight` は `'bold'`・`700` など) | 大きさ 33 |

  `background`・`stroke` は、プロジェクトと WBS では箱、ワークパッケージでは矢羽根、マイルストーンでは △ に効きます。`font` は、名前の文字に効きます。
- `ihub-srv check` が、形の誤り・日付の誤り・無いプロジェクト・無い WBS・輪になった入れ子・`parent` も `project` も無いワークパッケージ・`data/wbs/` に無い行き先の `wbs`・`wbs` と `url` の両方・`id` の重なりを知らせます。マイルストーンの `parent` も `project` も無いもの・無い先を指すもの・実在しない日付・`id` の重なりも知らせます。(0.10.0 以降) (図では、無い先を指す WBS と輪になった WBS は最上位として描き、無い先を指すワークパッケージとマイルストーンは描きません)
- 並び: プロジェクトは `projects.json` の順、WBS は `wbs.json` の順 (同じ親の下で) に、上から並びます。子の WBS を持つ箱の直下のワークパッケージは、子の WBS のあとに、開始日の順で並びます。(d3.yabane の並び方。プロジェクトと WBS には、配列の順を `order` として渡しています) 予定の無い WBS も出ます。
- 名前の列: 列 (深さ) ごとの幅は、その列の名前が収まる幅になります。(0.8.1 以降。d3.yabane 0.5.0 が、描いた名前を測って決めます。幅は、左の余白 33 + 名前の幅 + 右の余白 33) 名前が短ければ列は細く、長ければ太くなり、時間軸の始まる位置も、それに合わせて変わります。子の WBS を持たない箱は、右端の列まで伸びます。
  - 名前は、省略せずに出します。ただし、全角 30 文字ぶん (全角 1・半角 0.55 として数える) を超える名前だけ、末尾を `…` にします。(極端に長い名前で、列が広がりすぎないように)
  - 名前を測れなかった列 (画面に出ていないときなど) は、1 列の幅が 555 (名前の列が 2 つ以上のときは 333) になります。(0.8.0 と同じ幅)
  - 初めて開いたとき (位置を覚えていないとき) の拡大の度合いは、描いたあとの実際の幅 (名前の列と時間の目盛り) が、画面に収まる度合いです。(0.1〜0.4)
  - サイクル・幅を変えて図を作り直すときは、前の図が測った名前の幅を引き継ぎます。(0.8.2 以降。名前の列の幅は変わらず、1 度の描画で済みます。名前を書き換えたときは、その名前だけ測り直します)
- 時間の目盛りのサイクルは、図の右上の「日・週・月」のボタンで切り替えます。(0.7.0 以降) 選んだものは、ブラウザの `localStorage` に覚えます。(鍵は `ihub:{app.name}:schedule:cycle`。覚えたものが無い・壊れている・`localStorage` が使えないときは、週)
  - 1 目盛り (1 日・1 週・1 か月) の幅は、どのサイクルでも同じ (図の座標で 111。幅の段が 100% のとき) です。日は細かく横に長く、月は全体を短く見渡せます。(月は、時間に比例する軸なので、月の日数で少し違います。2 月は約 102)
  - 目盛りの見出し: 日は日の数字、週は週の初めの日 (`11/1` など。日曜始まり)、月は `YYYY-MM`。日・週では、月の見出しが、その上の段に出ます。
- 1 目盛りの幅は、「日・週・月」のボタンの左の「−」「＋」で変えます。(0.8.1 以降) 段は `50%`・`75%`・`100%`・`150%`・`200%`・`300%`・`400%` で、ボタンの間に今の段を出します。(100% = 111。いちばん端の段では、その向きのボタンは押せません)
  - 選んだ段は、サイクルごとに、ブラウザの `localStorage` に覚えます。(鍵は `ihub:{app.name}:schedule:width:{d|w|M}`。覚えたものが無い・壊れている・段に無い値・`localStorage` が使えないときは、100%) 日は狭く、月は広く、のように使い分けられます。
  - 変わるのは時間軸の横の長さだけです。(表示する期間・行の高さ・名前の列の幅は、変わりません) 幅を変えたときは、画面の中央にあった日付が、ほぼ中央に残るように、横の位置を合わせます。(拡大の度合いと縦の位置は、そのまま。開いてから図を動かしていないときも、今の拡大の度合いのまま) 拡大の度合いが変わらないので、1 目盛りの画面の幅は、段のとおりに変わります。
  - 幅を変えずに開いたとき (位置を覚えていないとき) の初めの拡大の度合いは、その段の図の全体が画面に収まる度合いです。
  - 位置合わせに使う時間軸の左端は、画面に出している図の実際の位置です。(名前の列の幅は、名前で変わるため)
  - 100% より狭い段では、目盛りの見出しの文字を、幅に合わせて小さくします。(隣の見出しと重ならないように。50% で半分の大きさ。読みにくいときは、拡大して読みます) 100% 以上の段の見出しは、100% と同じです。
- 表示する期間は、予定の一番早い `from` (マイルストーンの `date` が、それより早ければ、その日) から、一番遅い `to` (マイルストーンの `date` が、それより遅ければ、その日) までです。(マイルストーンの日付を入れるのは、0.10.0 以降)(前後に 1 目盛りずつの余白を付け、サイクルの初めと終わりにそろえます) 目盛りの数が少ないときは、右へ延ばします。(最小は、日 28・週 15・月 12)
- 同じ箱の中で、期間が重なる矢羽根は、重ならない段に分かれて描かれます。(0.5.0 以降)
- 行の区切り線 (横の線。色は `#aaa`) は、最上位の箱 (プロジェクト、または最上位の WBS) どうしの間に、図の左端から時間軸の右端まで引きます。
  - 入れ子の子どうし (子の WBS・親の箱の直下のワークパッケージの帯) の間にも、間の真ん中の高さに、親の箱の右端から時間軸の右端まで引きます。(0.8.3 以降。d3.yabane 0.7.0 から)
  - 同じ帯の中の段 (期間が重なって、下へ積んだ矢羽根) の間には、引きません。
- 今日の位置に、現在線 (縦の線) が出ます。今日が表示する期間の外のときは、出ません。(0.8.2 以降。d3.yabane 0.6.0 から。それまでは、時間軸の外に出ていました)
- 図の位置と拡大の度合いは、ほかの図と同じように、覚えます。サイクルで図の幅が大きく変わるので、サイクルごとに分けて覚えます。(図の code は `schedule:d`・`schedule:w`・`schedule:M`。0.6.x までの `schedule` で覚えたものは、使いません。幅の段ごとには分けません)
- 参照アプリの `data/master_schedule/` には、d3.yabane のショーケースのサンプル (Foolsgolds/Assholes の `showcase/src/demos/data/yabane/` の 3 ファイル) が、そのまま入っています。(0.8.0 以降。雛形 `examples/data/` には入っていません) `milestones.json` は、そのサンプルに合わせて、iHub で足したものです。(0.10.0 以降)

### マイルストーン (0.10.0 以降)

`data/master_schedule/milestones.json` に書いたマイルストーンを、WBS かプロジェクトの行の中の、`date` の位置に、△ と名前で描きます。(d3.yabane 0.9.0 から)

| 項目 | 必須 | 中身 |
|---|---|---|
| `id` | ○ | 整数。マイルストーンの中で重ならないようにします。(WBS・ワークパッケージ・プロジェクトと同じ値でも構いません) |
| `name` | ○ | △ の右に描く名前 |
| `date` | ○ | `'YYYY-MM-DD'` の日付。△ の頂点が、この日の位置に来ます。 |
| `parent` | | 置く行の WBS の `id` |
| `project` | | 置く行のプロジェクトの `id` |
| `description` | | 説明 (図には出ません) |
| `background`・`stroke`・`font` | | 見た目 (上の「見た目」) |

- `parent` か `project` の、どちらかを書きます。(両方があるときは、`parent` を使います。ワークパッケージと同じ) ほかの項目 (`order`・`wbs`・`url` など) は書けません。
- 同じ行の中では、日付の順に並びます。矢羽根やほかのマイルストーンと横に重なるときは、下の段に積みます。(d3.yabane が、「△ + 名前」の幅で重なりを見ます)
- ワークパッケージの期間の外の日付も、描きます。(表示する期間が広がります)
- ワークパッケージが 1 つも無くても、描けるマイルストーンがあれば、図を描きます。
- △ を押しても、何も起きません。(行き先は持ちません) Ctrl + クリック (Mac は ⌘ + クリック) で、インスペクタが出ます。(下の「Ctrl + クリックで書き換える」)
- `date` が実在しない日のもの・置く行が見つからないものは、描きません。(`ihub-srv check` が知らせます)
- `milestones.json` が無いときは、マイルストーンが無いものとして描きます。(0.9.x と同じ図)

### Ctrl + クリックで書き換える (0.9.0 以降。0.10.x までは右クリック)

矢羽根 (ワークパッケージ)・WBS の箱・プロジェクトの箱・マイルストーンの △ (0.10.0 以降) を Ctrl + クリック (Mac は ⌘ + クリック) すると、コンテンツエリアの右端に、インスペクタが出ます。([図のインスペクタを開く](#図のインスペクタを開く))(作りは、Overview タブと同じです)
箱は、名前の文字の上でも、塗りの内側のどこでも構いません。(入れ子の親の L 字の箱も同じです) 右クリックでは、どこでも、ブラウザのメニューが出ます。(0.11.0 以降。0.10.x までは、要素の上の右クリックで、インスペクタが出ました)

| 押したもの | 書き換えるファイル | 出る項目 |
|---|---|---|
| プロジェクトの箱 | `projects.json` | 名称・ID (読むだけ)・見た目 |
| WBS の箱 | `wbs.json` | 名称・ID (読むだけ)・親の WBS・親のプロジェクト (どちらも読むだけ。書いてあるときだけ出ます)・見た目 |
| 矢羽根 | `workpackages.json` | 名称・ID (読むだけ)・親の WBS・親のプロジェクト (同上)・予定の開始日・予定の終了日・見た目 |
| マイルストーンの △ と名前 | `milestones.json` | 名称・ID (読むだけ)・親の WBS・親のプロジェクト (同上)・日付・見た目 |

- 見た目は、背景色・枠線の色・枠線の太さ・枠線の種類 (`solid`・`dashed`・`dotted`)・文字の大きさ・文字の色です。書いていない項目には、図に描いている値 (d3.yabane の既定) が出ます。
- 並び順は、出しません。(並びは、ファイルの配列の順です)
- 「適用」で、変えた項目だけを、そのファイルに書きます。(変えていない既定の値は、書きません。文字の色を空にすると、`font.color` を消します) 書いたあとは、図を作り直します。位置・拡大の度合い・サイクル・1 目盛りの幅は、変わりません。名前を変えたときは、名前の列の幅も、新しい名前に合います。
- 次のときは、図の上に知らせを出し、書きません: 名称が空・日付 (予定の開始日・終了日・マイルストーンの日付) が `YYYY-MM-DD` の実在する日でない・終了日が開始日より前 (片方だけ変えたときも、もう片方と比べます)・色でない・枠線の太さが負・文字の大きさが 0 以下・枠線の種類が 3 つのどれでもない。
- インスペクタを開いているあいだも、右上の「−」「＋」と「日・週・月」は、インスペクタの左に出て、押せます。切り替えても、インスペクタは開いたままです。
- ほかから (エディタ・git など) データが変わって、開いていたレコードが無くなったときは、インスペクタを閉じます。
- 書き換えられないもの: 親 (`parent`・`project`) の付け替え・並び順・レコードの追加と削除・説明 (`description`)・行き先 (`wbs`・`url`)・`result`・`progress`。(ファイルを直接直します。インスペクタの「JSON」のタブで、レコード全体を見られます)
- 矢羽根を、修飾キーを押さずにクリックすると、これまでどおり、行き先へ移ります。Ctrl + クリックでは、行き先へは移らず、インスペクタが出ます。(0.11.0 以降) マイルストーンの △ を、修飾キーを押さずにクリックしても、何も起きません。
- 項目・検証・既定の見た目は、[@yanqirenshi/model.yabane](https://github.com/Foolsgolds/Assholes/tree/main/packages/model.yabane) が決めます。iHub は、model.yabane が返す変更を、`PATCH /api/master_schedule/{projects|wbs|workpackages|milestones}/{id}` で保存するだけです。

## ビジネスのページの TM の表

ビジネスのページ (`pages.Business`。参照アプリでは `/business`) には、TM のデータを表で見るタブが 4 つあります。(0.12.0 以降)
タブは、「TM」と「機能一覧」の間に並びます。

```
Systemic Design / TM / Entities / Identifiers / Attributes / Relationships / 機能一覧 / WBS / Help
```

| タブ (code) | 中身 | 列 |
|---|---|---|
| Entities (`entities`) | `data/tm/entities.json` | ID・種別・名称・識別子・属性・説明 |
| Identifiers (`identifiers`) | `data/tm/identifiers.json` | ID・論理名・物理名・データ型・説明 |
| Attributes (`attributes`) | `data/tm/attributes.json` | ID・論理名・物理名・データ型・説明 |
| Relationships (`relationships`) | `data/tm/relationships.json` | ID・種類・接続元のエンティティ・接続先のエンティティ・ラベル・サブセット (区分・区分コード)・説明 |

- 並びは、ファイルの順です。表の上の右端のボタン (「Entity の追加」「Identifier の追加」「Attribute の追加」「Relationship の追加」) で、4 つのタブとも、レコードを 1 件足せます。(0.12.0 以降) 書き換えと削除は、表からはできません。(TM タブのインスペクタか、`data/tm/` のファイルで行います)
- 「Entity の追加」: モーダルの右の枠のタブで、種別・論理名 (必須)・物理名・説明と、識別子・属性 (左に選んだ一覧、右に検索とマスタの一覧があり、右の行を押して選び、左の「×」で外します。並びは選んだ順です) を入れます。左の枠には、入力から描いたエンティティのイメージが出ます。(論理名が空のあいだは、薄い色の「(論理名)」) フォームは叩き台です。足したエンティティは、いまあるエンティティの右に置かれます。TM のタブの図で、ドラッグして動かせます。
- 「Identifier の追加」「Attribute の追加」: 論理名 (必須)・物理名・データ型・長さ・小数部の桁数・説明を入れます。
- 「Relationship の追加」: 接続元と接続先のエンティティ (必須)・それぞれのカーディナリティとオプショナリティ・種類・ラベル・サブセットの区分と区分コード・説明を入れます。接続位置 (`from.position`・`to.position`) は、2 つのエンティティの位置から、向かい合う辺 (上下左右) に決めて保存します。(再帰は、箱の下のループ) TM のタブのインスペクタで変えられます。
- 追加のモーダルを開いている間は、サイドメニューも暗くなり、押せません。
- Entities・Relationships の名前は、文字列ならそのまま、論理名と物理名の組 (`{ logical, physical }`) なら「論理名 (物理名)」で出します。
- Entities の識別子・属性は、エンティティが持つ行 (`identifiers[]`・`attributes[]`) の名前です。行に `name` があればそれを、無ければ、参照しているマスタ (`identifiers.json`・`attributes.json`) の名前を出します。
- Identifiers・Attributes の名前は、論理名と物理名の列に分けて出します。名前が組なら、`name.logical`・`name.physical` をそれぞれの列に (片方しか無ければ、無い方は空)、文字列なら論理名の列に出し、物理名の列は空です。
- Identifiers・Attributes のデータ型は、マスタの `data_type` を、`decimal(10, 2)`・`varchar(20)`・`date` のように出します。(型の名前・長さ・小数部の桁数。データ型の説明は出しません。`data_type` が無ければ空です) `data_type` は、TM タブのインスペクタで入れられます。(0.12.0 以降)
- Relationships の接続元・接続先は、`from.entity`・`to.entity` の指すエンティティの名前です。
- 指す先が見つからない (無い id の) ときは、id をそのまま出します。
- 出さないもの: エンティティの位置と大きさ (`position`・`size`)、結線の位置 (角度)・カーディナリティ・オプショナリティ・`details`・`mapping`。
- レコードが無いときは、表の代わりに知らせを出します。
- 表がコンテンツエリアより長い・広いときは、表の中でスクロールします。見出しの行は、上に残ります。
- パネルは `panels.TmEntities`・`panels.TmIdentifiers`・`panels.TmAttributes`・`panels.TmRelationships` です。設定の `panels.PAGE_BUSINESS` で差し替えられ、`tabs.PAGE_BUSINESS` の `{ code, hidden: true }` で消せます。([ページのタブとパネルを足す](#ページのタブとパネルを足す))

## 艦橋の Cockpit タブの並び

艦橋 (`/`) の Cockpit タブは、自分が担当している GitHub の Issue のうち、次のどちらかに当てはまるものだけを、カードで並べます。(0.5.0 以降は、この絞り込みと、Project の `NextAction` の日付の順)

1. 今日が、Issue が入っている Project の、Plan の期間に入っている。(始まりは `Plan.Start` か `Plan.From`、終わりは `Plan.End` か `Plan.To`。始まりの日と終わりの日の当日も含みます)
2. 1 に当てはまらなくても、`NextAction.` で始まる日付の項目 (`NextAction.Date` など) が入っている。(日付は、過ぎていても、先でも構いません)

- Plan の期間は、始まりと終わりの**両方**が入っている Project だけを見ます。(片方だけの Project は、期間とは見ません) 日付は、日の単位で比べます。
- 1 つの Issue が複数の Project に入っているときは、どれか 1 つの Project が当てはまれば、出します。
- どちらにも当てはまらない Issue (Project に入っていない Issue・日付を書いていない Issue・Plan の期間が今日を含まず、`NextAction` も無い Issue) は、出しません。
- 絞った結果が 0 件のときは、「今日が Plan の期間に入っている Issue と、NextAction.Date が入っている Issue がありません。」と出します。(絞らずに全部を出す切り替えは、ありません)

- 並びは、Issue が入っている Project の、`NextAction.` で始まる日付の項目 (`NextAction.Date` など) の、近い (早い) 順です。日付の無い Issue は、最後で、その中は、GitHub から読み込んだ順です。
- 1 つの Issue が複数の Project に入っていて、日付が違うときは、一番近い (早い) 日付を使います。
- カードに、「Next: 2026-11-24」のように日付を出します。過ぎた日付 (今日より前) は、赤で太字になります。
- 日付の読み込みに失敗したときは、絞らずに、自分が担当の Issue を全部、読み込んだ順で出し、その旨を、カードの上に出します。

## ドックの「Issue の追加」

ドックの GitHub のボタンは、「Project にイシューを追加」の吹き出しを開きます。(0.5.0 以降は、`ProjectItemForm` として、ihub.core が持っています)
Project を選び、タイトルと本文 (Markdown) を書いて、Project に紐づいた先頭のリポジトリに、Issue を作り、Project に足します。

- **日付**: 選んだ Project の日付の項目のうち、名前が `Plan.` で始まるもの (`Plan.Start`・`Plan.End`・`Plan.From`・`Plan.To` など) と、`NextAction.` で始まるもの (`NextAction.Date`) が、日付の欄になります。(並びは、Project の項目の順。実績の `Result.*` は、出しません) 空の欄は、設定しません。当てはまる項目が無い Project では、日付の欄は出ません。
- **担当**: 作成先のリポジトリで担当にできる人 (`assignableUsers`) から、複数選べます。初めは、ログイン中の自分が選ばれます。(自分が担当にできないリポジトリなら、空) 外すと、担当なしで作ります。
- Issue は作れたが、Project に足せなかったとき・日付を設定できなかったときは、どの Issue かが分かるリンクと、理由を出します。
- 吹き出しの枠の色は、設定の `colors` (配色の主の色。ドックのボタンと同じ) から決まります。吹き出しの位置は、使う側 (雛形の `src/operators/Operators.js`) が、ドックのボタン `root` を渡して決めます。

```jsx
import { ProjectItemForm } from '@yanqirenshi/ihub.core';

// src/operators/Operators.js (ドックのボタンの code ごとに、吹き出しの中身を選ぶ)
if ('b'===root.code)
    return <ProjectItemForm root={root}/>;
```

## タブだけのドックの丸

タブ (やページ) の部品は、`useDockOperator` で、表示されている間だけ、ドックの右端に丸を足せます。(0.12.0 以降。艦橋の Overview タブの「要素の追加」が使っています)

```jsx
import AddIcon from '@mui/icons-material/Add';
import { Leaf } from '@yanqirenshi/manipulater';
import { useDockOperator } from '@yanqirenshi/ihub.core';

function MyPanel () {
    useDockOperator({
        code: 'my-panel',          // 丸の名前。(ドックの丸の code は 'ihub.core:my-panel' になる)
        label: '要素の追加',        // ツールチップの文
        Icon: AddIcon,             // アイコンの部品
        leaf: ({ root, close })=> <MyLeaf root={root} onDone={close}/>,  // 丸を押したときの吹き出し
    });
    ...
}

// 吹き出し。(丸の真上に、manipulater の Leaf で描く)
function MyLeaf ({ root, onDone }) {
    const w = 400, h = 300;
    const x = root.position.x + root.size.w / 2 - w / 2;
    const y = root.position.y - 33 - h;

    return <Leaf x={x} y={y} w={w} h={h}>...</Leaf>;
}
```

- 部品が表示されたときに丸を足し、消えたとき (タブ・ページを離れたとき) に丸を消します。丸の数が変わると、ドックは、丸を画面の中央にそろえて並べ直します。
- 吹き出しは `leaf` が描きます。(設定の `operators.Leafs` には回りません) `root` はドックの丸 (位置と大きさ)、`close()` は吹き出しを閉じる関数です。吹き出しの枠は、`@yanqirenshi/manipulater` の `Leaf` で描きます。(ドックのほかの丸の吹き出しと同じ)
- アイコンは、ihub.core が描きます。(設定の `operators.labels.withIcons` が知らない code でも出ます)
- 足した丸の code には `ihub.core:` が付くので、アプリの丸 (`a`・`b`・`c` など) と重なりません。
- 吹き出しを出したまま部品が消えたときは、選択も外します。
- 設定の `operators` (丸の一覧・`Leafs`・`labels`) の形は、変わりません。
- `Frame` (`FrameTabs` など) の中でだけ働きます。

## 艦橋の Overview タブのノードの追加

艦橋 (`/`) の Overview タブ (`/?tab=overview`) を開いている間は、ドックの右端に「要素の追加」の丸 (＋) が出ます。(0.12.0 以降。Cockpit・Schedule のタブと、ほかのページでは出ません)
丸を押すと、吹き出しの中に、ノードの登録フォーム「ノードの追加」が出ます。(見た目は、GitHub の丸の吹き出しに近づけています)

項目は 15 個です。(0.12.0 以降。名称・幅・高さ以外は、yanqirenshi/iHub#244) 名称・幅・高さは、いつも上に出ます。ほかは、まとまり (背景・枠線・文字・そのほか) ごとに、見出しを付けて並びます。

| まとまり | 項目 | 入力 | 書ける値 | 入れないとき | 保存する所 |
|---|---|---|---|---|---|
| | 名称 (必須) | 文字 | | | `label.text` |
| | 幅 | 数 | 0 より大きい数 | 160 | `size.w` |
| | 高さ | 数 | 0 より大きい数 | 80 | `size.h` |
| 背景 | 背景色 | 文字 | CSS の色 | (書かない) | `background.color` |
| 背景 | 背景の透明度 | 数 | 0〜1 | (書かない) | `background.opacity` |
| 枠線 | 枠線の種類 | 選ぶ | 実線 (`solid`)・破線 (`dashed`)・点線 (`dotted`) | (書かない) | `border.type` |
| 枠線 | 枠線の色 | 文字 | CSS の色 | (書かない) | `border.color` |
| 枠線 | 枠線の太さ | 数 | 0 より大きい数 | (書かない) | `border.width` |
| 枠線 | 角の丸み | 数 | 0 以上の数 (0 で直角) | (書かない) | `border.r` |
| 枠線 | 影 | 選ぶ | あり (既定)・なし | (書かない) | `shadow` (「なし」のときだけ `false` を書く) |
| 文字 | 文字の大きさ | 数 | 0 より大きい数 | (書かない) | `label.font.size` |
| 文字 | 文字の色 | 文字 | CSS の色 | (書かない) | `label.font.color` |
| 文字 | 文字の太さ | 選ぶ | 標準 (`normal`)・太字 (`bold`) | (書かない) | `label.font.weight` |
| そのほか | 説明 | 複数行 | 文字 (図で、マウスを重ねると出ます) | (書かない) | `description` |
| そのほか | リンク | 文字 | `http://`・`https://` で始まる URL か、`/` で始まるパス (図で、ノードの左下に「link」と出て、別のタブで開きます) | (書かない) | `link.url` |

- フォームは叩き台です。項目の名前は、Overview のインスペクタにある項目なら、そのラベルに合わせています。(項目と、保存するレコードの形は、`manegers/overviewNodeForm.js`)
- 入れなかった項目 (選ぶ項目の「指定なし」も) は、レコードに書きません。図は、d3.unchi の既定で描かれます。
- ただし、文字 (大きさ・色・太さ) は、どれか 1 つでも入れたら、`label.font` に 3 つとも書きます。入れなかったものは、既定の値 (大きさ 16・色 `#333333`・太さ `normal`) です。(`label.font` を一部だけ書くと、書いていない文字の色が白になるため)
- 色は、ブラウザの `CSS.supports('color', 値)` で確かめます。(Overview のインスペクタと同じ判定です)
- 「作成」で、`POST /api/overview/nodes` に、最上位のノードを 1 件足します。(id は API サーバーが振ります) 名前は箱の中央 (`label.align: center`・`label.valign: middle`) です。
- 足したノードは、いまある最上位のノードの右端 (子のノードで広がった幅を含む) の最大 + 60、y の最小の所に置かれます。(ノードが無ければ `{ x: 0, y: 0 }`) 図の上で、ドラッグして動かせます。
- 足したあとも、図の見ている位置と拡大の度合いは変えません。足したノードが見えない所にあるときは、図を動かして (ドラッグ・ホイール) 見てください。
- 足せたら、フォームを初めの値に戻し、「「名称」を足しました。」と出します。吹き出しは開いたままなので、続けて足せます。
- 吹き出しは、丸をもう一度押すと閉じます。(「キャンセル」のボタンはありません) 開き直すと、入力は初めの値に戻ります。
- 画面の高さが足りないときは、吹き出しが低くなり、項目の所がスクロールします。(「作成」のボタンは、いつも見えます)
- 名称が空のときと、上の表の「書ける値」に合わないときは、誤りを出して、保存しません。保存できなかったときは、誤りの文を、吹き出しの中に出します。
- 線と、子のノード (ほかのノードの中のノード) は、足せません。

## クラス図

クラス (`/classes`) のページの「クラス図」タブは、`data/classes/` のデータを、[d3.classes](https://www.npmjs.com/package/@yanqirenshi/d3.classes) で描きます。(0.6.0 以降。yanqirenshi/iHub#171)

| ファイル | 内容 |
|---|---|
| `data/classes/classes.json` | クラス (箱) の配列 |
| `data/classes/relationships.json` | 関係 (線) の配列 |

- 項目は、d3.classes の入力 (`ClassInput`・`RelationshipInput`) の形のままです。形は、ihub.srv のスキーマ (`schemas/classes/`) にあります。
  - クラス: `id` (文字列。図全体で一意)・`name` (文字列か `{ logical, physical, description }`。箱には論理名を出す)・`stereotype`・`attributes`・`methods`・`position` (箱の左上)・`size.w` (箱の幅)・`description` (説明。1 行 1 要素。図には描かない)
  - 関係: `id` (文字列)・`type` (`association`・`inheritance`・`realization`・`aggregation`・`composition`・`dependency`)・`from` / `to` (`{ classId, point }` か `{ x, y }`)・`label`・`fromMultiplicity` / `toMultiplicity`・`fromRole` / `toRole`・`description`
  - `point` は、線を取り付ける位置です。辺 (`top`・`bottom`・`left`・`right` の中点) か、角度 (0=真下・時計回り。90=左 / 180=真上 / 270=右)。
  - アプリ固有の項目 (`layer`・`group`・`notes` など) も、そのまま書けます。(図には渡しません)
- ファイルが無いアプリでは、空の図として動きます。(ほかの画面も、今までどおり動きます)
- 箱をドラッグすると、動かした位置を `classes[].position` に保存します。
- 箱を Ctrl + クリック (Mac は ⌘ + クリック) するとクラスを、線を同じく押すと関係を、右端のインスペクタに出し、名前・ステレオタイプ・位置・幅・説明、関係の種類・端のクラスと位置・ラベル・多重度・端名・説明を書き換えられます。(属性とメソッドは、ファイルで書き換えます)
  - 0.11.0 から、線も、修飾キーを押さずにクリックしただけでは開きません。(0.10.x までは、箱は右クリック、線はクリックか右クリックで開きました。[図のインスペクタを開く](#図のインスペクタを開く))
  - 線は細いので、線の近く (線から約 4.5px 以内) も、線の上と見なします。この幅は、図を拡大・縮小しても変わりません。(0.9.2 以降。0.9.1 は、拡大が 100% のときに約 4.5px で、図と一緒に拡大・縮小していました。0.9.1 の README で「約 4px」と書いていたものと同じ当たりです。0.9.0 までは 6px)
  - 編集できる項目・入力の検証・保存する変更への変換は、[model.classes](https://www.npmjs.com/package/@yanqirenshi/model.classes) が決めます。(0.9.1 以降。ihub.srv の検査とスキーマも、model.classes のものです)
- 初めて開いたときは、クラスが全部見えるように描きます。そのあとは、動かした位置と拡大の度合いを覚えます。([図の位置を覚える](#図の位置を覚える))

箱のヘッダー (クラス名の行) は、設定の `diagrams.classes.header` で、クラスの項目の値ごとに塗り分けられます。

```jsx
const config = {
    // (省略)
    diagrams: {
        classes: {
            header: {
                by: 'layer',                    // クラスのレコードの項目 (ドット区切りのパス)
                colors: {                       // 項目の値 → 色
                    domain:      '#fde68a',     // 文字列は、背景の色
                    application: { background: { color: '#1e3a8a' }, font: { color: '#ffffff' } },   // d3.classes の header の形でもよい
                },
            },
        },
    },
};
```

- `colors` に無い値のクラスと、`by` の項目が無いクラスは、塗りません。
- クラスのレコードに `header` (d3.classes の形) を書くと、設定の色に重ねます。(レコードのほうを優先します)

## 図のインスペクタを開く

d3.* で描く 7 つの図 (ER 図・TM・クラス図・画面遷移図・システム構成図・艦橋の Overview・艦橋の Schedule) は、図の要素を **Ctrl + クリック (Mac は ⌘ + クリック)** すると、右端のインスペクタに出して、項目を書き換えられます。(0.11.0 以降)

| 図 | Ctrl + クリックで開くもの |
|---|---|
| ER 図 | テーブルの見出し・カラム |
| TM | エンティティの見出し・識別子の行・属性の行・結線 (線とラベル) |
| クラス図 | 箱・関係の線 |
| システム構成図 | ノード・線 |
| 画面遷移図 | ノード・線 (path と両端のポートの○) |
| 艦橋の Overview | ノード・線 |
| 艦橋の Schedule | 矢羽根・WBS の箱・プロジェクトの箱・マイルストーンの △ |

- Windows・Linux は Ctrl、Mac は ⌘ です。(Mac の Ctrl + クリックは、OS が右クリックとして扱うので、使えません)
- 右クリックでは、インスペクタは開かず、ブラウザの普通のメニューが出ます。(0.10.x までは、要素の上の右クリックで開きました)
- 修飾キーを押さずにクリックしても、インスペクタは開きません。(0.10.x までクリックだけで開いた TM の結線・クラス図の関係の線も、Ctrl + クリックにそろえました)
  - Schedule の矢羽根は、修飾キーを押さずにクリックすると、これまでどおり行き先へ移ります。Ctrl + クリックでは、行き先へは移らず、インスペクタが開きます。
- リンクを持つ要素 (画面遷移図のノードのリンクのアイコンなど) を Ctrl + クリックすると、インスペクタが開き、リンクは開きません。修飾キーを押さずにクリックすると、これまでどおりリンクが開きます。
- TM の結線は、ポインタがクリックの届く範囲 (線から約 4.5px) に入ると、線の色が変わります。(d3.ter 0.4.7 から。色は d3.ter の既定の `#1a73e8`) 色が変わっているところを Ctrl + クリックすると、その結線が開きます。
- Ctrl + クリックでは、箱は動かず、図もパンしません。
- 制限:
  - ⌘ + クリックは、押しているあいだに 1px でも動くと、クリックにならず、ドラッグかパンになります。(修飾キーの無いクリックと同じです。Ctrl では起きません)
  - 触って操作する端末 (修飾キーの無い端末) では、インスペクタを開けません。

アプリが足した図のパネルでも、同じ操作にそろえられます。

```jsx
import { inspectClick } from '@yanqirenshi/ihub.core';

const rectum = new Rectum({
    callbacks: {
        // d3.* の click の最後の引数 (DOM の MouseEvent) の ctrlKey・metaKey を見て、押していれば preventDefault() を呼んでから開く
        node: { click: inspectClick((core)=> setTarget(core.id)) },
    },
});
```

- `inspectClick(open, otherwise)`: d3.* の `click` のコールバックを作ります。Ctrl か ⌘ を押していれば、`event.preventDefault()` を呼んでから `open` を、押していなければ `otherwise` (任意) を、d3.* の引数のまま呼びます。
- `isInspectClick(event)`: Ctrl か ⌘ を押したクリックか。

## 図のグリッド線を消す

d3.* で描く 7 つの図 (ER 図・TM・クラス図・画面遷移図・システム構成図・艦橋の Overview・艦橋の Schedule) は、**既定では、背景にグリッド線を描きません。** (0.7.0 以降。0.6.x までは、d3.* の既定で、描いていました)
描きたい図は、設定の `diagrams` で、図ごとに `grid: { draw: true }` を書きます。

```jsx
const config = {
    // (省略)
    diagrams: {
        er: { grid: { draw: true } },                       // ER 図だけ、グリッド線を描く
        std: { grid: { draw: true, span: 50 } },            // 画面遷移図は、間隔 50 で描く
    },
};
```

| 図 | `diagrams` の名前 | 描くライブラリ |
|---|---|---|
| ER 図 | `er` | d3.er |
| TM | `tm` | d3.ter |
| クラス図 | `classes` | d3.classes (`draw` だけを読む) |
| 画面遷移図 | `std` | d3.sitemap |
| システム構成図 | `scd` | d3.deployment |
| 艦橋の Overview | `overview` | d3.unchi |
| 艦橋の Schedule | `schedule` | d3.yabane |

(名前は、図の位置を覚える code と同じです。[図の位置を覚える](#図の位置を覚える))

| `grid` の項目 | 内容 | iHub の既定 |
|---|---|---|
| `draw` | `true` にすると、グリッド線を描く | `false` |
| `size` | グリッドを描く範囲 (原点から上下左右に、この大きさまで) | d3.* の既定 (`10000`) |
| `span` | グリッドの間隔 | d3.* の既定 (`100`) |

- 既定の `{ draw: false }` に、設定の `grid` を重ねて、d3.* に渡します。`{ size, span }` だけを書いたときは、描かないままです。
- 0.6.x までに `{ draw: false }` を書いていたアプリは、そのままで構いません。(消しても同じです)

## 図の位置を覚える

ER 図・TM・クラス図・画面遷移図・システム構成図・Overview・Schedule は、動かした位置と拡大の度合いを、ブラウザの `localStorage` に自動で覚えて、次に開いたときに戻します。(0.2.7 以降。クラス図は 0.6.0 以降)
人ごと・ブラウザごとの記憶で、`data/` は変わりません。鍵は `ihub:{app.name}:view:{図の code}` です。(図の code: `er`・`tm`・`classes`・`std`・`scd`・`overview`・`schedule:d`・`schedule:w`・`schedule:M`。Schedule は、0.7.0 からサイクルごと)

アプリが足した図のパネルでも、`useDiagramView(code)` で覚えられます。

```jsx
import { useDiagramView } from '@yanqirenshi/ihub.core';

const bindView = useDiagramView('dfd');     // 図の code。ほかと重ならない名前にする

const rectum = new Rectum({ transform: INITIAL_VIEW });
bindView(rectum);                            // 覚えた位置があれば戻す。操作が終わるたびに覚える
rectum.data(data);
```

使い方と、覚えた位置を消す方法は、[図の編集](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/diagrams.md) と [カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) を見てください。

## GitHub との接続

画面は、GitHub (Scrum・艦橋・Issue の追加) に、次のどちらかのトークンで接続します。
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
| `pages` | ページ (`pages.Bridge`・`pages.Data`・`pages.WbsNode` など) |
| `docPages` | ドキュメントのページ (`docPages.ER`・`docPages.TM` など) |
| `panels` | ページの中身 (`panels.ER`・`panels.TM`・`panels.TmEntities` など) |
| `GithubOAuth`・`ProjectItemForm`・`Frame`・`FrameTabs`・`FrameWbsNode`・`FrameWbsNodeTabs`・`TabbedPage`・`Link`・`TableTMRelationships` など | 中間の部品 (`components/assemblies/index.js`) |
| `ItemWbsNode`・`LinkWBS`・`Tabs` など | 小さな部品 (`components/parts/index.js`) |
| `HelpSlide` | Help のセクションで使う、1 枚のスライド (0.2.4 以降。[Help を差し替える](#help-を差し替える)) |
| `usePageTabs`・`mergeTabs` | ページのタブ |
| `useDockOperator` | タブ (やページ) を開いている間だけ、ドックに丸を足す (0.12.0 以降。[タブだけのドックの丸](#タブだけのドックの丸)) |
| `manegers`・`wbs`・`useWbs`・`sogh` | データのマネージャ |
| `useDiagramView` | 図の位置と拡大を、ブラウザに覚える (0.2.7 以降。[図の位置を覚える](#図の位置を覚える)) |
| `inspectClick`・`isInspectClick` | インスペクタを開くクリック (Ctrl + クリック。Mac は ⌘ + クリック) の判定 (0.11.0 以降。[図のインスペクタを開く](#図のインスペクタを開く)) |
| `dataApi`・`useGetDataQuery`・`usePatchCollectionMutation`・`useAddRecordMutation`・`usePatchRecordMutation`・`useCollections`・`errorMessage` | API サーバーからのデータの読み書き |
| `fetchRepositories`・`fetchProjectsV2` | GitHub (Scrum) |

## タブの寄せ (FrameWbsNodeTabs・TabsSearchParam)

`FrameWbsNodeTabs` と、その中で使っている `TabsSearchParam` (URL の `?tab=` を使うタブ) は、タブの出し方を、props で変えられます。(0.5.0 以降)

| props | 内容 |
|---|---|
| `centered` | `true` で、タブを中央寄せにします。省略したときは `false` (左寄せ) |
| `tabsProps` | MUI の `Tabs` に渡す props です。(例: `{ variant: 'scrollable' }`) |

- `value`・`onChange` は、タブを選ぶ仕組みが決めるので、`tabsProps` に入れても無視します。
- `centered` と `tabsProps.centered` の両方があるときは、`centered` を使います。
- `FrameWbsNodeTabs` に渡した `centered`・`tabsProps` は、そのまま `TabsSearchParam` に渡ります。`children` の中のタブには、効きません。

```jsx
<FrameWbsNodeTabs tabs={TABS} tab={tab} onChangeTab={setTab} wbs_node={wbs_node} centered>
  …
</FrameWbsNodeTabs>
```

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
