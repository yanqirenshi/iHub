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
| `diagrams` | ER 図・TM 図・クラス図の設定。`{ er: { grid }, tm: { grid }, classes: { grid, header } }`。`grid` は、d3.er・d3.ter・d3.classes の `grid` の設定を、そのまま渡す ([図のグリッド線](#図のグリッド線を消す))。`classes.header` は、クラスの箱のヘッダーの色 ([クラス図](#クラス図)) | 渡さない |

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
| `PAGE_BUSINESS` | `pages.Business` (参照アプリでは `/business`) | `systemic-design`・`tm`・`procedures`・`wbs`・`help` | `tm` |
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

艦橋 (`/`) の Schedule タブは、予定の期間 (`plan`) のあるワークパッケージを、矢羽根 ([@yanqirenshi/d3.yabane](https://github.com/Foolsgolds/Assholes/tree/main/packages/d3.yabane)) で並べます。(0.4.0 以降。見るだけです)
予定の期間は、`data/wbs/workpackages.json` の、ワークパッケージのレコードに書きます。(任意)

```json
{ "id": 1000001, "parent": 1001, "name": "設計", "plan": { "from": "2026-11-01", "to": "2026-11-30" } }
```

- `from`・`to` は、`'YYYY-MM-DD'` の日付で、どちらも書きます。`to` は、`from` と同じ日か、あとの日です。(`ihub-srv check` が、形と日付の誤りを知らせます)
- `plan` を書かないワークパッケージは、これまでどおりで、Schedule タブには出ません。
- 行になるのは、`plan` のあるワークパッケージを持つ WBS です。上の WBS の名前を `/` でつないだものが、行の名前になります。(長いときは、上の WBS の名前を、左から省きます)
- 表示する期間は、`plan` の一番早い `from` から、一番遅い `to` までです。(前後に 1 週の余白を付けます)
- 同じ WBS の中で、期間が重なる矢羽根は、重ならない段に分かれて描かれます。(0.5.0 以降。0.4.0 では、同じ高さに重なって描かれました。d3.yabane 0.1.17 で直りました)
- 矢羽根を押すと、そのワークパッケージのページ (`/wbs/{id}`) へ移ります。
- 図の位置と拡大の度合いは、ほかの図と同じように、覚えます。(図の code は `schedule`)
- `plan` のあるワークパッケージが 1 つも無いときは、図の代わりに、書き方の知らせを出します。

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
- 箱を右クリックするとクラスを、線をクリック (か右クリック) すると関係を、右端のインスペクタに出し、名前・ステレオタイプ・位置・幅・説明、関係の種類・端のクラスと位置・ラベル・多重度・端名・説明を書き換えられます。(属性とメソッドは、ファイルで書き換えます)
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

## 図のグリッド線を消す

ER 図・TM 図・クラス図は、背景にグリッド線を描きます。
設定の `diagrams` で、図ごとに、d3.er・d3.ter・d3.classes の `grid` の設定を渡せます。(値は、iHub では解釈せずに、そのまま渡します。0.2.5 以降。クラス図は 0.6.0 以降)

```jsx
const config = {
    // (省略)
    diagrams: {
        er: { grid: { draw: false } },         // ER 図のグリッド線を描かない
        tm: { grid: { draw: false } },         // TM 図のグリッド線を描かない
        classes: { grid: { draw: false } },    // クラス図のグリッド線を描かない (d3.classes は draw だけを読む)
    },
};
```

| `grid` の項目 | 内容 | 既定 |
|---|---|---|
| `draw` | `false` にすると、グリッド線を描かない | `true` |
| `size` | グリッドを描く範囲 (原点から上下左右に、この大きさまで) | `10000` |
| `span` | グリッドの間隔 | `100` |

- 渡さないときは、これまでどおり、グリッド線が出ます。
- ER 図・TM 図・クラス図は、別々に設定できます。それ以外の図 (Overview・画面遷移図など) は、対象外です。

## 図の位置を覚える

ER 図・TM・クラス図・画面遷移図・システム構成図・Overview・Schedule は、動かした位置と拡大の度合いを、ブラウザの `localStorage` に自動で覚えて、次に開いたときに戻します。(0.2.7 以降。クラス図は 0.6.0 以降)
人ごと・ブラウザごとの記憶で、`data/` は変わりません。鍵は `ihub:{app.name}:view:{図の code}` です。(図の code: `er`・`tm`・`classes`・`std`・`scd`・`overview`・`schedule`)

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
| `panels` | ページの中身 (`panels.ER`・`panels.TM` など) |
| `GithubOAuth`・`ProjectItemForm`・`Frame`・`FrameTabs`・`FrameWbsNode`・`FrameWbsNodeTabs`・`TabbedPage`・`Link`・`TableTMRelationships` など | 中間の部品 (`components/assemblies/index.js`) |
| `ItemWbsNode`・`LinkWBS`・`Tabs` など | 小さな部品 (`components/parts/index.js`) |
| `HelpSlide` | Help のセクションで使う、1 枚のスライド (0.2.4 以降。[Help を差し替える](#help-を差し替える)) |
| `usePageTabs`・`mergeTabs` | ページのタブ |
| `manegers`・`wbs`・`useWbs`・`sogh` | データのマネージャ |
| `useDiagramView` | 図の位置と拡大を、ブラウザに覚える (0.2.7 以降。[図の位置を覚える](#図の位置を覚える)) |
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
