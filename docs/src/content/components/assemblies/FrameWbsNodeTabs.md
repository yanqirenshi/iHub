# FrameWbsNodeTabs

タブのある、WBS のノードのページの枠を描きます。
[Frame](#/components/assemblies/Frame) (サイドメニューとドック) の中に、次の 4 つを上から順に描きます。

1. ノードの見出し ([HeadWbsPage](#/components/parts/HeadWbsPage))
2. タブの並び ([TabsSearchParam](#/components/assemblies/TabsSearchParam))
3. `children` (ページの内容)
4. このノードから下の WBS の表 ([WBSTable](#/components/assemblies/WBSTable))

- ソース: `packages/ihub.core/src/components/assemblies/frames/FrameWbsNodeTabs.js`

[FrameWbsNode](#/components/assemblies/FrameWbsNode) と、次の 3 つが違います。

| | FrameWbsNode | FrameWbsNodeTabs |
|---|---|---|
| ノードの決め方 | URL の `:wbs_id` から引く | `wbs_node` で受け取る |
| タブ | 無い | ある |
| 子のノードを追加するフォーム | ある | 無い |

タブを押すと、URL の `?tab=` を押したタブの `code` にして、`onChangeTab` を呼びます。
どのタブを選んでいるかは、この部品では持たず、`tab` で受け取ります。

## import のしかた

```jsx
import { FrameWbsNodeTabs } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `wbs_node` | object | 必須 | WBS のノード。`useWbs().get(id)` で引いたものを渡します。無いときは、何も描きません |
| `tabs` | array | - | タブの配列。1 つのタブは `{ code, label }`。無いか空のときは、タブの並びを出しません |
| `tab` | string | - | 選んでいるタブの `code` |
| `onChangeTab` | function | `tabs` を渡すとき | タブが変わったときに呼ぶ関数。引数は、選んだタブの `code` |
| `children` | node | - | ページの内容。タブの並びと、WBS の表の間に描きます |
| `maxWidth` | string | - | タブの並びと WBS の表の幅。MUI の `Container` の `maxWidth` の値 (`'md'` など)。既定は `'lg'` |

## 使い方の例

`src/wbs/P{id}.js` に書く、ノードのページです。

```jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';

import { FrameWbsNodeTabs, useWbs } from '@yanqirenshi/ihub.core';

const TABS = [
    { code: 'overview', label: '概要' },
    { code: 'notes',    label: 'メモ' },
];

export default function P1000 (props) {
    const wbs_node = useWbs().get(props.wbs_node.id);

    const [searchParams] = useSearchParams();
    const [tab, setTab] = React.useState(searchParams.get('tab'));

    return (
        <FrameWbsNodeTabs wbs_node={wbs_node}
                          tabs={TABS}
                          tab={tab}
                          onChangeTab={setTab}>
          <Container maxWidth="lg" sx={{pt:3}}>
            {tab==='overview' && <div>概要です。</div>}
            {tab==='notes'    && <div>メモです。</div>}
          </Container>
        </FrameWbsNodeTabs>
    );
}
```

## 注意

- `<IHub>` の中で使ってください。
  次の 2 つを使うためです。
  1. [Frame](#/components/assemblies/Frame) (設定と redux の store と react-router を読みます)
  2. API サーバーから読み込んだ WBS のデータ (WBS の表)
- `wbs_node` には、`useWbs().get(id)` で引いたノードを渡します。
  ノードのページが受け取る `props.wbs_node` (`data/wbs/` の JSON のレコード) をそのまま渡すと、`_id` が無いため、WBS の表がノードから下ではなく全体になります。
  プロジェクトと WBS のノードでは、見出しのノードの種類 (`_class`) も出ません。
- `tab` が無いときは、先頭のタブの `code` で `onChangeTab` を呼びます。
  開いたときの URL の `?tab=` を使うときは、例のように、ページの側で読んでください。
  ([TabsSearchParam](#/components/assemblies/TabsSearchParam) の注意も見てください)
- `maxWidth` は、タブの並びと WBS の表にだけ効きます。
  見出しの幅は `'lg'` のままです。
  `children` の幅は、`children` の側で決めてください。
- 中身は、高さいっぱいの箱 (`height: 100%`・`overflow: auto`) に入れるので、ページが長いときは、この箱の中でスクロールします。
