# @yanqirenshi/ihub.srv

iHub の API サーバーです。
`data/` の JSON を、スキーマとルールで検証しながら読み書きします。
iHub の画面 (`@yanqirenshi/ihub.core`) は、起動時にこの API サーバーから全データを読み込み、編集した内容を API サーバーへ保存します。

親の issue: [#65](https://github.com/yanqirenshi/iHub/issues/65)

## 構成

|   |            |                                                                     |
|---|------------|---------------------------------------------------------------------|
| - | bin/ihub-srv.mjs | CLI (起動・check・init・convert-legacy・migrate-er)           |
| - | src/index.mjs    | 公開するもの (createApp・serve・validateData・validateDataDir・COLLECTIONS) |
| - | src/app.mjs      | API のルート (createApp)                                      |
| - | src/serve.mjs    | 127.0.0.1 で待ち受ける                                        |
| - | src/guard.mjs    | ほかのサイトからの要求を断る (Host・Origin・Content-Type の確認) |
| - | src/watcher.mjs  | data/ の変更を見張る (エディタや git での変更を、画面へ知らせるため) |
| d | src/services     | 読み書きの手順 (検証・採番・競合の検出)                       |
| d | src/stores       | data/ の JSON ファイルの読み書き                              |
| d | src/schemas      | コレクションごとの JSON Schema ({domain}/{collection}.schema.json) |
| d | src/validation   | スキーマと、コレクションをまたぐルール (id の重複・参照の整合性) による検証 |
| d | src/tools        | `convert-legacy`・`migrate-er` の変換 (古い形式のデータを、新しい形式に変換する) |
| d | test             | テスト                                                        |

## CLI

```
ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]
ihub-srv check <dir>... [--schemas <dir>]
ihub-srv init [dir]
ihub-srv init --app [dir] [--force | --skip-existing | --only <path>...]
ihub-srv convert-legacy <古い src/data のフォルダ> <data のフォルダ> [--force]
ihub-srv migrate-er <data のフォルダ>
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
作業フォルダの `.env.local` があれば、環境変数として読み込みます。(すでにある環境変数は上書きしません)
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

### init --app

```
ihub-srv init --app [dir]
```

雛形 (`@yanqirenshi/ihub.core` の `examples/app`) から、アプリのファイル (`src/index.js`・`src/Router.js`・`src/config/`・`src/operators/`・`src/wbs/`・`src/setupProxy.js`・`public/`・`.gitignore`・`.env.local.template` など) を作ります。
`dir` の既定は、作業フォルダです。

| オプション | 内容 |
|---|---|
| (なし) | 同じ名前のファイルがあるときは、何も書かずに 1 で終わります。 |
| `--force` | 上書きします。 |
| `--skip-existing` | すでにあるファイルはそのままにして、無いものだけを作ります。 |
| `--only <path>` | 雛形のうち、`path` (ファイル、またはフォルダ。例: `src/index.js`) だけを、上書きして作ります。何度でも指定できます。`package.json` は変えません。 |

`package.json` があるときは、足りない項目 (`dependencies`・`scripts`・`overrides`・`eslintConfig`・`browserslist`) だけを足します。(すでにある項目は変えません。`--only` のときは、触りません) 無いときは、雛形から作ります。
作ったあとは、`npm install` を実行してください。

### convert-legacy

```
ihub-srv convert-legacy src/data data
```

データが `src/data/*.js` だったころ ([#21](https://github.com/yanqirenshi/iHub/pull/21) より前) の iHub をコピーしたアプリのデータを、`data/` の JSON に変換します。

- 書き出し先に同じ名前のファイルがあるときは、何も書かずに 1 で終わります。(上書きするときは `--force` を付けます)
- `src/data/` の `ACCOUNT_MENUS.js`・`ICONS.js`・`OPERATOR_ITEMS.js` は変換しません。`src/config/` に移します。
- ER は、階層形式にして書きます。

### migrate-er

```
ihub-srv migrate-er data
```

`data/er/` を、フラット形式 (`columns.json`・`column_instances.json`・`ports.json` がある形) から、階層形式 (`identifiers.json`・`attributes.json` など。`@yanqirenshi/model.er` のレコード) に変換します。
変換したデータを検査して (問題があれば、何も書かずに 1 で終わります)、書き換えます。
変換済みのときは、止まります。

フラット形式の項目のうち、階層形式に写し先が決まっていないもの (TABLE の `color` など、アプリが足した項目) は、そのまま entity (COLUMN は identifiers / attributes) に写します。

カラムのインスタンスの名前 (`logical_name`・`physical_name`・`description`) と `data_type` は、COLUMN と違うときは、名前の違うインスタンスごとに、別のマスタ (identifiers / attributes) を作って指します。(階層形式では、名前はマスタだけが持つため。同じ COLUMN で同じ名前のインスタンスは、1 つのマスタを指す。最初の名前のマスタが COLUMN の `_id` を引き継ぎ、2 つ目からは、ER のどの `_id` とも重ならない値を振る) 変換のあとに、マスタの数 (COLUMN から作った数・名前の違いで増えた数) を表示します。
0.2.2 以前の `migrate-er` は、インスタンスの名前を、COLUMN の `name`・`code` に替えていました。0.2.3 以降で、元のフラット形式のデータから変換し直すと、名前が戻ります。

主キーのインスタンス (`column_type` が `IDENTIFIER` か `ID`) が指すマスタは、識別子 (`identifiers.json`)、それ以外のインスタンス (外部キーなど) が指すマスタは、属性 (`attributes.json`) です。識別子か属性かは、COLUMN ごとではなく、インスタンスごとに決めます。(同じ COLUMN が、あるテーブルでは主キー、ほかのテーブルでは外部キーのときは、識別子のマスタと属性のマスタに分かれます。0.2.4 以前は、`IDENTIFIER` だけが識別子で、`ID` の主キーは属性になっていました。0.2.5 以降で、元のフラット形式のデータから変換し直すと、主キーが識別子になります)

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
| `github`     | GitHub の OAuth の設定 `{ client_id, client_secret }`。省略すると、環境変数 `GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET` から読む。どちらも無いときは、`/api/github/token` が `configured: false` を返すだけ | 環境変数 |
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
- `{id}` が記号を含む文字列のとき (クラス図の `Plan->Workpackage` など) は、`encodeURIComponent` で符号化して送ります。
- URL の `{id}` は、数字だけなら数値として探します。見つからないときは、文字列としても探します。(id が `"123"` のような文字列のレコードも引けます。0.6.0 以降)

## GitHub の OAuth

GitHub の OAuth App (Web アプリケーションフロー) で、画面が GitHub に接続するためのトークンを得ます。
コードとトークンの交換は、client secret を画面に出さないため、API サーバーが行います。
トークンは、API サーバーのメモリにだけ持ちます。(ファイルには書きません。API サーバーを起動し直したら、認証し直します)

| メソッド | パス | 内容 |
|---|---|---|
| GET    | /api/github/token               | `{ configured, token }`。configured は OAuth App が設定されているか、token は OAuth で得たトークン (無ければ null) |
| GET    | /api/github/oauth/login         | GitHub の認可画面へ送り出す。`return_to` に、認証のあとに戻る画面のパス (この画面の中のパスだけ) を指定する |
| GET    | /api/github/oauth/callback      | GitHub から戻ってくる。コードをトークンに替えて、`return_to` へ戻す |
| DELETE | /api/github/token               | OAuth のトークンを捨てる (接続を切る) |

- OAuth App の Client ID と Client secret は、`createApp` の `github` か、環境変数 `GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET` で渡します。どちらも無いときは、`configured: false` を返すだけで、ほかは変わりません。
- OAuth App の Authorization callback URL は、画面を開く URL の `/api/github/oauth/callback` にします。(例: 開発サーバーなら `http://localhost:3000/api/github/oauth/callback`、`ihub-srv --static` なら `http://localhost:4000/api/github/oauth/callback`)
- 求める権限は `repo`・`project`・`read:org`・`read:user` です。(`read:user` は、画面が接続の確認に使う viewer の問い合わせが、`email` を読むために要ります。無いと、認証できても「GitHub に接続していません。」のままになります)
- `/api/{domain}/{collection}` より先に登録するので、`/api/github/token` がコレクションと見なされることはありません。
- `/api/github/token` が、トークンを画面に返せるのは、API サーバーが、`guard` (`Host`・`Origin` の確認) で、このパソコンの中からの要求だけを受け付けているためです。この確認を外して公開しないでください。
- callback URL は、要求の `Host` から、`http://` 固定で作ります。`https` の後ろ (リバースプロキシなど) に置く構成は、想定していません。

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

## ファイルが無くてもよいコレクション

スキーマに `default` があるコレクションは、ファイルが無くても起動できます。(0.6.0 以降)
ファイルが無いときは、`default` を返し、`default` のデータとしてルールも検査します。
最初に書き込んだときに、ファイルを作ります。

いまは、local のコレクションと、クラス図 (`classes/classes`・`classes/relationships`。`default` は `[]`) が当てはまります。
クラス図は 0.6.0 で足したので、`data/classes/` の無いアプリでも、今までどおり動くようにしています。

## テスト

```
npm test -w @yanqirenshi/ihub.srv
```

iHub のリポジトリのルートで `npm run test:data` を実行すると、`data/` と雛形のデータの検証 (`ihub-srv check`) に続けて、このテストも動きます。

## コレクションを追加するとき

パッケージのコレクション (iHub 本体のもの) を足すとき:

1. `src/schemas/{domain}/{collection}.schema.json` を作ります。
   - すでにあるアプリが、ファイルを足さなくても動くようにするときは、スキーマに `default` を書きます。([ファイルが無くてもよいコレクション](#ファイルが無くてもよいコレクション))
2. `data/{domain}/{collection}.json` と、雛形のデータ (`packages/ihub.core/examples/data/{domain}/{collection}.json`) を作ります。
3. コレクションをまたぐ検査が必要なときは、`src/validation/rules.mjs` に書きます。

アプリ固有のコレクションを足すとき:

1. `extensions.schemas_dir` のフォルダに、`{domain}/{collection}.schema.json` を作ります。
2. `data/{domain}/{collection}.json` を作ります。
3. コレクションをまたぐ検査が必要なときは、`extensions.rules` に書きます。
4. `ihub-srv check data --schemas <extensions.schemas_dir のフォルダ>` で確かめます。

## 古い形式のデータを変換するとき

`ihub-srv convert-legacy` (データが `src/data/*.js` のとき) と、`ihub-srv migrate-er` (ER がフラット形式のとき) で変換できます。
コピー版のアプリを、パッケージを使う形に移す手順全体は、マニュアルの「コピー版からの移行」を見てください。
