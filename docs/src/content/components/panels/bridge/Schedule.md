# Schedule

予定の期間 (`plan`) のあるワークパッケージを、矢羽根 (@yanqirenshi/d3.yabane) で並べます。(0.4.0 以降)
艦橋 (`/`) の「Schedule」タブのパネルです。
見るだけの図で、期間は画面からは書き換えられません。

- ソース: `packages/ihub.core/src/components/panels/bridge/components/Schedule.js`
- データの作り方: `packages/ihub.core/src/manegers/schedule.js`

図のデータは、API サーバーから読み込んだ次のコレクションです。

| ファイル | 使うもの |
|---|---|
| `data/wbs/projects.json` | プロジェクトの名前 (行の名前の先頭に付けるとき) |
| `data/wbs/wbs.json` | 行になる WBS と、その上の WBS の名前 |
| `data/wbs/workpackages.json` | 矢羽根になるワークパッケージと、その `plan` |

`plan` の書き方は、[データの管理](#/data) の「ワークパッケージの予定の期間」にあります。

図は、次のように描きます。

1. 矢羽根になるのは、使える `plan` のあるワークパッケージです。(`to` が `from` より前のものや、実在しない日のものは、描きません)
2. 行になるのは、矢羽根になるワークパッケージを直接持つ WBS です。
3. 行の名前は、上の WBS の名前を `/` でつないだものです。(例: 「開発 / 画面」。長いときは、上の WBS の名前を左から省きます)
4. 行が 2 つ以上のプロジェクトにあるときは、行の名前の先頭に、プロジェクトの名前を付けます。
5. 行の並びは、WBS の木を上から順にたどった順です。
6. 表示する期間は、`plan` の一番早い `from` から、一番遅い `to` までに、前後 1 週の余白を付けたものです。
7. 目盛りは週で、図の幅は期間に比例します。(最小は 15 週分)

図では、次のことができます。

1. 矢羽根か名前の文字を押すと、そのワークパッケージのページ (`/wbs/{id}`) へ移ります。
2. ホイールで拡大・縮小し、ドラッグで図全体を動かせます。
   見ている位置と拡大の度合いは、ブラウザ (`localStorage`) に覚えます。(図の code は `schedule`)

使える `plan` のあるワークパッケージが 1 つも無いときは、図の代わりに、`plan` の書き方の知らせを出します。
ほかの画面やエディタでデータが変わったときは、図を作り直します。(位置と拡大は、覚えた値で戻ります)

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.bridge.Schedule/>
```

## props

props はありません。
(タブのあるページのパネルとして使うと、`tab` を受け取りますが、使いません)

## 使い方の例

ほかのページのタブに、同じ図を出します。([ページのタブとパネルを足す](#/customize))

```jsx
import { panels } from '@yanqirenshi/ihub.core';

const config = {
    // (省略)
    tabs:   { PAGE_DESIGN: { list: [{ code: 'schedule', label: 'Schedule' }] } },
    panels: { PAGE_DESIGN: { schedule: panels.bridge.Schedule } },
};
```

艦橋の Schedule タブを出したくないときは、設定でタブを隠します。

```jsx
const config = {
    // (省略)
    tabs: { PAGE_BRIDGE: { list: [{ code: 'schedule', hidden: true }] } },
};
```

## 注意

- `<IHub>` の中で使ってください。
  次のものを使います。
  1. API サーバーから読み込んだ WBS のデータ
  2. react-router (`useNavigate()`。矢羽根を押したときに移るため)
  3. 設定の `app.name` (覚えた位置の鍵 `ihub:{app.name}:view:schedule`)
- 大きさは親の大きさ一杯 (`width: 100%`・`height: 100%`) です。
  親に高さを付けてください。
- 同じ WBS の中で期間が重なる矢羽根は、重ならない段に分けて描きます。行の高さも、段の数に合わせます。(0.5.0 以降。d3.yabane 0.1.17)
  0.4.x (d3.yabane 0.1.15) では、同じ高さに重なって描かれていました。([Foolsgolds/Assholes#173](https://github.com/Foolsgolds/Assholes/issues/173))
- 図は 1 つだけです。
  2 つの場所に出しても、同じ `data/wbs/` を描き、覚える位置も同じです。
