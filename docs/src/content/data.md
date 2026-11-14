# データの管理

## データの置き場所

設計のデータは、`data/` に JSON で置きます。
ドメインのフォルダの下に、コレクションごとのファイルを置きます。

| ファイル | 内容 | 使う画面 |
|---|---|---|
| `wbs/projects.json` | WBS のプロジェクト | WBS |
| `wbs/wbs.json` | WBS のノード | WBS |
| `wbs/workpackages.json` | ワークパッケージ | WBS・艦橋の Schedule |
| `er/schemas.json` | テーブルの名前空間 (スキーマ) のマスタ | ER 図 |
| `er/identifiers.json` | 識別子 (主キー) のマスタ | ER 図 |
| `er/attributes.json` | 属性 (カラム) のマスタ | ER 図 |
| `er/entities.json` | テーブル (識別子・属性のインスタンスを持つ) | ER 図 |
| `er/relationships.json` | テーブルの間の関係 (FK) | ER 図 |
| `tm/identifiers.json` | 識別子のマスタ | TM |
| `tm/attributes.json` | 属性のマスタ | TM |
| `tm/entities.json` | エンティティ | TM |
| `tm/relationships.json` | リレーションシップ | TM |
| `classes/classes.json` | クラス (d3.classes の形で書く。無くてもよい) | クラス図 |
| `classes/relationships.json` | クラスの間の関係 (無くてもよい) | クラス図 |
| `sitemap/nodes.json` | 画面のノード | 画面遷移図 |
| `sitemap/edges.json` | 画面の遷移 | 画面遷移図 |
| `deployment/nodes.json` | ノード (入れ子にでき、リンクを付けられる) | システム構成図 |
| `deployment/edges.json` | ノードの間の線 | システム構成図 |
| `overview/nodes.json` | ポンチ絵のノード (入れ子にでき、d3.unchi の形で書く) | 艦橋の Overview |
| `overview/edges.json` | ノードの間の線 | 艦橋の Overview |
| `systemic_design/sections.json` | 章とカード | Systemic Design |
| `local/account_menus.json` | サイドメニューの on/off (個人の設定) | サイドメニュー |

## フォーマット

フォーマットは、`packages/ihub.srv/src/schemas/{ドメイン}/{コレクション}.schema.json` の JSON Schema で決めています。
各項目の説明も、スキーマの `description` に書いてあります。

たとえば、`wbs/wbs.json` の 1 件は次のような形です。

```json
{
    "id": 1001,
    "parent": 1,
    "name": "デザイン"
}
```

### ワークパッケージの予定の期間 (`plan`)

`wbs/workpackages.json` のワークパッケージには、任意で、予定の期間 (`plan`) を書けます。(0.4.0 以降)
書いたワークパッケージは、艦橋 (`/`) の「Schedule」タブに、矢羽根で出ます。

```json
{
    "id": 1000001,
    "parent": 1001,
    "name": "設計",
    "plan": { "from": "2026-11-01", "to": "2026-11-30" }
}
```

- `from` (始まりの日) と `to` (終わりの日) は、`'YYYY-MM-DD'` の日付で、どちらも書きます。
- `to` は、`from` と同じ日か、あとの日にします。
- 形の誤り・実在しない日・`to` が `from` より前のときは、`npx ihub-srv check data` と API サーバーの書き込みが、誤りを知らせます。
- `plan` を書かないワークパッケージは、これまでどおりです。(Schedule タブには出ません)
- 期間は、画面からは書き換えられません。JSON を直接書きます。

## id と参照のきまり

- レコードには、それぞれ id があります。
- `parent` や `from.id` のように、ほかのレコードを指す項目は、指す先が存在している必要があります。
- WBS の id は、プロジェクト・WBS・ワークパッケージをまたいで一意にします。
WBS の id は、URL (`/wbs/{id}`) とページのファイル名 (`P{id}.js`) に使います。
- 画面から追加したレコードの id は、API サーバーが振ります。(そのコレクションの最大の id + 1)

## データを変える 3 つの方法

| 方法 | 内容 |
|---|---|
| 画面で編集する | 図のノードのドラッグ、WBS のノードの追加、サイドメニューの on/off。API サーバーが検証してから保存します。 |
| エディタで書き換える | `data/` の JSON を直接書き換えます。開いている画面に、すぐ反映されます。 |
| git で取り込む | pull や checkout で `data/` が変わったときも、開いている画面に、すぐ反映されます。 |

エディタや git で変えた内容がフォーマットやルールに合っていないときは、画面に反映せず、画面の上にお知らせを出します。
直すと、お知らせは消えます。

## フォーマットを確かめる

```
npx ihub-srv check data
```

- `data/` が、スキーマとルールに合っているかを確かめます。フォルダを何個でも指定できます。(`npx ihub-srv check data <別のフォルダ>`)
- 合っていないときは、場所と理由を日本語で表示して、1 で終わります。
- アプリで、API サーバーにスキーマを足しているときは、`--schemas <スキーマのフォルダ>` を付けます。

```
er/entities/0/position/x: numberでなければいけない
sitemap/edges: to.id のノードが見つかりません。(id=2000001, to.id=123)
```

## 共有のしかた

- `data/` は、アプリのリポジトリに commit・push して共有します。
- JSON の書き方 (インデントなど) は API サーバーが固定するので、git の差分が読みやすくなります。
- 同じファイルを何人かで変えて衝突したときは、git のマージで直してから、`npx ihub-srv check data` で確かめてください。
- `data/local/` (個人の設定) は、git で共有しません。

## 雛形

`@yanqirenshi/ihub.core` の `examples/data/` は、`data/` の雛形です。`npx ihub-srv init` で、`data/` にコピーできます。
`data/` と同じフォーマットで、サンプルのデータが入っています。
新しくアプリのドキュメントを作るときは、ここから始めてください。
