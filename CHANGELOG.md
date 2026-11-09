# 更新履歴

`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` の更新履歴です。
2 つのパッケージは、同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマットを変えるときに、minor を上げます。

## 0.1.0 (公開前)

iHub のコア (`src/ihub/`) と API サーバー (`server/`) を、npm のパッケージにした、最初の版です。
iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](docs/src/content/migrate.md) を見てください。

### `@yanqirenshi/ihub.core`

- 画面の部品を、パッケージにした。アプリは、設定 (`config`) を組み立てて `<IHub config={config}>` に渡す。(`menus`・`menuColors`・`colors`・`operators`・`wbs`・`app`・`tabs`・`panels`・`help`・`github`)
- ページのタブとパネルを、設定 (`tabs`・`panels`) で、足す・差し替える・消せるようにした。`TabbedPage` を公開した。
- Help の内容を、設定 (`help.sections`) で差し替えられるようにした。
- GitHub の OAuth (認証・切断) に対応した。(`GithubOAuth`。API サーバーの設定が要る)
- 雛形 (`examples/data`・`examples/wbs`・`examples/app`) を、パッケージに入れた。

### `@yanqirenshi/ihub.srv`

- API サーバーを、パッケージにした。`createApp`・`serve`・`validateData`・`validateDataDir`・`COLLECTIONS` を公開した。
- `createApp` に、`app_name`・`extensions` (`schemas_dir`・`rules`・`routes`)・`github` を足した。
- CLI `ihub-srv` を足した。(起動・`check`・`init`・`init --app`・`convert-legacy`・`migrate-er`)
- GitHub の OAuth (OAuth App の Web アプリケーションフロー) を足した。(任意。環境変数か `createApp` の `github` で有効になる)
