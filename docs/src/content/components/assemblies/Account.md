# Account

アカウントの丸いアイコンと、アイコンから開くメニューを描きます。
メニューは、上にページのタブ、その下に選んだページの項目 (リンク) を並べます。

- ソース: `packages/ihub.core/src/components/assemblies/Account.js`

今の iHub の画面では使っていません。
サイドメニューは、[Frame](#/components/assemblies/Frame) が `@yanqirenshi/menubook` で描いています。
(この部品は、サイドメニューを menubook にする前の部品です)

使っている子の部品は、次の 2 つです。(どちらも公開していません)

| 部品 | 内容 |
|---|---|
| `Account/Avater.js` | 左上の丸いアイコン。押すとメニューを開き、もう 1 度押すと閉じます。マウスを乗せている間も開きます |
| `Account/Menu.js` | メニュー。並べるものは、下の一覧 |

メニューには、次の 4 つを上から順に並べます。

1. 空の見出し
2. ページのタブ (`pages` の `label`)
3. 選んだページの項目のリンク ([Link](#/components/assemblies/Link))
4. `Sign Out` の文字

メニューを開くのは、次のどれかのときです。

1. アイコンを押した (`menu.avater.clicked`)
2. アイコンにマウスを乗せている (`menu.avater.enterd`)
3. メニューにマウスを乗せている (`menu.menu.enterd`)

## import のしかた

```jsx
import { Account } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `menu` | object | 必須 | メニューの状態と、ページの一覧。形は下の表 |
| `actions` | object | 必須 | `{ menu: { change } }`。`change` は、変えた `menu` の複製を受け取る関数 |

`menu` の形:

| 項目 | 内容 |
|---|---|
| `avater.clicked` | アイコンを押して、開いているか |
| `avater.enterd` | アイコンにマウスを乗せているか |
| `menu.enterd` | メニューにマウスを乗せているか |
| `current_page` | 選んでいるページの `label` |
| `pages` | ページの配列。1 つのページは `{ label, items }`。`items` は `{ url, label }` の配列 |

redux の state の `accountMenu.menu` と同じ形です。

## 使い方の例

```jsx
import React from 'react';
import { Account } from '@yanqirenshi/ihub.core';

export default function MyAccount () {
    const [menu, setMenu] = React.useState({
        avater: { clicked: false, enterd: false },
        menu: { enterd: false },
        current_page: 'iHub',
        pages: [
            { label: 'iHub', items: [{ url: '/', label: 'コックピット' }, { url: '/wbs', label: 'WBS' }] },
        ],
    });

    return <Account menu={menu} actions={{ menu: { change: setMenu } }}/>;
}
```

## 注意

- 右上に、開閉の状態を確かめるための文字 (`avater.clicked = t` など) を出します。
  開発の途中の部品なので、画面にそのまま出すときは気を付けてください。
- アイコンの画像は、決まった GitHub のアカウントの画像です。(変えられません)
- `Sign Out` は文字だけで、押しても何もしません。
- 項目のリンクに [Link](#/components/assemblies/Link) を使うので、react-router の中 (`<IHub>` の中) で使ってください。
- `current_page` は、`pages` のどれかの `label` にしてください。
  無い `label` のときは、メニューを開いたときにエラーになります。
