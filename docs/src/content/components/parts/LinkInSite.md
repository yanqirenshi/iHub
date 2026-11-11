# LinkInSite

サイトの中のページへのリンクを描きます。
react-router の `Link` で描くので、ページを読み込み直さずに移ります。
文字は黒で、下線は薄い灰色の点線です。

- ソース: `packages/ihub.core/src/components/parts/LinkInSite.js`

ふつうは、`href` の形でこの部品を選んでくれる [Link](#/components/assemblies/Link) を使います。

## import のしかた

```jsx
import { LinkInSite } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `href` | string | 必須 | サイトの中のパス (`/data` など)。react-router の `to` に渡します |
| `children` | node | - | リンクの文字 |

## 使い方の例

```jsx
<LinkInSite href="/data">データ</LinkInSite>

<LinkInSite href="/scrum?tab=repositories">リポジトリの一覧</LinkInSite>
```

## 注意

- react-router の中 (`<IHub>` の中) で使ってください。
  `<IHub>` が `BrowserRouter` を持っています。
- 外のサイトの URL を渡しても、サイトの中のパスとして扱います。
  外のサイトへのリンクは [LinkOutSite](#/components/parts/LinkOutSite) を使います。
