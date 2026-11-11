# HelpEmpty

Help のタブに、まだ中身が無いことを示すパネルです。
灰色 (`#eee`) の背景に、「Help (Empty)」の大きな文字 (`166px`) を、真ん中に出します。
大きさは、置いた場所いっぱい (幅・高さ `100%`) です。

iHub の中では、次のページの「Help」タブ (code は `help`) のパネルにしています。

| ページ | URL | ページの id |
|---|---|---|
| `pages.Api` | `/api` | `PAGE_API` |
| `pages.Batchs` | `/batchs` | `PAGE_BATCHS` |
| `pages.Business` | `/business` | `PAGE_BUSINESS` |
| `pages.Classes` | `/classes` | `PAGE_CLASSES` |
| `pages.Data` | `/data` | `PAGE_DATA` |
| `pages.Design` | `/design` | `PAGE_DESIGN` |
| `pages.DevOps` | `/devops` | `PAGE_DEVOPS` |
| `pages.Markets` | `/markets` | `PAGE_MARKETS` |
| `pages.Messages` | `/message` | `PAGE_MESSAGES` |
| `pages.Organizations` | `/organizations` | `PAGE_ORGANIZATIONS` |
| `pages.Screens` | `/screens` | `PAGE_SCREENS` |
| `pages.Scrum` | `/scrum` | `PAGE_SCRUM` |
| `pages.SystemEnvironment` | `/system-environment` | `PAGE_SYSTEMS` |

(URL は、iHub のアプリ (`src/Router.js`) のものです)

- ソース: `packages/ihub.core/src/components/panels/HelpEmpty.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

アプリのページの Help のタブに出します。

```jsx
import { TabbedPage, panels } from '@yanqirenshi/ihub.core';

// 部品の表は、モジュールの中で 1 つだけ作る。
const PANELS = { overview: Overview, help: panels.HelpEmpty };

export default function MyPage () {
    return <TabbedPage pageId="PAGE_MY" panels={PANELS}/>;
}
```

既定の Help のタブを、自分の部品に差し替えるときは、設定の `panels` に同じ code (`help`) で渡します。
([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)

```jsx
panels: { PAGE_DATA: { help: MyDataHelp } }
```

## 注意

- Help のタブを消したいときは、設定の `tabs` で `{ code: 'help', hidden: true }` を渡します。
([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)
- サイドメニューの「Help」のページ (`/help`) は、この部品ではありません。(設定の `help` で中身を変えます)
