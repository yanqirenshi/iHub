# カスタマイズ

## ページを足して、サイドメニューに出す

例として、`/my-page` に「自分のページ」を足します。

### 1. ページの部品を作る

`src/components/pages/MyPage.js` を作ります。
`Frame` で囲むと、サイドメニューとドックが付きます。

```jsx
import React from 'react';
import Container from '@mui/material/Container';

import Frame from '../../ihub/components/assemblies/frames/Frame.js';

export default function MyPage () {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            自分のページです。
          </Container>
        </Frame>
    );
}
```

### 2. URL を決める

`src/Router.js` に、ルートを足します。

```jsx
import MyPage from './components/pages/MyPage.js';

// <Routes> の中に足す
<Route path='/my-page' element={<MyPage/>} />
```

### 3. サイドメニューに項目を足す

`src/config/ACCOUNT_MENUS.js` の項目の一覧 (`MAIN` など) に、項目を足します。

```js
const MAIN = [
    // (省略)
    { code: 'my-page', url: '/my-page', label: '自分のページ', icon: ICONS.data },
];
```

同じファイルの `ACCOUNT_MENU_PAGES` で、どのページ (iHub・Docs・Etc) に出すかを決めます。

```js
export const ACCOUNT_MENU_PAGES = [
    {
        label: 'iHub',
        items: [
            // (省略)
            { code: 'my-page', active: true },
        ],
    },
    // (省略)
];
```

- `code` は、ほかの項目と重ならないようにします。(重なると、起動したときにエラーになります)
- `active` は、表示するかどうかの既定値です。
- 先頭のページを、初めに開きます。
ページの名前 (`label`) は、アプリの名前などに変えてかまいません。

### 4. アイコンを足す (必要なとき)

`src/config/ICONS.js` に、SVG のパス (viewBox が `0 0 24 24` のもの) で、アイコンを足します。

```js
const ICONS = {
    // (省略)
    myPage: icon("M3 13h8V3H3zm0 8h8v-6H3z"),
};
```

## ドックのボタンを変える

ドックのボタンは、次の 3 つのファイルで決まります。

| ファイル | 内容 |
|---|---|
| `src/config/OPERATOR_ITEMS.js` | ボタンの一覧 (code・ラベル) |
| `src/operators/Operators.js` | ボタンの code ごとに、吹き出しの中身を選ぶ |
| `src/operators/labels.js` | ボタンのアイコン (Manipulater が持っていないもの) |

ボタンを足すときは、3 つを合わせて変えてください。

## 見た目を変える

`src/index.css` に、CSS を書きます。
`src/index.css` は `src/ihub/index.css` のあとに読み込むので、iHub の見た目を上書きできます。
