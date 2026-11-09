# @yanqirenshi/ihub.srv

iHub の API サーバーです。
`data/` の JSON を、スキーマとルールで検証しながら読み書きします。
iHub の画面 (`@yanqirenshi/ihub.core`) は、起動時にこの API サーバーから全データを読み込み、編集した内容を API サーバーへ保存します。

親の issue: [#65](https://github.com/yanqirenshi/iHub/issues/65)

## 構成

|   |            |                                                                     |
|---|------------|---------------------------------------------------------------------|
| - | bin/ihub-srv.mjs | CLI (起動・check・init)                                       |
| - | src/index.mjs    | 公開するもの (createApp・serve・validateData・validateDataDir・COLLECTIONS) |
| - | src/app.mjs      | API のルート (createApp)                                      |
| - | src/serve.mjs    | 127.0.0.1 で待ち受ける                                        |
| - | src/guard.mjs    | ほかのサイトからの要求を断る (Host・Origin・Content-Type の確認) |
| - | src/watcher.mjs  | data/ の変更を見張る (エディタや git での変更を、画面へ知らせるため) |
| d | src/services     | 読み書きの手順 (検証・採番・競合の検出)                       |
| d | src/stores       | data/ の JSON ファイルの読み書き                              |
| d | src/schemas      | コレクションごとの JSON Schema ({domain}/{collection}.schema.json) |
| d | src/validation   | スキーマと、コレクションをまたぐルール (id の重複・参照の整合性) による検証 |
| d | src/tools        | 古い形式のデータ (src/data/*.js) を、data/ の JSON に変換するスクリプト |
| d | test             | テスト                                                        |

## CLI

```
ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]
ihub-srv check <dir>... [--schemas <dir>]
ihub-srv init [dir]
```

### 起動

```
ihub-srv --data data
```

| オプション | 内容 | 既定 |
|---|---|---|
| `--data <dir>`   | データのフォルダ | `data` |
| `--static <dir>` | ビルドした画面のフォルダ。指定すると、API と画面を一緒に出す | 無し (API だけ) |
| `--port <n>`     | 待ち受けるポート | 環境変数 `IHUB_API_PORT`、無ければ 4000 |
| `--app-name <name>` | `createApp` の `app_name`。画面の設定の `app.name` と同じ名前にする | `iHub` |

127.0.0.1 で待ち受けます。
`data` のフォルダの JSON の変更も見張り、エディタや git で変えたときも画面へ知らせます。

### check

```
ihub-srv check data
ihub-srv check data packages/ihub.core/examples/data
```

指定したデータのフォルダを、スキーマとルールで検証します。
問題があれば、場所と理由を表示して、1 で終わります。
`--schemas` には、アプリが足したスキーマのフォルダ (`createApp` の `extensions.schemas_dir`) を指定します。

### init

```
ihub-srv init data
```

雛形 (`@yanqirenshi/ihub.core` の `examples/data`) から、データのフォルダを作ります。
フォルダに同じ名前のファイルがあるときは、何も書かずに 1 で終わります。

## createApp

```js
import { createApp, serve } from '@yanqirenshi/ihub.srv';

const app = createApp({
    data_dir:   'data',
    static_dir: 'build',          // 省略すると、API だけ
    watch:      true,
    app_name:   'iHub',
    extensions: {
        schemas_dir: 'server/schemas',
        rules:       { mydomain: (data)=> [] },
        routes:      (app)=> {},
    },
});

serve(app, { port: 4000, app_name: 'iHub' });
```

| 引数 | 内容 | 既定 |
|---|---|---|
| `data_dir`   | データのフォルダ | (必須) |
| `static_dir` | ビルドした画面のフォルダ。指定したときだけ配信する | `null` |
| `watch`      | `data_dir` の変更を見張って、画面へ知らせるか | `false` |
| `app_name`   | ログの名前と、書き込んだ画面の id を送るヘッダー名 (`X-{app_name}-Client`) | `iHub` |
| `extensions.schemas_dir` | アプリが足すスキーマのフォルダ (`{domain}/{collection}.schema.json`)。パッケージのスキーマと同じ名前のコレクションは足せない | 無し |
| `extensions.rules`       | アプリが足す整合性ルール。`{ ドメイン: (そのドメインのコレクション)=> エラーのメッセージの配列 }`。パッケージのルールと同じドメインのときは、両方を検査する | 無し |
| `extensions.routes`      | 追加のルート。`(app)=> {}` で Hono のアプリを受け取る。`/api/{domain}/{collection}` より先に登録する | 無し |

`app_name` が `iHub` のときは `X-iHub-Client`、`iwo Studio` のときは `X-iwo-Studio-Client` です。
英数字とハイフン以外の文字は `-` にします。
ヘッダー名の規則は、`x-{app_name の英数字とハイフン以外を - にして、小文字にしたもの}-client` です。
画面 (`@yanqirenshi/ihub.core`) は、設定の `app.name` から、同じ規則でヘッダー名を作ります。(`packages/ihub.core/src/config.js` の `clientHeaderName`。規則を変えるときは、両方を合わせてください)

コレクションの一覧 (`COLLECTIONS`) は、パッケージの `src/schemas/` と `extensions.schemas_dir` の両方から作ります。

## API

| メソッド | パス | 内容 |
|---|---|---|
| GET    | /api/data                         | 全データと、コレクションごとの ETag |
| GET    | /api/events                       | 変更の通知 (Server-Sent Events) |
| GET    | /api/{domain}/{collection}        | コレクション |
| PUT    | /api/{domain}/{collection}        | コレクション全体を書き換える (If-Match が必要) |
| PATCH  | /api/{domain}/{collection}        | オブジェクトのコレクションを、JSON Merge Patch で書き換える |
| POST   | /api/{domain}/{collection}        | レコードを追加する (id が無ければ振る) |
| PATCH  | /api/{domain}/{collection}/{id}   | レコードを、JSON Merge Patch で書き換える |
| DELETE | /api/{domain}/{collection}/{id}   | レコードを削除する (参照されていれば 409) |

- 書き込む前に、ドメインのデータ全体をスキーマとルールで検証します。合わないときは 400 で理由を返します。
- If-Match に ETag を指定すると、読み込んだあとにほかで変更されていたときは 412 を返します。
- 書き込みは 1 つずつ順に行い、一時ファイルに書いてから置き換えます。
- 書き込むときに `X-{app_name}-Client` ヘッダー (既定は X-iHub-Client) で画面 (タブ) の id を送ると、変更の通知にその id が付きます。

## 変更の通知

GET /api/events に接続すると、次の通知が届きます。

| 通知 | 内容 |
|---|---|
| ready   | 接続したときに送る。全コレクションの ETag |
| changed | コレクションが変わった。(name・etag・client) API での書き込みのほか、エディタや git でファイルを変えたときも送る |
| invalid | ファイルが変わったが、フォーマットやルールに合っていない。(name・errors) |

画面は、changed を受けたら、そのコレクションを読み直します。

## id の振り方

コレクションの最大の id + 1 から、ドメインの中で使われていない id まで進めます。
コレクションが空のときは、スキーマの x-id-start から振ります。(無ければ 1)

## 個人の設定

domain が local のコレクション (例: local/account_menus) は、個人の設定です。
data/local/ に保存し、git では共有しません。
ファイルが無いときは、スキーマの default を返します。

## テスト

```
npm test -w @yanqirenshi/ihub.srv
```

iHub のリポジトリのルートで `npm run test:data` を実行すると、`data/` と雛形のデータの検証 (`ihub-srv check`) に続けて、このテストも動きます。

## コレクションを追加するとき

パッケージのコレクション (iHub 本体のもの) を足すとき:

1. `src/schemas/{domain}/{collection}.schema.json` を作ります。
2. `data/{domain}/{collection}.json` と、雛形のデータ (`packages/ihub.core/examples/data/{domain}/{collection}.json`) を作ります。
3. コレクションをまたぐ検査が必要なときは、`src/validation/rules.mjs` に書きます。

アプリ固有のコレクションを足すとき:

1. `extensions.schemas_dir` のフォルダに、`{domain}/{collection}.schema.json` を作ります。
2. `data/{domain}/{collection}.json` を作ります。
3. コレクションをまたぐ検査が必要なときは、`extensions.rules` に書きます。
4. `ihub-srv check data --schemas <extensions.schemas_dir のフォルダ>` で確かめます。

## 古い形式のデータを変換するとき

データが src/data/*.js だったころの iHub をコピーしたアプリは、次のコマンドで data/ の JSON に変換できます。

```
node node_modules/@yanqirenshi/ihub.srv/src/tools/convert-legacy-data.mjs src/data data
```

- 書き出し先に同じ名前のファイルがあるときは、何も書かずに止まります。(上書きするときは --force を付けます)
- src/data/ の ACCOUNT_MENUS.js・ICONS.js・OPERATOR_ITEMS.js は変換しません。src/config/ に移します。
- MODULE_TYPELESS_PACKAGE_JSON という警告が出ますが、問題はありません。
