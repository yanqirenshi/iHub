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
| `onChange` | function | `tabs` を渡すとき | タブが変わったときに呼ぶ関数。引数は、選んだタブの `code` |

## 使い方の例

```jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabsSearchParam } from '@yanqirenshi/ihub.core';

const TABS = [
    { code: 'list',  label: '一覧' },
    { code: 'chart', label: 'グラフ' },
];

function MyTabs () {
    const [searchParams] = useSearchParams();
    const [tab, setTab] = React.useState(searchParams.get('tab'));

    return (
        <>
          <TabsSearchParam tabs={TABS} value={tab} onChange={setTab}/>

          {tab==='list'  && <div>一覧です。</div>}
          {tab==='chart' && <div>グラフです。</div>}
        </>
    );
}
```

## 注意

- react-router の中 (`<IHub>` の中) で使ってください。
  `useSearchParams()` を使うためです。
- 開いたときの URL の `?tab=` は読みません。
  URL のタブで開くときは、例のように、使う側で `?tab=` を読んで `value` に渡してください。
- `value` が無いときは、描くときに、先頭のタブの `code` で `onChange` を呼びます。
  このときは、URL の `?tab=` は変えません。
- `value` は、`tabs` のどれかの `code` にしてください。
  無い `code` のときは、MUI が警告を出します。
