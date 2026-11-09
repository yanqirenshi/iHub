# iHub

アプリの設計の情報 (WBS・ER 図・TM・画面遷移図・システム構成図など) を、図や表で見て、編集して、チームで共有するための仕組みです。

- 使う人 (アプリの開発者) 向けの説明は、マニュアルサイト ([docs/](docs/)) にあります。
- このファイルは、iHub そのものを開発する人向けです。(モノレポの作り・ビルド・テスト・公開)

## パッケージ

iHub のリポジトリは、npm workspaces のモノレポです。

| フォルダ | 内容 |
|---|---|
| [packages/ihub.core](packages/ihub.core/README.md) | `@yanqirenshi/ihub.core`。画面の部品 (React)。Babel で `dist/` (ESM) に変換して配布します。 |
| [packages/ihub.srv](packages/ihub.srv/README.md) | `@yanqirenshi/ihub.srv`。API サーバー (Node.js) と、`ihub-srv` のコマンド。変換は要りません。 |
| (ルート) `src/`・`public/`・`data/` | 参照アプリ。2 つのパッケージを使う、見本のアプリです。(create-react-app) |
| [docs/](docs/README.md) | マニュアルのサイト (React + Vite)。ルートの workspaces には入っていません。 |

参照アプリは、`packages/ihub.core` の `examples/app/` (アプリの雛形) の元にもなっています。
(`npm run build -w @yanqirenshi/ihub.core` のときに、参照アプリの `src/`・`public/` から、`examples/app/src`・`examples/app/public` を作ります。git には入れません)

## 開発する

必要なもの: Node.js 22 以上 (24 で確かめています)・git

```
npm install
npm start
```

- 画面 (http://localhost:3000)・API サーバー (http://127.0.0.1:4000)・コアのビルド (watch) が、一緒に起動します。
- `npm start` の前に (`prestart`)、コアを 1 度ビルドします。起動したあとは、`packages/ihub.core/src/` を直すと、自動で `dist/` に変換されて、画面に反映されます。(`build:core:watch`)
- `packages/ihub.srv/src/` を直すと、API サーバーが再起動します。
- **`npm start` を動かしている間は、`npm run build -w @yanqirenshi/ihub.core` (フルビルド) を実行しないでください。** フルビルドは `dist/` を消して作り直すので、動いている開発サーバーが、消えたファイルを見失い、再起動するまでエラーが残ります。フルビルドが要るときは、`npm start` を止めてから実行してください。

## ビルドとテスト

| コマンド | 内容 |
|---|---|
| `npm run build` | 参照アプリをビルドします。(`prebuild` で、コアもビルドします) |
| `npm run serve` | ビルドした画面と API を、http://127.0.0.1:4000 で出します。 |
| `npm run test:data` | コアをビルドして、`data/` と雛形のデータ (`packages/ihub.core/examples/data`) を検証し (`ihub-srv check`)、`@yanqirenshi/ihub.srv` のテストを動かします。 |
| `npm test -w @yanqirenshi/ihub.srv` | `@yanqirenshi/ihub.srv` のテストだけを動かします。(`init --app` のテストは、コアがビルド済みなことが前提です) |
| `npm run build -w @yanqirenshi/ihub.core` | コアだけをビルドします。(`dist/` と、`examples/app/` を作ります) |
| `cd docs && npm install && npm run build` | マニュアルのサイトをビルドします。 |

## 公開する

2 つのパッケージを、同じ版にそろえて、npm に公開します。(版は semver。0.x の間は、設定の形や公開する部品を変えるときに minor を上げます。変更は、`CHANGELOG.md` に書きます)

1. `packages/*/package.json` の `version` を、同じ版にします。`CHANGELOG.md` に、その版の変更を書きます。
2. テストが通ることを確かめます。(`npm run test:data`・`CI=true npm run build`)
3. 中身を確かめます。

```
npm pack --dry-run -w @yanqirenshi/ihub.core
npm pack --dry-run -w @yanqirenshi/ihub.srv
```

- `@yanqirenshi/ihub.core`: `dist`・`examples`・`README.md`・`package.json` だけで、`dist/` に JSX が残っていないこと。`examples/app/src`・`examples/app/public` が入っていること。(`prepublishOnly` が、ビルドして作ります)
- `@yanqirenshi/ihub.srv`: `bin`・`src`・`README.md`・`package.json` だけ。

4. 公開します。(`prepublishOnly` で、コアがビルドされます)

```
npm publish -w @yanqirenshi/ihub.core
npm publish -w @yanqirenshi/ihub.srv
```

5. 別のフォルダで、[導入のしかた](docs/src/content/setup.md) のとおりに、公開した版を入れて、起動できることを確かめます。

## 更新履歴

[CHANGELOG.md](CHANGELOG.md) を見てください。
