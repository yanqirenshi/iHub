# Wbs

WBS の表を出すパネルです。
中身は [WBSTable](#/components/assemblies/WBSTable) で、横幅を `lg` (MUI の `Container`) に収めて出します。
パネルの中で縦にスクロールします。(高さ `100%`・`overflow: auto`)

表のデータは、API サーバーから読み込んだ WBS のコレクション (`wbs/projects`・`wbs/wbs`・`wbs/workpackages` など) です。
([WBS](#/wbs) の「WBS のデータ」)
表の Code の列は、WBS のノードのページ (`/wbs/{id}`) へのリンクです。

iHub の中では、次のページの「WBS」タブ (code は `wbs`) のパネルにしています。

| ページ | URL | ページの id | `start_id` |
|---|---|---|---|
| `pages.Api` | `/api` | `PAGE_API` | 渡さない |
| `pages.Batchs` | `/batchs` | `PAGE_BATCHS` | 渡さない |
| `pages.Business` | `/business` | `PAGE_BUSINESS` | 渡さない |
| `pages.Classes` | `/classes` | `PAGE_CLASSES` | 渡さない |
| `pages.Data` | `/data` | `PAGE_DATA` | 渡さない |
| `pages.DevOps` | `/devops` | `PAGE_DEVOPS` | 渡さない |
| `pages.Markets` | `/markets` | `PAGE_MARKETS` | 渡さない |
| `pages.Messages` | `/message` | `PAGE_MESSAGES` | 渡さない |
| `pages.Organizations` | `/organizations` | `PAGE_ORGANIZATIONS` | 渡さない |
| `pages.SystemEnvironment` | `/system-environment` | `PAGE_SYSTEMS` | 渡さない |
| `pages.Design` | `/design` | `PAGE_DESIGN` | `"1"` |
| `pages.Screens` | `/screens` | `PAGE_SCREENS` | `"1"` |
| `pages.ExternalResources` | `/external-resources` | `PAGE_EXTERNAL_RESOURCES` | `1` |

(URL は、iHub のアプリ (`src/Router.js`) のものです)

- ソース: `packages/ihub.core/src/components/panels/Wbs.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `start_id` | string | - | この id のノードから下だけを出します。渡さないときは、最初のプロジェクト (`wbs/projects` の先頭) から出します |

## 使い方の例

```jsx
<panels.Wbs/>

<panels.Wbs start_id="1007"/>
```

タブのパネルにするときは、`start_id` を渡した部品を、モジュールの中で 1 つだけ作ります。

```jsx
import { TabbedPage, panels } from '@yanqirenshi/ihub.core';

// 部品は、描画のたびに作り直さないよう、ここで 1 つだけ作る。
const WbsFromRoot = ()=> <panels.Wbs start_id="1"/>;

const PANELS = { wbs: WbsFromRoot };

export default function MyPage () {
    return <TabbedPage pageId="PAGE_MY" panels={PANELS}/>;
}
```

## 注意

- `<IHub>` の中で使います。
API サーバーから読み込んだ WBS のデータを使うためと、Code の列のリンクが react-router を使うためです。
- `start_id` に、どのノードにも無い id を渡すと、表に行が出ません。(エラーにはなりません)
- `start_id` は、[DesignPanels](#/components/panels/DesignPanels) などと違い、既定の `"1"` がありません。
- タブのパネルにしたとき、[TabbedPage](#/components/assemblies/TabbedPage) が渡す `tab` は使いません。
