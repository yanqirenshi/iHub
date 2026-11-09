# 導入のしかた

アプリのリポジトリに、iHub のドキュメントサイトを作って、起動するまでの手順です。
(iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](#/migrate) を見てください)

## 必要なもの

- Node.js (22 以上。24 で動作を確かめています)
- git
- GitHub の個人用アクセストークン、または OAuth App (GitHub と連携する画面を使うとき)

## 1. フォルダを作って、雛形を作る

ドキュメントサイト用のフォルダ (例: `docs/`) を作り、そこで次のコマンドを実行します。

```
mkdir docs
cd docs
npx --yes --package=@yanqirenshi/ihub.core --package=@yanqirenshi/ihub.srv -- ihub-srv init --app
```

アプリのファイルの雛形ができます。

| ファイル・フォルダ | 内容 |
|---|---|
| `package.json` | 2 つのパッケージと、必要なパッケージ・`scripts`。(すでにあるときは、足りない項目だけを足します) |
| `src/index.js` | 入り口。アプリの設定を組み立てて、iHub に渡します。([設定の渡し方](#/customize)) |
| `src/Router.js` | ページの URL |
| `src/config/` | サイドメニューの項目・色・アイコン・アプリの配色・ドックのボタン |
| `src/operators/` | ドックの吹き出しの中身 |
| `src/wbs/` | WBS のノードのページ。(ページが無いときの表示の 2 つが入っています) |
| `src/setupProxy.js` | 開発サーバーから API サーバーへの中継 |
| `src/index.css` | 見た目の上書き |
| `src/js/` | service worker の登録 (`serviceWorkerRegistration.js`) と、reportWebVitals (`reportWebVitals.js`)。CRA のものです |
| `public/` | 画像など |
| `.gitignore`・`.env.local.template` | git で共有しないもの・環境変数の雛形 |

- 雛形の `package.json` は、React 19 を使います。(React 18 のままにするときは、`package.json` の `react`・`react-dom` を `^18.3.1` にします。iHub は、どちらでも動きます)
- 同じ名前のファイルがあるときは、何も書かずに止まります。(`--force` で上書き、`--skip-existing` で、無いものだけを作ります)

## 2. パッケージを入れる

```
npm install
```

## 3. データを用意する

`data/` は、アプリの設計のデータを入れるフォルダです。
雛形 (サンプルのデータ) から作ると、フォーマットに合ったサンプルから書き換えていけます。

```
npx ihub-srv init
```

`data/` に、雛形がコピーされます。
(`npx ihub-srv init <フォルダ>` で、別のフォルダに作れます)
データのフォーマットは、[データの管理](#/data) を見てください。

## 4. 起動する

```
npm start
```

- 画面 (React の開発サーバー) と API サーバーが、一緒に起動します。
- 画面は http://localhost:3000 で開きます。(ブラウザが自動で開きます)
- API サーバーは http://127.0.0.1:4000 で動きます。
- 止めるときは、`Ctrl + C` を押します。

iHub のリポジトリの参照アプリと、同じ画面が開きます。

## 5. GitHub に接続する (GitHub と連携するとき)

コックピット・Scrum のページ・ドックの「Issue の追加」は、GitHub の情報を使います。
使うときは、`.env.local.template` をコピーして `.env.local` を作り、GitHub の個人用アクセストークンを書きます。
(OAuth で認証するときは、テンプレートの `GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET` に、OAuth App の値を書きます。[GitHub との連携](#/github) を見てください)

```
REACT_APP_GITHU_PARSONAL_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

- トークンには、`repo`・`project`・`read:org` の権限を付けてください。
- `.env.local` は git で共有しません。(`.gitignore` の対象です)
- 変数の名前は綴りが少し変わっていますが (`GITHU`・`PARSONAL`)、このままの名前で書きます。
- 書いたあとは、`npm start` をやり直してください。

OAuth で認証する方法は、[GitHub との連携](#/github) を見てください。
GitHub と連携しないときは、この手順は飛ばしてかまいません。

## 6. git で共有する

`data/` を書き換えたら、アプリのリポジトリに commit・push して、チームで共有します。
ほかの人は、pull して `npm install`・`npm start` すれば、同じ内容を見られます。

画面に出る名前の変え方は、[カスタマイズ](#/customize) の「アプリの名前を出す」を見てください。
