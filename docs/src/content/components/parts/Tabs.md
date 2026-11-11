# Tabs

タブの並びを描きます。
タブは、薄い灰色の帯の、真ん中に並べます。(MUI の `Tabs` の `centered`)
どのタブを選んでいるかは、この部品では持たず、`data` で受け取ります。

- ソース: `packages/ihub.core/src/components/parts/Tabs.js`

iHub の中では、[FrameTabs](#/components/assemblies/FrameTabs) がページの上のタブに使っています。
選んだタブを URL (`?tab=`) で持つときは、[TabsSearchParam](#/components/assemblies/TabsSearchParam) を使います。

## import のしかた

```jsx
import { Tabs } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `data` | object | 必須 | タブの一覧と、選んでいるタブ。`{ selected, list }` の形 (下の表) |
| `onChange` | function | - | タブを押したときに呼ぶ関数。`selected` を押したタブの `code` にした `data` の複製を、引数に渡します |

`data` の形:

| 項目 | 内容 |
|---|---|
| `selected` | 選んでいるタブの `code` |
| `list` | タブの配列。1 つのタブは `{ code, label }` |

## 使い方の例

```jsx
const [tabs, setTabs] = React.useState({
    selected: 'list',
    list: [
        { code: 'list',  label: '一覧' },
        { code: 'chart', label: 'グラフ' },
    ],
});

<Tabs data={tabs} onChange={setTabs}/>
```

## 注意

- `onChange` を渡さないと、タブを押しても、選んでいるタブは変わりません。
- `selected` は、`list` のどれかの `code` にしてください。
  無い `code` のときは、MUI が警告を出します。
