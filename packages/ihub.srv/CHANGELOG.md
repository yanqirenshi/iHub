# 更新履歴 (@yanqirenshi/ihub.srv)

`@yanqirenshi/ihub.core` と同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、API・データのフォーマット・CLI を変えるときに、minor を上げます。
(リポジトリ全体の更新履歴は、[ルートの CHANGELOG.md](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) にあります)

## 0.1.0 (2026-11)

iHub の API サーバー (`server/`) を、npm のパッケージにした、最初の版です。
iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) を見てください。

### 切り出し

- 公開する名前: `createApp`・`serve`・`registerGithub`・`createValidation`・`validateData`・`validateDataDir`・`COLLECTIONS`。
- スキーマ (`src/schemas/`) と、整合性のルールを、パッケージに入れた。

### `createApp`

- `app_name`: ログと、書き込んだ画面の id を送るヘッダー名 (`X-{app_name}-Client`) の名前。(既定 `iHub`)
- `extensions`: アプリ固有のドメインを足す。`schemas_dir` (追加のスキーマ)・`rules` (追加の整合性ルール)・`routes` (追加のルート)。
- `github`: GitHub の OAuth の設定。(省略すると、環境変数 `GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET`)

### CLI `ihub-srv`

- `ihub-srv [--data <dir>] [--static <dir>] [--port <n>] [--app-name <name>]`: 起動する。作業フォルダの `.env.local` を、環境変数として読む。
- `ihub-srv check <dir>... [--schemas <dir>]`: データのフォルダを、スキーマとルールで検証する。
- `ihub-srv init [dir]`: 雛形から `data/` を作る。
- `ihub-srv init --app [dir] [--force | --skip-existing | --only <path>]`: 雛形から、アプリのファイル (`src/`・`public/` など) を作る。
- `ihub-srv convert-legacy <src/data> <data> [--force]`: 古い形式のデータを、`data/` の JSON に変換する。
- `ihub-srv migrate-er <data>`: ER のデータを、フラット形式から階層形式に変換する。

### GitHub の OAuth

- OAuth App の Web アプリケーションフロー。(`GET /api/github/token`・`GET /api/github/oauth/login`・`GET /api/github/oauth/callback`・`DELETE /api/github/token`)
- コードとトークンの交換は、サーバーで行う。トークンは、メモリにだけ持つ。
- 設定が無いときは、`configured: false` を返すだけで、ほかは変わらない。
