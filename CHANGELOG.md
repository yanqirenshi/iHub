# 更新履歴

`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` は、同じ版にそろえて出します。
変更の詳しい内容は、パッケージごとの CHANGELOG (npm のパッケージにも入っています) に書きます。

| パッケージ | 更新履歴 |
|---|---|
| `@yanqirenshi/ihub.core` | [packages/ihub.core/CHANGELOG.md](packages/ihub.core/CHANGELOG.md) |
| `@yanqirenshi/ihub.srv` | [packages/ihub.srv/CHANGELOG.md](packages/ihub.srv/CHANGELOG.md) |

版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマット・API・CLI を変えるときに、minor を上げます。

## 0.1.0 (2026-11)

iHub のコア (`src/ihub/`) と API サーバー (`server/`) を、npm のパッケージにした、最初の版です。
(切り出し・設定の形・ページのタブとパネルと Help の拡張点・GitHub の OAuth・CLI `ihub-srv`・ER のテーブルの色)

iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](docs/src/content/migrate.md) を見てください。
