# ItemWbsNode

WBS のノードを、「名前 (id)」の形で描きます。
id の部分は、ノードのページ (`/wbs/{wbs_id}`) へのリンクです。
ノードは、API サーバーから読み込んだ WBS のデータ (`useWbs()`) から、`wbs_id` で引きます。

- ソース: `packages/ihub.core/src/components/parts/ItemWbsNode.js`

WBS のデータは、次のファイルから作ります。([WBS](#/wbs))

| ファイル | 内容 |
|---|---|
| `data/wbs/projects.json` | プロジェクト |
| `data/wbs/wbs.json` | WBS のノード |
| `data/wbs/workpackages.json` | ワークパッケージ |

## import のしかた

```jsx
import { ItemWbsNode } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `wbs_id` | string | 必須 | WBS のノードの id |
| `children` | node | - | ノードが見つからないときに出すもの。無いときは `wbs_id` を出します |

## 使い方の例

```jsx
<ItemWbsNode wbs_id="design-er"/>
// → ER 図を描く (design-er)   ※ 「design-er」がリンク

<ItemWbsNode wbs_id="not-yet">まだ作っていない作業</ItemWbsNode>
// → まだ作っていない作業        ※ ノードが無いときは、リンクにしない
```

## 注意

- `<IHub>` の中で使ってください。
  API サーバーからデータを読み込み終えてから描く前提です。(`<IHub>` が、読み込み終えるまで待ちます)
  react-router の中であることも必要です。
- ノードが見つかったときは、`children` を使いません。
  いつも、ノードの名前と id を出します。
- ノードが見つからないときは、リンクを描きません。
  リンクだけを描くときは [LinkWBS](#/components/parts/LinkWBS) を使います。
