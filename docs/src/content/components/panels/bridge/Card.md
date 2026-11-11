# Card

艦橋の 1 枚のカードを描きます。
`data.type` で、描き方を変えます。

| `data.type` | 描くもの |
|---|---|
| `'GITHUB ISSUE'` | GitHub の Issue のカード (下の説明) |
| それ以外 | 中身の無いカード。真ん中に `data.type` を出します (`type` が無いときは `?`) |

- ソース: `packages/ihub.core/src/components/panels/bridge/components/Card.js`
- Issue のカード: `packages/ihub.core/src/components/panels/bridge/components/cards/GithubIssue.js`

艦橋 (`/`) の「Cockpit」タブで、[Monitor](#/components/panels/bridge/Monitor) の中に並べています。
ページ (`pages/Bridge.js`) が、自分が担当している (assignee が自分の) Issue を GitHub から読み込み、1 件ずつカードにします。([GitHub との連携](#/github))

Issue のカードには、次のものを出します。

1. Issue のタイトル
2. Issue の番号 (GitHub の Issue のページへのリンク。別のタブで開きます)
3. リポジトリの名前 (リポジトリのページへのリンク)

カードの幅は `222px` です。

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.bridge.Card data={...}/>
```

0.2.x までの名前 `panels.cockpit.Card` も、同じ部品の別名として使えます。
(0.3.0 で `panels.bridge` に改めました。古い名前は、将来の minor で消すことがあるので、新しい名前に移しておくと安心です)

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `data` | object | 必須 | カードのデータ。`{ type, data }` の形 (下の表) |

`data` の形:

| 項目 | 内容 |
|---|---|
| `type` | カードの種類。`'GITHUB ISSUE'` のときは Issue のカードを描きます |
| `data` | `type` が `'GITHUB ISSUE'` のときの Issue。sogh の Issue のオブジェクト (`sogh.issue(id)` で引いたもの) です |

`pages/Bridge.js` は、`id` (Issue の id) も入れて、`key` に使っています。
カードの部品は、`id` を読みません。

## 使い方の例

```jsx
import { panels, sogh } from '@yanqirenshi/ihub.core';

// GitHub から読み込んだ Issue の id の一覧 (issue_ids) から、カードを作る
const cards = issue_ids.map(id=> ({
    type: 'GITHUB ISSUE',
    id: id,
    data: sogh.issue(id),
}));

<panels.bridge.Monitor>
  {cards.map(card=> <panels.bridge.Card key={card.id} data={card}/>)}
</panels.bridge.Monitor>
```

## 注意

- Issue のカードの `data.data` は、JSON のデータではなく、sogh の Issue のオブジェクトです。
  `title()`・`url()`・`number()`・`core().repository` を呼びます。
  GitHub に接続して、sogh に Issue を読み込んでから使ってください。([GitHub との連携](#/github))
- リポジトリの名前のリンクは、別のタブではなく、同じタブで開きます。
