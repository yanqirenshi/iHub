# TabbedPage

タブのあるページを描きます。
`pageId` のページのタブを出し、選んだタブの `code` のパネルを描きます。
iHub のタブのあるページ (`pages.Data` など) は、この部品で描いています。

- ソース: `packages/ihub.core/src/components/assemblies/TabbedPage.js`

描くときは、次の順に決めます。

1. タブの一覧と、選んでいるタブを、`usePageTabs(pageId)` で決めます。(既定のタブに、設定の `tabs[pageId]` を重ねたもの。選んでいるタブは URL の `?tab=`)
2. パネルの表を、`panels` (props) に設定の `panels[pageId]` を重ねて作ります。(同じ `code` は、設定のほうで上書きします)
3. [FrameTabs](#/components/assemblies/FrameTabs) で枠とタブを描き、その中に、選んだタブの `code` のパネルを描きます。

タブを押すと、URL の `?tab=` が、押したタブの `code` になります。(例: `/batchs?tab=dfd`)
設定の `tabs`・`panels` の書き方は、[カスタマイズ](#/customize) の「ページのタブとパネルを足す」を見てください。

## import のしかた

```jsx
import { TabbedPage } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `pageId` | string | 必須 | ページの id (`PAGE_DATA` など)。タブと、設定の `panels` を引くのに使います |
| `panels` | object | - | 既定の、タブの `code` → パネルの部品の表。(例: `{ overview: Overview }`) |

パネルの部品は、`({ tab })` を受け取る関数の部品です。
`tab` は、選んでいるタブ (`{ code, label }`) です。

## 使い方の例

```jsx
import { TabbedPage } from '@yanqirenshi/ihub.core';

function Overview ({ tab }) {
    return <div>{tab.label} のパネルです。</div>;
}

function Notes () {
    return <div>メモのパネルです。</div>;
}

// 部品の表は、モジュールの中で 1 つだけ作る。
const PANELS = { overview: Overview, notes: Notes };

export default function MyPage () {
    return <TabbedPage pageId="PAGE_MY" panels={PANELS}/>;
}
```

アプリのページのタブは、設定の `tabs` で決めます。

```jsx
const config = {
    // (省略)
    tabs: {
        PAGE_MY: {
            selected: 'overview',
            list: [
                { code: 'overview', label: '概要' },
                { code: 'notes',    label: 'メモ' },
            ],
        },
    },
};
```

## 注意

- `<IHub>` の中で使ってください。
  次の 2 つを使うためです。
  1. 設定 (`useConfig()` の `tabs` と `panels`)
  2. react-router (URL の `?tab=`)

  枠に [FrameTabs](#/components/assemblies/FrameTabs) を使うので、redux の store も読みます。
- iHub に既定のタブが無い `pageId` (アプリで作ったページ) は、設定の `tabs[pageId]` が無いと、タブが 1 つも出ません。
- パネルの表に無い `code` のタブを選んだときは、何も描きません。
- パネルの部品と `panels` の表は、モジュールの中で 1 つだけ作ってください。
  描画のたびに作り直すと、タブを切り替えるたびに、パネルが作り直されます。
