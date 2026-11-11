# LinkWBS

WBS のノードのページ (`/wbs/{wbs_id}`) へのリンクを描きます。
react-router の `Link` で描き、文字は黒で、下線は薄い灰色の点線です。

- ソース: `packages/ihub.core/src/components/parts/LinkWBS.js`

[Link](#/components/assemblies/Link) に `wbs_id` を渡したときも、この部品を使います。
ノードの名前も一緒に出したいときは、[ItemWbsNode](#/components/parts/ItemWbsNode) を使います。

## import のしかた

```jsx
import { LinkWBS } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `wbs_id` | string | 必須 | WBS のノードの id。リンク先の URL に使います |
| `children` | node | - | リンクの文字。無いときは `wbs_id` を出します |

## 使い方の例

```jsx
<LinkWBS wbs_id="design-er">ER 図を描く</LinkWBS>

<LinkWBS wbs_id="design-er"/>
```

## 注意

- react-router の中 (`<IHub>` の中) で使ってください。
- WBS のデータは読みません。
  `wbs_id` のノードがデータに無くても、リンクを描きます。(ノードのページを開くと、設定の `wbs.NotFoundData` の表示になります。[カスタマイズ](#/customize))
