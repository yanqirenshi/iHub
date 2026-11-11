# Procedures

機能の一覧を出すためのパネルです。
今は中身がまだ無く、「Procedures」の文字を出すだけです。

iHub の中では、ビジネス (`/business`) の「機能一覧」タブ (code は `procedures`) のパネルにしています。

- ソース: `packages/ihub.core/src/components/panels/Procedures.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

```jsx
<panels.Procedures/>
```

ビジネスの「機能一覧」タブに、アプリの部品を出すときは、設定の `panels` で差し替えます。
([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)

```jsx
panels: { PAGE_BUSINESS: { procedures: MyProcedures } }
```

## 注意

- `docPages.Procedures` (`/procedures`) は、別の部品です。(同じく、「Procedures」の文字を出すだけのページです)
