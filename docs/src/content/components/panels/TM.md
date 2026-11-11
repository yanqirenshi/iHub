# TM

TM (T 字形 ER) の図を描くパネルです。
ビジネス (`/business`) の「TM」タブ (code は `tm`) に出しています。

図は `@yanqirenshi/d3.ter` で描き、置いた場所いっぱい (幅・高さ `100%`) に広げます。
図の背景は白 (`#fff`) です。
画面からは、次のことができます。
(操作のしかたは [図の編集](#/diagrams))

1. エンティティをドラッグすると、動かした位置を保存する
2. エンティティの見出しを右クリックすると、そのエンティティをインスペクタに出す
3. 識別子・属性の行を右クリックすると、その行が参照しているマスタをインスペクタに出す
4. 結線 (線) をクリックすると、そのリレーションシップをインスペクタに出す
5. インスペクタで項目を書き換えて適用すると、保存して、図を描き直す
6. 図全体を動かした位置と拡大の度合いを、ブラウザに覚える

図のデータは、API サーバーから読み込んだ次のコレクションです。
(`useGetDataQuery()` で読み込んだデータを使います。ファイルは `data/tm/` にあります)

| コレクション | 内容 |
|---|---|
| `tm/identifiers` | 識別子のマスタ |
| `tm/attributes` | 属性のマスタ |
| `tm/entities` | エンティティ |
| `tm/relationships` | リレーションシップ |

書き込みは、`usePatchRecordMutation()` で、レコードごとに `PATCH /api/tm/{collection}/{id}` を送ります。

| 操作 | 書き込む先 |
|---|---|
| エンティティのドラッグ | `tm/entities` の、そのエンティティの `position` |
| インスペクタの適用 (見出し) | `tm/entities` の、そのエンティティ |
| インスペクタの適用 (識別子・属性の行) | `tm/identifiers` か `tm/attributes` の、そのマスタ |
| インスペクタの適用 (結線) | `tm/relationships` の、そのリレーションシップ |

- インスペクタに出す項目と、入れられる値の検査は、`@yanqirenshi/model.tm` が決めます。
- インスペクタは、`@yanqirenshi/colonoscope` の `ModelInspector` です。パネルの右端に、上から下まで (幅 `320px`) 出します。
- 保存できなかったとき (API サーバーが止まっているときなど) や、値が正しくないときは、図の上にエラーを出します。
- ほかのタブ・エディタ・git でデータが変わったときは、図を描き直します。自分のドラッグで保存したときは、描き直しません。

設定 (`useConfig()`) は、次の項目を読みます。

| 設定 | 使い方 |
|---|---|
| `diagrams.tm.grid` | d3.ter の `grid` の設定として、そのまま渡します。(例: `{ draw: false }` でグリッド線を消す。渡さないときは、d3.ter の既定) |
| `app.name` | 図の位置と拡大を覚える鍵 (`ihub:{app.name}:view:tm`) に使います |

([カスタマイズ](#/customize) の「図のグリッド線を消す」、[図の編集](#/diagrams) の「図の位置と拡大を覚える」)

- ソース: `packages/ihub.core/src/components/panels/TM.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

アプリのページのタブに、TM の図を出します。

```jsx
import { TabbedPage, panels } from '@yanqirenshi/ihub.core';

// 部品の表は、モジュールの中で 1 つだけ作る。
const PANELS = { tm: panels.TM };

export default function MyPage () {
    return <TabbedPage pageId="PAGE_MY" panels={PANELS}/>;
}
```

## 注意

- `<IHub>` の中で使います。
redux の store・設定 (`useConfig()`)・API サーバーから読み込んだデータを使うためです。
データを読み込む前 (`useGetDataQuery()` の `data` が無いとき) に描くと、エラーになります。(`<IHub>` の中では、読み込み終えてから描きます)
- 高さは、置いた場所の `100%` です。
高さの決まっている親 (タブのコンテンツエリアなど) の中に置きます。
- 初めの位置と拡大 (覚えたものが無いとき) は、`{ k: 0.7, x: 400, y: 400 }` で決まっていて、変えられません。
- ビジネスの TM のタブを、自分の部品に差し替えるときは、設定の `panels` に `{ PAGE_BUSINESS: { tm: MyTm } }` を渡します。([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)
- `docPages.TM` (`/tm`) は、TM の参考資料を並べたページで、このパネルとは別の部品です。
