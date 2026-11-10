# 更新履歴 (@yanqirenshi/ihub.srv)

`@yanqirenshi/ihub.core` と同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、API・データのフォーマット・CLI を変えるときに、minor を上げます。
(リポジトリ全体の更新履歴は、[ルートの CHANGELOG.md](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) にあります)

## 0.2.5 (2026-11)

### 修正

- `ihub-srv migrate-er` が、`column_type` が `ID` の主キーも、識別子 (`identifiers.json`) にするようにした。(yanqirenshi/iHub#106)
  - これまでは、`IDENTIFIER` だけを識別子にしていた。フラット形式の主キーのインスタンスには、`IDENTIFIER` のデータ (UkiyoSnow) と、`ID` のデータ (iwo.Studio・Bokasafn) があり、`ID` の主キーは、すべて属性 (`attributes.json`) になっていた。
  - いまは、`IDENTIFIER` か `ID` のインスタンスが指すマスタを、識別子にする。それ以外のインスタンス (外部キーなど) が指すマスタは、属性。識別子か属性かは、COLUMN ごとではなく、**インスタンスごと**に決める。
  - 同じ COLUMN が、あるテーブルでは主キー、ほかのテーブルでは外部キーのとき (例: `user_id`) は、識別子のマスタと、属性のマスタに分ける。(階層形式では、`identifiers[]` は識別子のマスタを、`attributes[]` は属性のマスタを指すため。#100 のマスタの鍵に、識別子 / 属性の別を足した。COLUMN の `_id` を引き継ぐのは、COLUMN ごとに 1 つのマスタだけ)
  - **0.2.4 以前の `migrate-er` で変換したアプリ**は、元のフラット形式のデータ (git の履歴) から、0.2.5 以降の `migrate-er` で変換し直すと、主キーが識別子になる。
- 確かめた: iwo.Studio・Bokasafn・UkiyoSnow の、変換前のフラット形式のデータで、主キーのインスタンスだけが、すべて identifiers に入り (それ以外は、すべて attributes)、インスタンスの名前も、すべて残った。ER 図 (d3.er 0.6.1) のカラムの並びは、移す前 (主キー → 属性 → タイムスタンプ → そのほか) と同じになった。(`ihub-srv check` も通る)

## 0.2.4 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.core` 0.2.4 と、版をそろえるだけ)

## 0.2.3 (2026-11)

### 修正

- `ihub-srv migrate-er` が、カラムのインスタンスの名前を、落とさないようにした。(yanqirenshi/iHub#100)
  - これまでは、インスタンス (`column_instances.json`) の `physical_name`・`description` を捨て、マスタの名前を、COLUMN の `{ logical: name, physical: code }` にしていた。(例: `id` が `USER-ID` になる。同じ COLUMN を違う名前で 2 回使うテーブルは、どちらも同じ名前になる)
  - いまは、インスタンスの名前 (`logical_name`・`physical_name`・`description`) と `data_type` が COLUMN と違うときは、名前の違うインスタンスごとに、別のマスタ (identifiers / attributes) を作って指す。
    - COLUMN と同じ名前 (または名前が無い) インスタンスは、これまでどおり、COLUMN の 1 つのマスタを指す。
    - 同じ COLUMN で同じ名前のインスタンスは、1 つのマスタを指す。
    - 最初に現れた名前 (インスタンスの `_id` の順) のマスタが、COLUMN の `_id` を引き継ぎ、2 つ目からのマスタには、ER のどの `_id` とも重ならない値を振る。(何度変換しても、同じ結果になる)
    - インスタンスの、写し先の決まっていない項目 (アプリが足した項目) は、`entities[].identifiers[]` / `attributes[]` の行に、そのまま写す。
  - 変換のあとに、マスタの数 (COLUMN から作った数・名前の違いで増えた数) を表示する。
  - 描画 (d3.er・model.er) は、変わらない。
  - **0.2.2 以前の `migrate-er` で変換したアプリ**は、元のフラット形式のデータ (git の履歴) から、0.2.3 以降の `migrate-er` で変換し直すと、名前が戻る。
- 確かめた: iwo.Studio (インスタンス 132 件) と UkiyoSnow (202 件) の、変換前のフラット形式のデータで、すべてのインスタンスの名前が、変換のあとのマスタの名前と一致した。(`ihub-srv check` も通る)

## 0.2.2 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.core` 0.2.2 と、版をそろえるだけ)

## 0.2.1 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.core` 0.2.1 と、版をそろえるだけ)

## 0.2.0 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.core` 0.2.0 と、版をそろえるだけ)

## 0.1.1 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.core` 0.1.1 と、版をそろえるだけ)

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

### データのフォーマット

- ER のエンティティに、テーブルの色 `color: { base, inner }` (どちらも任意) を足した。(`@yanqirenshi/model.er` 0.2.0 のスキーマ)
- `ihub-srv migrate-er` が、フラット形式の TABLE・COLUMN の、写し先の決まっていない項目 (`color` など) を、そのまま entity (COLUMN は identifiers / attributes) に写す。

### GitHub の OAuth

- OAuth App の Web アプリケーションフロー。(`GET /api/github/token`・`GET /api/github/oauth/login`・`GET /api/github/oauth/callback`・`DELETE /api/github/token`)
- コードとトークンの交換は、サーバーで行う。トークンは、メモリにだけ持つ。
- 設定が無いときは、`configured: false` を返すだけで、ほかは変わらない。
