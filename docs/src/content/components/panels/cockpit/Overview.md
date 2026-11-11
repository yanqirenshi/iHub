# Overview

ポンチ絵 (なんでもありの概念図) を、@yanqirenshi/d3.unchi で、パネル一杯に描きます。
コックピット (`/`) の「Overview」タブのパネルです。

- ソース: `packages/ihub.core/src/components/panels/cockpit/components/Overview.js`

図のデータは、API サーバーから読み込んだ次のコレクションです。([Overview のデータ](#/diagrams))

| ファイル | 内容 |
|---|---|
| `data/overview/nodes.json` | ノード (入れ子にできます) |
| `data/overview/edges.json` | ノードの間の線 |

図では、次のことができます。

1. ノードをドラッグすると、動かした位置を `overview/nodes` に保存します。
2. ノードや線を右クリックすると、右端にインスペクタ (幅 `320px`) を出します。
3. インスペクタで項目を書き換えて「適用」を押すと、`PATCH /api/overview/{nodes|edges}/{id}` で保存します。
4. 保存できなかったときや、値が正しくないときは、上にエラーを出します。

書き換えられる項目は、[図の編集](#/diagrams) の「Overview でサイズ・色・接続位置・ラベルを変える」にあります。
ほかの画面などでデータが変わったときは、図を作り直します。
見ている位置と拡大の度合いは、ブラウザ (`localStorage`) に覚えます。(図の code は `overview`)

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.cockpit.Overview/>
```

## props

props はありません。
(タブのあるページのパネルとして使うと、`tab` を受け取りますが、使いません)

## 使い方の例

ほかのページのタブに、同じ図を出します。([ページのタブとパネルを足す](#/customize))

```jsx
import { panels } from '@yanqirenshi/ihub.core';

const config = {
    // (省略)
    tabs:   { PAGE_DATA: { list: [{ code: 'overview', label: 'Overview' }] } },
    panels: { PAGE_DATA: { overview: panels.cockpit.Overview } },
};
```

## 注意

- `<IHub>` の中で使ってください。
  API サーバーから読み込んだデータと、redux の store (RTK Query の `dataApi`) を使います。
- 覚えた位置の鍵には、設定の `app.name` を使います。(`ihub:{app.name}:view:overview`)
- 大きさは親の大きさ一杯 (`width: 100%`・`height: 100%`) です。
  親に高さを付けてください。
- 図は 1 つだけです。
  2 つの場所に出しても、同じ `data/overview/` を描き、覚える位置も同じです。
