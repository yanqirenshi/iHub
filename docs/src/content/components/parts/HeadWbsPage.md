# HeadWbsPage

WBS のノードのページの、上の見出しを描きます。
次の 3 つを、上から順に出します。

1. ノードの種類 (`_class`。`PROJECT`・`WBS`・`WORKPACKAGE`)
2. ノードの名前 (`name`。大きな見出し)
3. ノードの説明 (`description`)

- ソース: `packages/ihub.core/src/components/parts/HeadWbsPage.js`

iHub の中では、次の 2 つの枠が、WBS のノードのページの見出しに使っています。

- [FrameWbsNode](#/components/assemblies/FrameWbsNode)
- [FrameWbsNodeTabs](#/components/assemblies/FrameWbsNodeTabs)

## import のしかた

```jsx
import { HeadWbsPage } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `value` | object | 必須 | WBS のノード。`_class`・`name`・`description` を読みます |
| `align` | string | - | 見出しの寄せ。`'left'` (左寄せ)・`'center'` (中央寄せ)・`'right'` (右寄せ) のどれか。既定は `'left'` |

## 使い方の例

```jsx
import { useParams } from 'react-router-dom';
import { HeadWbsPage, useWbs } from '@yanqirenshi/ihub.core';

function MyWbsHead () {
    const { wbs_id } = useParams();
    const wbs_node = useWbs().get(wbs_id);

    if (!wbs_node) return null;

    return <HeadWbsPage value={wbs_node}/>;
}
```

## 注意

- `value` には、`useWbs().get(id)` で引いたノードを渡します。
  `data/wbs/` の JSON のレコードそのものには、`_class` がありません。
- `value` が無いとエラーになります。
  ノードが見つからないときは、この部品を描かないでください。
- `align` に `'left'`・`'center'`・`'right'` 以外の値を渡したときは、左寄せになります。
- この部品だけを使うときの既定は、これまでどおり左寄せです。
  [FrameWbsNode](#/components/assemblies/FrameWbsNode)・[FrameWbsNodeTabs](#/components/assemblies/FrameWbsNodeTabs) の中の見出しは、既定で中央寄せです。(枠の `headAlign` で変えられます)
