## server/

data/ を管理する API サーバーを置く場所です。
画面 (src/) は、起動時に API サーバーから全データを読み込み、編集した内容を API サーバーへ保存します。

|   |            |                                                                     |
|---|------------|---------------------------------------------------------------------|
| - | index.mjs  | 起動 (127.0.0.1 で待ち受ける)                                        |
| - | app.mjs    | API のルート                                                         |
| - | guard.mjs  | ほかのサイトからの要求を断る (Host・Origin・Content-Type の確認)     |
| d | services   | 読み書きの手順 (検証・採番・競合の検出)                              |
| d | stores     | data/ の JSON ファイルの読み書き                                     |
| d | schemas    | コレクションごとの JSON Schema ({domain}/{collection}.schema.json)  |
| d | validation | スキーマと、コレクションをまたぐルール (id の重複・参照の整合性) による検証 |
| d | test       | テスト                                                              |

### 起動

```
npm start
```

画面 (react-scripts start) と API サーバーを一緒に起動します。
画面からの /api への要求は、開発サーバー (src/setupProxy.js) が API サーバーへ中継します。
API サーバーのポートは 4000 です。(環境変数 IHUB_API_PORT で変えられます)

ビルドした画面を API サーバーから配信するときは、次のようにします。

```
npm run build
npm run serve
```

### API

| メソッド | パス | 内容 |
|---|---|---|
| GET    | /api/data                         | 全データと、コレクションごとの ETag |
| GET    | /api/{domain}/{collection}        | コレクション |
| PUT    | /api/{domain}/{collection}        | コレクション全体を書き換える (If-Match が必要) |
| PATCH  | /api/{domain}/{collection}        | オブジェクトのコレクションを、JSON Merge Patch で書き換える |
| POST   | /api/{domain}/{collection}        | レコードを追加する (id が無ければ振る) |
| PATCH  | /api/{domain}/{collection}/{id}   | レコードを、JSON Merge Patch で書き換える |
| DELETE | /api/{domain}/{collection}/{id}   | レコードを削除する (参照されていれば 409) |

- 書き込む前に、ドメインのデータ全体をスキーマとルールで検証します。合わないときは 400 で理由を返します。
- If-Match に ETag を指定すると、読み込んだあとにほかで変更されていたときは 412 を返します。
- 書き込みは 1 つずつ順に行い、一時ファイルに書いてから置き換えます。

### id の振り方

コレクションの最大の id + 1 から、ドメインの中で使われていない id まで進めます。
コレクションが空のときは、スキーマの x-id-start から振ります。(無ければ 1)

### 個人の設定

domain が local のコレクション (例: local/account_menus) は、個人の設定です。
data/local/ に保存し、git では共有しません。
ファイルが無いときは、スキーマの default を返します。

### データの検証

```
npm run test:data
```

data/ と src/ihub/data_example/ が、スキーマとルールに合っているかを確かめます。
API サーバーのテストも、このコマンドで動きます。

### コレクションを追加するとき

1. server/schemas/{domain}/{collection}.schema.json を作ります。
2. data/{domain}/{collection}.json と src/ihub/data_example/{domain}/{collection}.json を作ります。
3. コレクションをまたぐ検査が必要なときは、server/validation/rules.mjs に書きます。
