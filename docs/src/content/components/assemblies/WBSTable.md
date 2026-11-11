# WBSTable

WBS の表を描きます。
表は `@yanqirenshi/table.wbs` で描き、データは iHub の WBS のデータ (`useWbs()`) を渡します。
表の見た目は、bulma (`<IHub>` が読み込みます) に任せています。

- ソース: `packages/ihub.core/src/components/assemblies/WBSTable.js`

iHub の中では、次のところで使っています。

1. WBS のページ (`/wbs`)。プロジェクト全体を出します
2. WBS のノードのページ ([FrameWbsNode](#/components/assemblies/FrameWbsNode)・[FrameWbsNodeTabs](#/components/assemblies/FrameWbsNodeTabs))。そのノードから下を出します
3. ページの WBS のタブ ([panels.Wbs](#/components/panels/Wbs) など)

WBS のデータが変わったときは (画面からノードを追加したときなど)、表ごと作り直します。

## import のしかた

```jsx
import { WBSTable } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `start_id` | string | - | この id のノードから下だけを出します。無いときは、プロジェクト全体を出します |
| `columns` | array | - | 列の定義の配列。無いときは、既定の 3 つの列 (下の表) を出します |

既定の列:

| 列 | 中身 |
|---|---|
| Code | ノードの id。ノードのページ (`/wbs/{id}`) へのリンクにします ([Link](#/components/assemblies/Link)) |
| Name | ノードの名前。階層の深さに合わせて、字下げします |
| Description | ノードの説明 |

`columns` の 1 つの列は、次の形です。(`@yanqirenshi/table.wbs` の列の定義を、そのまま渡します)

| 項目 | 内容 |
|---|---|
| `label` | 列の見出し |
| `contents` | セルの中身を描く関数。`(column, d)=> 中身` |
| `value` | ノードから、CSV に書く値を取り出す関数。`(d)=> d.label` など |
| `required` | `true` のとき、隠せない列にします |
| `leveling` | `true` のとき、階層の深さに合わせて字下げします |

表の上の操作 (列の表示と非表示や、CSV のダウンロード) は、`@yanqirenshi/table.wbs` のものです。

## 使い方の例

```jsx
import { WBSTable } from '@yanqirenshi/ihub.core';

// プロジェクト全体
<WBSTable/>

// id が 1007 のノードから下
<WBSTable start_id="1007"/>
```

## 注意

- `<IHub>` の中で使ってください。
  API サーバーから読み込んだ WBS のデータ (redux の store) と、リンクのための react-router を使うためです。
