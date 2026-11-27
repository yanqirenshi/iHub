# TmTables

TM のデータを、表で出すパネルです。(0.12.0 以降)
`panels.TmEntities`・`panels.TmIdentifiers`・`panels.TmAttributes`・`panels.TmRelationships` の 4 つがあり、同じ表の部品を使います。
ビジネス (`/business`) の「Entities」「Identifiers」「Attributes」「Relationships」のタブに出しています。

- ソース: `packages/ihub.core/src/components/panels/tm/TmTables.js`

## 出すもの

| パネル | タブの code | 出すファイル | 列 |
|---|---|---|---|
| `TmEntities` | `entities` | `data/tm/entities.json` | ID・種別・名称・識別子・属性・説明 |
| `TmIdentifiers` | `identifiers` | `data/tm/identifiers.json` | ID・論理名・物理名・データ型・説明 |
| `TmAttributes` | `attributes` | `data/tm/attributes.json` | ID・論理名・物理名・データ型・説明 |
| `TmRelationships` | `relationships` | `data/tm/relationships.json` | ID・種類・接続元のエンティティ・接続先のエンティティ・ラベル・サブセット (区分・区分コード)・説明 |

- 並びは、ファイルの順です。
  並べ替え・絞り込み・編集・削除は、ありません。
- Identifiers・Attributes の名前が、論理名と物理名の組なら、それぞれの列に出します。
  文字列なら、論理名の列に出し、物理名の列は空にします。
- Entities・Relationships の名前は、文字列ならそのまま、組なら「論理名 (物理名)」と出します。
- Entities の識別子・属性の列は、エンティティが持つ行の名前です。
- データ型の列は、`decimal(10, 2)`・`varchar(20)`・`date` のように出します。(データ型の説明は出しません)
- 指す先が見つからないときは、id をそのまま出します。
- レコードが無いときは、表の代わりに、知らせを出します。
- 表がコンテンツエリアより長い・広いときは、表の中でスクロールします。見出しの行は、上に残ります。
- TM タブのインスペクタで書き換えると、表も新しい値になります。

## 追加のフォーム

4 つのタブの、表の上の右端に、「Entity の追加」「Identifier の追加」「Attribute の追加」「Relationship の追加」のボタンがあります。
押すと、モーダルのフォームが出ます。
「作成」で、`POST /api/tm/{entities|identifiers|attributes|relationships}` に、レコードを 1 件足します。(id は、API サーバーが振ります)

- 「キャンセル」・モーダルの外のクリック・Esc で、何も保存せずに閉じます。
- 保存できなかったときは、閉じずに、誤りの文を出します。
- モーダルを開いている間は、サイドメニューも暗くなり、押せません。
- 画面から足せるのは、追加だけです。(削除は、ファイルで行います)
- 保存するレコードの `name` は、物理名が空なら論理名の文字列、物理名があれば `{ logical, physical }` の組です。
  空の項目は、書きません。

### Entity の追加

左に、エンティティのイメージ (入力から描く図。見るだけ) が出ます。
右に、タブ「基本」「Identifiers」「Attributes」が出ます。

| タブ | 項目 |
|---|---|
| 基本 | 種別 (既定は `RESOURCE`)・論理名 (必須)・物理名・説明 |
| Identifiers・Attributes | 左は「選択した一覧」(選んだ順。行の「×」で外します)。右は「検索」と「全ての一覧」(選んだものは出しません。行を押すと、左の末尾に入ります) |

- 検索は、論理名・物理名・ID・説明のどれかに含むもので、右の一覧だけを絞り込みます。(大文字と小文字は区別しません)
- タブを切り替えても、入力と選択と検索の文字は消えません。
- 新しいエンティティは、いまあるエンティティの右 (`position.x` の最大 + 400) に置きます。
  TM のタブの図で、ドラッグして動かせます。

### Identifier の追加・Attribute の追加

項目は、論理名 (必須)・物理名・データ型・長さ・小数部の桁数・説明です。
データ型の説明は、フォームにありません。(TM タブのインスペクタで入れます)

### Relationship の追加

項目は、次のとおりです。

1. 接続元と接続先のエンティティ (必須)
2. それぞれのカーディナリティ (1・多)
3. それぞれのオプショナリティ (任意・必須)
4. 種類
5. ラベル
6. サブセットの区分と区分コード
7. 説明

- エンティティが無いときは、知らせを出し、「作成」を押せません。
- 結線の接続位置は、接続元と接続先のエンティティの位置から、向かい合う向きに決めます。
  フォームに欄はありません。(TM のタブのインスペクタで変えられます)

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.TmEntities/>
```

## props

props はありません。

## 使い方の例

ビジネスのページの新しいタブが要らないときは、設定でタブを隠します。([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)

```jsx
const config = {
    // (省略)
    tabs: { PAGE_BUSINESS: { list: [
        { code: 'entities',      hidden: true },
        { code: 'identifiers',   hidden: true },
        { code: 'attributes',    hidden: true },
        { code: 'relationships', hidden: true },
    ] } },
};
```

追加のボタンが要らないときは、設定の `panels.PAGE_BUSINESS` で、そのタブのパネルを自分の部品に差し替えます。

## 注意

- `<IHub>` の中で使います。
  API サーバーから読み込んだ `tm/` のデータと、redux の store を使うためです。
- 設定の `tabs.PAGE_BUSINESS` でタブを足しているアプリでは、足したタブは、これまでどおり末尾に並びます。
  新しい 4 つは、TM と機能一覧の間に入ります。
- 足したタブの code が、新しい 4 つのどれか (`entities` など) と同じときは、新しいタブの位置で、アプリのタブに差し替わります。(パネルも、設定の `panels.PAGE_BUSINESS` のものが使われます)
- TM の図は、[TM](#/components/panels/TM) のパネルです。
