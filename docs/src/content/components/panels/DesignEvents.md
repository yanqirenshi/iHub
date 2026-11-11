# DesignEvents

設計 (`/design`) の「UI イベント」タブ (code は `ui-events`) のパネルです。
今は、WBS の表 ([WBSTable](#/components/assemblies/WBSTable)) を、横幅を `lg` (MUI の `Container`) に収めて出します。

表のデータは、API サーバーから読み込んだ WBS のコレクション (`wbs/projects`・`wbs/wbs`・`wbs/workpackages` など) です。
([WBS](#/wbs) の「WBS のデータ」)
表の Code の列は、WBS のノードのページ (`/wbs/{id}`) へのリンクです。

設計のページの 4 つのパネルは、どれも同じ WBS の表を出します。

| タブ | code | パネル |
|---|---|---|
| パネル | `ui-panels` | [DesignPanels](#/components/panels/DesignPanels) |
| 中間組立品 | `ui-assemblies` | [DesignAssemblies](#/components/panels/DesignAssemblies) |
| 部品 | `ui-parts` | [DesignParts](#/components/panels/DesignParts) |
| UI イベント | `ui-events` | [DesignEvents](#/components/panels/DesignEvents) |

(初めに開くタブは「部品」です)

- ソース: `packages/ihub.core/src/components/panels/design/Events.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `start_id` | string | - | この id のノードから下だけを出します。渡さないときは `"1"` です。(0.2.2 以降) |

## 使い方の例

```jsx
<panels.DesignEvents/>

<panels.DesignEvents start_id="1007"/>
```

設計のページの「UI イベント」タブで、`start_id` を変えるときは、`start_id` を渡した部品を、設定の `panels` で差し替えます。
([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// 部品は、モジュールの中で 1 つだけ作る。
const withStartId = (Panel, start_id)=> function DesignWbs () { return <Panel start_id={start_id}/>; };

// 設定
panels: { PAGE_DESIGN: { 'ui-events': withStartId(panels.DesignEvents, '1007') } }
```

## 注意

- `<IHub>` の中で使います。
API サーバーから読み込んだ WBS のデータを使うためと、Code の列のリンクが react-router を使うためです。
- `start_id` に、どのノードにも無い id を渡すと、表に行が出ません。(エラーにはなりません)
- パネルの中でスクロールしません。
iHub の画面 (`html`) はスクロールしないので、表が窓より長いと、下が見えません。
(同じ表を出す [DesignPanels](#/components/panels/DesignPanels) と [Wbs](#/components/panels/Wbs) は、パネルの中でスクロールします)
- タブのパネルにしたとき、[TabbedPage](#/components/assemblies/TabbedPage) が渡す `tab` は使いません。
