# 更新履歴

`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` は、同じ版にそろえて出します。
変更の詳しい内容は、パッケージごとの CHANGELOG (npm のパッケージにも入っています) に書きます。

| パッケージ | 更新履歴 |
|---|---|
| `@yanqirenshi/ihub.core` | [packages/ihub.core/CHANGELOG.md](packages/ihub.core/CHANGELOG.md) |
| `@yanqirenshi/ihub.srv` | [packages/ihub.srv/CHANGELOG.md](packages/ihub.srv/CHANGELOG.md) |

版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマット・API・CLI を変えるときに、minor を上げます。

## 0.2.2 (2026-11)

- `@yanqirenshi/ihub.core`: 設計のページの 4 つのパネルが、`start_id` を受け取れるようにし、`panels` から export した。(`panels.DesignPanels` など。設定なしでは、変わらない)
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.1 (2026-11)

- `@yanqirenshi/ihub.core`: 「リストの key が無い」警告 (`SystemicDesign`・BPMN のパレット) を、なくした。(画面の見た目と動きは、変わらない)
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.0 (2026-11)

- `@yanqirenshi/ihub.core`: React 19 に対応した。(peerDependencies は `^18.3.1 || ^19.0.0`。React 18 のままでも動く) `tion`・`menubook`・`manipulater`・`sogh` を、MUI を peerDependencies にした版に上げて、`@mui/material` の重複 (MUI 5) をなくした。最初の `npx ... init --app` の `--legacy-peer-deps` は、要らなくなった。peerDependencies から `react-router` を消した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.1.1 (2026-11)

- `@yanqirenshi/ihub.core`: `tion` を 0.1.3 以降にして、アプリの `package.json` の `overrides` を要らなくした。(最初の `npx ... init --app` の `--legacy-peer-deps` は、まだ要る)雛形から `overrides` を消した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.1.0 (2026-11)

iHub のコア (`src/ihub/`) と API サーバー (`server/`) を、npm のパッケージにした、最初の版です。
(切り出し・設定の形・ページのタブとパネルと Help の拡張点・GitHub の OAuth・CLI `ihub-srv`・ER のテーブルの色)

iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](docs/src/content/migrate.md) を見てください。
