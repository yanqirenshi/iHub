# データの管理

## データの置き場所

設計のデータは、`data/` に JSON で置きます。
ドメインのフォルダの下に、コレクションごとのファイルを置きます。

| ファイル | 内容 | 使う画面 |
|---|---|---|
| `wbs/projects.json` | WBS のプロジェクト | WBS |
| `wbs/wbs.json` | WBS のノード | WBS |
| `wbs/workpackages.json` | ワークパッケージ | WBS |
| `master_schedule/projects.json` | Schedule のプロジェクト (無くてもよい) | 艦橋の Schedule |
| `master_schedule/wbs.json` | Schedule の WBS (行。入れ子にできる。無くてもよい) | 艦橋の Schedule |
| `master_schedule/workpackages.json` | Schedule のワークパッケージ (矢羽根。無くてもよい) | 艦橋の Schedule |
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

### Schedule の予定 (`master_schedule`)

艦橋 (`/`) の「Schedule」タブに出す予定は、WBS (`data/wbs/`) とは切り離して、`data/master_schedule/` の 3 つのファイルに書きます。(0.7.0 以降。0.8.0 で 3 つのファイルにしました)
ファイルの形は、d3.yabane の入力と同じです。
どのファイルも、無くても動きます。

```json
// projects.json
[
  { "id": 10, "name": "Project 10", "background": { "color": "#eaf4fc" } },
  { "id": 20, "name": "Project 20" }
]

// wbs.json
[
  { "id": 11,  "name": "WBS 10-1",   "project": 10 },
  { "id": 111, "name": "WBS 10-1-1", "parent": 11 },
  { "id": 21,  "name": "WBS 20-1",   "project": 20 }
]

// workpackages.json
[
  { "id": 1000, "parent": 111, "name": "画面の作成", "plan": { "from": "2026-11-01", "to": "2026-11-30" } },
  { "id": 1001, "parent": 11,  "name": "API", "plan": { "from": "2026-11-10", "to": "2026-12-10" }, "wbs": 1000003 },
  { "id": 1002, "project": 20, "name": "公開", "plan": { "from": "2026-12-15", "to": "2026-12-15" }, "url": "https://example.com/release" }
]
```

| ファイル | 書くもの |
|---|---|
| `projects.json` | `id`・`name`。`id` は、プロジェクトの中で重ならないようにします。(WBS と同じ `id` でも構いません) |
| `wbs.json` | `id`・`name`。最上位の WBS は `project` にプロジェクトの `id` を、入れ子の WBS は `parent` に親の WBS の `id` を書きます。(両方あるときは `parent` を使います) |
| `workpackages.json` | `id`・`name`・`plan` と、`parent` (WBS の `id`) か `project` (プロジェクトの `id`) の少なくとも 1 つ。(両方あるときは `parent` を使います) |

- `plan` の `from` (始まりの日)・`to` (終わりの日) は、`'YYYY-MM-DD'` の日付で、どちらも書きます。`to` は、`from` と同じ日か、あとの日です。
- WBS とワークパッケージの `id` は、またいで重ならないようにします。
- ワークパッケージには、任意で行き先を 1 つ書けます。(両方は書けません)
  1. `wbs`: **`data/wbs/` の** WBS のノード (プロジェクト・WBS・ワークパッケージ) の `id`。矢羽根を押すと、そのページ (`/wbs/{id}`) へ移ります。(`master_schedule/wbs.json` の `id` ではありません)
  2. `url`: `http://` か `https://` で始まる URL。矢羽根を押すと、新しいタブで開きます。
- プロジェクト・WBS・ワークパッケージには、任意で見た目を書けます。(書いた項目だけが、d3.yabane の既定に重なります)

| 項目 | 中身 | d3.yabane の既定 |
|---|---|---|
| `background` | `{ color, opacity }` (`opacity` は 0〜1) | `color` 白 |
| `stroke` | `{ color, width, type }` (`type` は `solid`・`dashed`・`dotted`) | `#0e9aa7`・太さ 4・実線 |
| `font` | `{ size, color, weight }` (`weight` は `'bold'`・`700` など) | 大きさ 33 |

- `background`・`stroke` は、プロジェクトと WBS では箱、ワークパッケージでは矢羽根に効きます。`font` は、名前の文字に効きます。
- ワークパッケージの `result` (実績の期間)・`progress` (進捗) も書けますが、描きません。
- `npx ihub-srv check data` が、次の誤りを知らせます。
  1. 形の誤り・日付の誤り (実在しない日・`to` が `from` より前)
  2. 無いプロジェクト・無い WBS を指している
  3. 輪になった入れ子
  4. `parent` も `project` も無いワークパッケージ
  5. `data/wbs/` に無い行き先の `wbs`・`wbs` と `url` の両方
  6. `id` の重なり
- 予定は、画面からは書き換えられません。JSON を直接書きます。
- 図の描き方とできることは、コンポーネントの [Schedule](#/components/panels/bridge/Schedule) にあります。

0.6.x までは、`wbs/workpackages.json` のワークパッケージに `plan` を書いていました。
0.7.0 で使えなくなり、書いてあると `ihub-srv check` が誤りにします。
0.7.0 の `master_schedule/rows.json`・`items.json` は、0.8.0 で `wbs.json`・`workpackages.json` に名前を変えました。
移し方は、[iHub の更新](#/update) の「0.6.x から 0.7.0 以降に上げるとき」にあります。

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
