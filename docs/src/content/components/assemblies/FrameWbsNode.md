# FrameWbsNode

WBS のノードのページ (`/wbs/{id}`) の枠を描きます。
[Frame](#/components/assemblies/Frame) (サイドメニューとドック) の中に、次の 4 つを上から順に描きます。

1. ノードの見出し ([HeadWbsPage](#/components/parts/HeadWbsPage))。既定では中央に寄せます (`headAlign` で変えられます)
2. `children` (ページの内容)
3. 子のノードを追加するフォーム ([AddWbsNode](#/components/assemblies/AddWbsNode))
4. このノードから下の WBS の表 ([WBSTable](#/components/assemblies/WBSTable))。`showWbsTable={false}` のときは出しません

- ソース: `packages/ihub.core/src/components/assemblies/frames/FrameWbsNode.js`

どのノードを描くかは、URL の `:wbs_id` (`useParams()`) から決めます。
ノードは `useWbs().get(wbs_id)` で引きます。
見つからないときは、何も描きません。

WBS の表だけが要らないときは、`showWbsTable={false}` を渡します。
見出しも要らないときは、[Frame](#/components/assemblies/Frame) で囲みます。
タブを付けるときは、[FrameWbsNodeTabs](#/components/assemblies/FrameWbsNodeTabs) を使います。
ノードのページの作り方は、[WBS](#/wbs) の「ノードのページを作る」を見てください。

## import のしかた

```jsx
import { FrameWbsNode } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `children` | node | - | ページの内容。見出しと、追加のフォームの間に描きます |
| `maxWidth` | string | - | 追加のフォームと WBS の表の幅。MUI の `Container` の `maxWidth` の値 (`'md'` など)。既定は `'lg'` |
| `showWbsTable` | boolean | - | `false` のとき、WBS の表を出しません。既定は `true` (出す) |
| `headAlign` | string | - | 見出し (種類・名前・説明) の寄せ。`'left'` (左寄せ)・`'center'` (中央寄せ)・`'right'` (右寄せ) のどれか。既定は `'center'` |

## 使い方の例

`src/wbs/P{id}.js` に書く、ノードのページです。

```jsx
import React from 'react';
import Container from '@mui/material/Container';

import { FrameWbsNode as Frame } from '@yanqirenshi/ihub.core';

export default function P1000 (props) {
    const wbs_node = props.wbs_node;

    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            {wbs_node.name} のページです。
          </Container>
        </Frame>
    );
}
```

WBS の表を出さないときは、`showWbsTable={false}` を付けます。

```jsx
<Frame showWbsTable={false}>
  ...
</Frame>
```

見出しを左に寄せるときは、`headAlign="left"` を付けます。(右に寄せるときは `"right"`)

```jsx
<Frame headAlign="left">
  ...
</Frame>
```

## 注意

- `<IHub>` の中で使ってください。
  次の 2 つを使うためです。
  1. [Frame](#/components/assemblies/Frame) (設定と redux の store と react-router を読みます)
  2. API サーバーから読み込んだ WBS のデータ (見出しと WBS の表)
- URL に `:wbs_id` がある `Route` (`/wbs/:wbs_id`) の中で使ってください。
  `wbs_id` が無いと、ノードが見つからず、何も描きません。
- `maxWidth` は、追加のフォームと WBS の表にだけ効きます。
  見出しの幅は `'lg'` のままです。
  `children` の幅は、`children` の側で決めてください。
- 中身は、高さいっぱいの箱 (`height: 100%`・`overflow: auto`) に入れるので、ページが長いときは、この箱の中でスクロールします。
- ワークパッケージのページでは、追加のフォームは出ません。(ワークパッケージの下には、ノードを追加できないため)
- `showWbsTable={false}` で消えるのは、WBS の表だけです。
  追加のフォームは、そのまま出ます。
- `headAlign` は、見出しにだけ効きます。
  `children`・追加のフォーム・WBS の表の寄せは、変わりません。
  `'left'`・`'center'`・`'right'` 以外の値を渡したときは、省略したときと同じく、中央寄せになります。
- 見出しは、これまで左寄せでした。
  `headAlign` を足した版から、既定が中央寄せに変わります。
  左寄せのままにするときは、`headAlign="left"` を付けてください。
