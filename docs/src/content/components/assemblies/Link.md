# Link

リンクを描きます。
リンク先の形を見て、次の 3 つの部品から 1 つを選んで描きます。

| 渡したもの | 使う部品 | リンク先 |
|---|---|---|
| `wbs_id` | [LinkWBS](#/components/parts/LinkWBS) | WBS のノードのページ (`/wbs/{wbs_id}`) |
| `http` で始まる `href` | [LinkOutSite](#/components/parts/LinkOutSite) | 外のサイト (別のタブで開く) |
| それ以外の `href` | [LinkInSite](#/components/parts/LinkInSite) | サイトの中のページ |

- ソース: `packages/ihub.core/src/components/assemblies/Link.js`

## import のしかた

```jsx
import { Link } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `href` | string | `wbs_id` が無いとき | リンク先の URL か、サイトの中のパス |
| `wbs_id` | string | - | WBS のノードの id。渡すと `href` より優先します |
| `children` | node | - | リンクの文字 |

## 使い方の例

```jsx
<Link href="/data">データ</Link>

<Link href="https://github.com/yanqirenshi/iHub">iHub のリポジトリ</Link>

<Link wbs_id="design-er">ER 図を描く</Link>
```

## 注意

- `wbs_id` も `href` も渡さないと、エラーになります。(`href` の先頭を調べるため)
