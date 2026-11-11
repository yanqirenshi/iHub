# LinkOutSite

外のサイトへのリンクを描きます。
リンク先は、別のタブで開きます。(`target="_blank"`・`rel="noreferrer"`)
MUI の `Link` で描き、文字は黒で、下線は薄い灰色の点線です。

- ソース: `packages/ihub.core/src/components/parts/LinkOutSite.js`

ふつうは、`href` の形でこの部品を選んでくれる [Link](#/components/assemblies/Link) を使います。
iHub の中では、コックピットの [Card](#/components/panels/cockpit/Card) が、GitHub の Issue へのリンクに使っています。

## import のしかた

```jsx
import { LinkOutSite } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `href` | string | 必須 | リンク先の URL |
| `children` | node | - | リンクの文字 |

## 使い方の例

```jsx
<LinkOutSite href="https://github.com/yanqirenshi/iHub">iHub のリポジトリ</LinkOutSite>
```

## 注意

- `href` が `http` で始まるかどうかは調べません。
  サイトの中のパスを渡すと、ページを読み込み直して、別のタブで開きます。
  サイトの中のリンクは [LinkInSite](#/components/parts/LinkInSite) を使います。
