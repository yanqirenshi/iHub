# ER

ER 図を描くパネルです。
データ (`/data`) の「ER図」タブ (code は `er-diagram`) に出しています。

図は `@yanqirenshi/d3.er` で描き、置いた場所いっぱい (幅・高さ `100%`) に広げます。
画面からは、次のことができます。
(操作のしかたは [図の編集](#/diagrams))

1. テーブルをドラッグすると、動かした位置を保存する
2. テーブルの見出しを右クリックすると、そのテーブル (エンティティ) をインスペクタに出す
3. カラムを右クリックすると、そのカラムが参照している識別子・属性のマスタをインスペクタに出す
4. インスペクタで項目を書き換えて適用すると、保存して、図を描き直す
5. 図全体を動かした位置と拡大の度合いを、ブラウザに覚える

図のデータは、API サーバーから読み込んだ次のコレクションです。
(`useGetDataQuery()` で読み込んだデータを使います。ファイルは `data/er/` にあります)

| コレクション | 内容 |
|---|---|
| `er/schemas` | テーブルの名前空間 (スキーマ) のマスタ |
| `er/identifiers` | 識別子 (主キー) のマスタ |
| `er/attributes` | 属性 (カラム) のマスタ |
| `er/entities` | テーブル |
| `er/relationships` | テーブルの間の関係 |

書き込みは、`usePatchRecordMutation()` で、レコードごとに `PATCH /api/er/{collection}/{id}` を送ります。

| 操作 | 書き込む先 |
|---|---|
| テーブルのドラッグ | `er/entities` の、そのテーブルの `position` |
| インスペクタの適用 (見出し) | `er/entities` の、そのテーブル |
| インスペクタの適用 (カラム) | `er/identifiers` か `er/attributes` の、そのマスタ |

- インスペクタに出す項目と、入れられる値の検査は、`@yanqirenshi/model.er` が決めます。
- インスペクタは、`@yanqirenshi/colonoscope` の `ModelInspector` です。パネルの右端に、上から下まで (幅 `320px`) 出します。
- 保存できなかったとき (API サーバーが止まっているときなど) や、値が正しくないときは、図の上にエラーを出します。
- ほかのタブ・エディタ・git でデータが変わったときは、図を描き直します。自分のドラッグで保存したときは、描き直しません。

設定 (`useConfig()`) は、次の項目を読みます。

| 設定 | 使い方 |
|---|---|
| `diagrams.er.grid` | d3.er の `grid` の設定として、そのまま渡します。(例: `{ draw: false }` でグリッド線を消す。渡さないときは、d3.er の既定) |
| `app.name` | 図の位置と拡大を覚える鍵 (`ihub:{app.name}:view:er`) に使います |

([カスタマイズ](#/customize) の「図のグリッド線を消す」、[図の編集](#/diagrams) の「図の位置と拡大を覚える」)

- ソース: `packages/ihub.core/src/components/panels/ER.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

アプリのページのタブに、ER 図を出します。

```jsx
import { TabbedPage, panels } from '@yanqirenshi/ihub.core';

// 部品の表は、モジュールの中で 1 つだけ作る。
const PANELS = { er: panels.ER };

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
- 初めの位置と拡大 (覚えたものが無いとき) は、`{ k: 0.7, x: 1000, y: 100 }` で決まっていて、変えられません。
- データの ER 図のタブを、自分の部品に差し替えるときは、設定の `panels` に `{ PAGE_DATA: { 'er-diagram': MyEr } }` を渡します。([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)
- `docPages.ER` (`/er`) は、ER 図の参考資料を並べたページで、このパネルとは別の部品です。
