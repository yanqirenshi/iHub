# TabsSearchParam

タブの並びを描きます。
タブを押すと、URL の `?tab=` を、押したタブの `code` にします。
(MUI の `Tabs` で描きます)

- ソース: `packages/ihub.core/src/components/assemblies/TabsSearchParam.js`

どのタブを選んでいるかは、この部品では持たず、`value` で受け取ります。
タブを押したときは、次の 2 つを行います。

1. URL の `?tab=` を、押したタブの `code` にします。(ほかの検索パラメーターは、そのまま残します)
2. `onChange` を、押したタブの `code` で呼びます。

iHub の中では、[FrameWbsNodeTabs](#/components/assemblies/FrameWbsNodeTabs) がタブの並びに使っています。
選んだタブを URL で持たなくてよいときは、[Tabs](#/components/parts/Tabs) を使います。

## import のしかた

```jsx
import { TabsSearchParam } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `tabs` | array | - | タブの配列。1 つのタブは `{ code, label }`。無いか空のときは、何も描きません |
| `value` | string | - | 選んでいるタブの `code` |
| `onChange` | function | - | タブが変わったときに呼ぶ関数。引数は、選んだタブの `code`。渡さないときは、URL の `?tab=` だけを変えます |
| `centered` | boolean | - | `true` のとき、タブを中央に寄せます。既定は `false` (左寄せ)。(0.5.0 以降) |
| `tabsProps` | object | - | MUI の `Tabs` に、そのまま渡す props。(例: `{ variant: 'scrollable' }`) (0.5.0 以降) |

- `tabsProps` の `value`・`onChange` は、無視します。(この部品が決めるため)
- `centered` と `tabsProps.centered` の両方を渡したときは、`centered` を使います。

## 使い方の例

```jsx
import React from 'react';
import { TabsSearchParam } from '@yanqirenshi/ihub.core';

const TABS = [
    { code: 'list',  label: '一覧' },
    { code: 'chart', label: 'グラフ' },
];

function MyTabs () {
    // 初めは空にしておくと、URL の ?tab= (無ければ先頭のタブ) で onChange が呼ばれる。
    const [tab, setTab] = React.useState(null);

    return (
        <>
          <TabsSearchParam tabs={TABS} value={tab} onChange={setTab}/>

          {tab==='list'  && <div>一覧です。</div>}
          {tab==='chart' && <div>グラフです。</div>}
        </>
    );
}
```

タブを中央に寄せるときや、MUI の `Tabs` の props を渡すときは、次のようにします。

```jsx
// 中央寄せ
<TabsSearchParam tabs={TABS} value={tab} onChange={setTab} centered/>

// タブが多いときに、横にスクロールできるようにする
<TabsSearchParam tabs={TABS} value={tab} onChange={setTab}
                 tabsProps={{ variant: 'scrollable', scrollButtons: 'auto' }}/>
```

## 注意

- react-router の中 (`<IHub>` の中) で使ってください。
  `useSearchParams()` を使うためです。
- `value` が無いときは、初めのタブを、次の順で決めます。([TabbedPage](#/components/assemblies/TabbedPage) の `usePageTabs` と同じ動きです)
  1. 開いたときの URL の `?tab=` (`tabs` にある `code` のとき)
  2. 先頭のタブ (`?tab=` が無いときや、`tabs` に無い値のとき)
- 初めのタブは、描画のあとに `onChange` で知らせます。
  このときは、URL の `?tab=` は変えません。
- 0.3.0 までは、次の 2 つが違いました。(0.3.1 で直しました)
  1. URL の `?tab=` を読まず、いつも先頭のタブを選んでいた
  2. 描画の途中で `onChange` を呼んでいたため、React の「Cannot update a component while rendering a different component」の警告が出ていた
- `value` は、`tabs` のどれかの `code` にしてください。
  無い `code` のときは、MUI が警告を出します。
