# 更新履歴

`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` は、同じ版にそろえて出します。
変更の詳しい内容は、パッケージごとの CHANGELOG (npm のパッケージにも入っています) に書きます。

| パッケージ | 更新履歴 |
|---|---|
| `@yanqirenshi/ihub.core` | [packages/ihub.core/CHANGELOG.md](packages/ihub.core/CHANGELOG.md) |
| `@yanqirenshi/ihub.srv` | [packages/ihub.srv/CHANGELOG.md](packages/ihub.srv/CHANGELOG.md) |

版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマット・API・CLI を変えるときに、minor を上げます。

## 0.2.6 (2026-11)

- `@yanqirenshi/ihub.srv`: `engines` の `node` を、`>=20.12` から `>=22` にした。(docs の「Node.js 22 以上」と、そろえた。保守期間の終わった Node.js 20 を、対象から外す。動きの変更は無い)
- `@yanqirenshi/ihub.core`: コードの変更は無い。(版をそろえるだけ。README に、docs の版の表へのリンクを足した)

## 0.2.5 (2026-11)

- `@yanqirenshi/ihub.core`: 設定の `diagrams` で、ER 図・TM 図の `grid` (d3.er・d3.ter の設定) を渡せるようにした。(`diagrams: { er: { grid: { draw: false } } }` でグリッド線を消す。設定が無いときは、変わらない)
- `@yanqirenshi/ihub.srv`: `ihub-srv migrate-er` が、`column_type` が `ID` の主キーも識別子にするようにした。(これまでは `IDENTIFIER` だけ。0.2.4 以前で変換したアプリは、元のフラット形式のデータから変換し直すと、主キーが識別子になる)
- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.er` を 0.6.1 にした。(識別子が、テーブルのカラムの先頭に描かれる)

## 0.2.4 (2026-11)

- `@yanqirenshi/ihub.core`: Help の `Slide` を、`HelpSlide` として export した。(Help を書き換えるアプリが、`help.sections` で使える) 「コピー版からの移行」の手順書を、iwo.Studio の移行で分かったことに合わせて直した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.3 (2026-11)

- `@yanqirenshi/ihub.srv`: `ihub-srv migrate-er` が、カラムのインスタンスの名前 (`physical_name` など) を、落とさないようにした。名前の違うインスタンスごとに、別のマスタを作る。0.2.2 以前で変換したアプリは、元のフラット形式のデータから変換し直すと、名前が戻る。
- `@yanqirenshi/ihub.core`: 雛形の `.env.local.template` に、GitHub の OAuth の 2 つの変数の欄を足した。(コードの変更は無い。版をそろえるだけ)

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
