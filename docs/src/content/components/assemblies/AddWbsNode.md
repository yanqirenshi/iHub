# AddWbsNode

WBS のノード (`parent`) の下に、子のノードを追加するフォームを描きます。
iHub の中では、[FrameWbsNode](#/components/assemblies/FrameWbsNode) が、ノードのページの WBS の表の上に出しています。

- ソース: `packages/ihub.core/src/components/assemblies/AddWbsNode.js`

フォームには、次の 3 つの欄と、「追加」のボタンを並べます。

| 欄 | 内容 |
|---|---|
| 種類 | 追加するノードの種類。選べる種類は、`parent` の種類で決まります (下の表) |
| 名前 | ノードの名前。必須 |
| 説明 | ノードの説明。省略できます |

| `parent` の種類 (`_class`) | 追加できる種類 | 書き込むコレクション |
|---|---|---|
| `PROJECT` | WBS | `wbs/wbs` |
| `WBS` | WBS か、ワークパッケージ | `wbs/wbs` か、`wbs/workpackages` |
| `WORKPACKAGE` | 無い (フォームを出しません) | - |

「追加」を押すと、API サーバーにレコードを追加します。(`useAddRecordMutation`)
追加するレコードは、`{ parent: parent._id, name, description }` です。(`description` は、入力したときだけ)
id は、API サーバーが振ります。

追加できたときは、欄を空にして、追加したノードのページ (`/wbs/{id}`) へのリンクを出します。
追加できなかったときは、API サーバーが返したエラーの文を出します。

## import のしかた

```jsx
import { AddWbsNode } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `parent` | object | 必須 | 子を追加する WBS のノード。`useWbs().get(id)` で引いたものを渡します。`_id`・`_class`・`name` を読みます |

## 使い方の例

```jsx
import { useParams } from 'react-router-dom';
import { AddWbsNode, useWbs } from '@yanqirenshi/ihub.core';

function MyAddForm () {
    const { wbs_id } = useParams();
    const wbs_node = useWbs().get(wbs_id);

    if (!wbs_node) return null;

    return <AddWbsNode parent={wbs_node}/>;
}
```

## 注意

- `<IHub>` の中で使ってください。
  redux の store (API サーバーへの書き込み) と、react-router (追加したノードへのリンク) を使うためです。
- API サーバー (`@yanqirenshi/ihub.srv`) が動いている必要があります。
  追加したノードは、`data/wbs/` の JSON に保存され、WBS の表にもすぐ出ます。
- `parent` には、`useWbs().get(id)` で引いたノードを渡します。
  `data/wbs/` の JSON のレコードそのものには `_id` が無く、プロジェクトと WBS には `_class` もありません。
  `_class` が無いと、フォームを出しません。
- `parent` が無いと、エラーになります。
