# FrameTabs

上にタブの並びがある、画面の枠を描きます。
[Frame](#/components/assemblies/Frame) (サイドメニューとドック) の中に、タブの並びと、`children` (ページの内容) を上から順に描きます。
タブは [Tabs](#/components/parts/Tabs) で描きます。

- ソース: `packages/ihub.core/src/components/assemblies/frames/FrameTabs.js`

`children` を入れる箱の高さは、枠の高さからタブの並びの高さを引いた高さです。
(タブの並びの高さは、`react-measure` で測ります)

どのタブを選んでいるかは、この部品では持たず、`tabs` で受け取ります。
タブを URL (`?tab=`) で持ち、設定の `tabs`・`panels` で足せるページを作るときは、[TabbedPage](#/components/assemblies/TabbedPage) を使うと簡単です。

## import のしかた

```jsx
import { FrameTabs } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `tabs` | object | 必須 | タブの一覧と、選んでいるタブ。`{ selected, list }` の形 (下の表) |
| `onChangeTabs` | function | - | タブを押したときに呼ぶ関数。`selected` を押したタブの `code` にした `tabs` の複製を、引数に渡します |
| `children` | node | - | ページの内容 |

`tabs` の形:

| 項目 | 内容 |
|---|---|
| `selected` | 選んでいるタブの `code` |
| `list` | タブの配列。1 つのタブは `{ code, label }` |

## 使い方の例

```jsx
import React from 'react';
import { FrameTabs } from '@yanqirenshi/ihub.core';

export default function MyPage () {
    const [tabs, setTabs] = React.useState({
        selected: 'list',
        list: [
            { code: 'list',  label: '一覧' },
            { code: 'chart', label: 'グラフ' },
        ],
    });

    return (
        <FrameTabs tabs={tabs} onChangeTabs={setTabs}>
          {tabs.selected==='list'  && <div>一覧です。</div>}
          {tabs.selected==='chart' && <div>グラフです。</div>}
        </FrameTabs>
    );
}
```

## 注意

- `<IHub>` の中で使ってください。
  中で [Frame](#/components/assemblies/Frame) を使うためです。(Frame の注意を見てください)
- `onChangeTabs` を渡さないと、タブを押しても何も起きません。(選んでいるタブは変わりません)
  0.3.0 までは、渡さないとタブを押したときに `TypeError` になりました。(0.3.1 で直しました)
