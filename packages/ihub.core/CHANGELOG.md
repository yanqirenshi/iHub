# 更新履歴 (@yanqirenshi/ihub.core)

`@yanqirenshi/ihub.srv` と同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマットを変えるときに、minor を上げます。
(リポジトリ全体の更新履歴は、[ルートの CHANGELOG.md](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) にあります)

## 0.2.2 (2026-11)

### 追加

- 設計のページ (`PAGE_DESIGN`) の 4 つのパネル (`ui-panels`・`ui-assemblies`・`ui-parts`・`ui-events`) が、`start_id` (この id のノードから下だけの WBS を出す) を、props で受け取れるようにした。(無いときは、これまでと同じ `"1"`。設定なしの設計のページは、変わらない)
- その 4 つのパネルを、`panels` から export した。(`panels.DesignPanels`・`panels.DesignAssemblies`・`panels.DesignParts`・`panels.DesignEvents`)
  - 設定の `panels.PAGE_DESIGN` で、`start_id` を渡して差し替えられる。(これまでは、アプリで、`WBSTable` を使って、パネルの並びを写す必要があった) 書き方は、[カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) と [コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) の手順 6

## 0.2.1 (2026-11)

### 修正

- 「リストの key が無い」警告 (`Each child in a list should have a unique "key" prop.`) を、なくした。(画面の見た目と動きは、変わらない)
  - `SystemicDesign` (システミックデザインのページ): セクションに、`label` の `key` を付けた。
  - BPMN のパレット レベル 1 (`Level1`): 表の行に `name`、画像にファイル名の `key` を付けた。
  - BPMN のパレット レベル 2 (`Level2Table`): 見出しのセルに、添字の `key` を付けた。(見出しの定義に、一意な値が無いため)

## 0.2.0 (2026-11)

React 19 に対応し、MUI 5 の重複をなくしました。

### 利用側への影響

- peerDependencies の `react`・`react-dom` を、`^18.3.1 || ^19.0.0` にした。(これまでは `^18.3.1`) **React 18 のままでも、動きます。** React 19 に上げるときは、アプリの `package.json` の `react`・`react-dom` を `^19.0.0` にして、`npm install` する。(`@testing-library/react` を使っているときは、16 以上)
- `tion` (0.2.0)・`@yanqirenshi/menubook` (0.1.0)・`@yanqirenshi/manipulater` (0.1.0)・`sogh` (0.3.0) を、MUI と Emotion を peerDependencies にした版に上げた。これで、`@mui/material` は、アプリの 1 つだけになる。(これまでは、これらが MUI 5 を持ち込んでいたため、MUI 9 のアプリには、MUI 5 も入っていた。`@mui/lab`・`@mui/x-date-pickers` も入らなくなった)
- 最初の `npx ... ihub-srv init --app` に、`--legacy-peer-deps` が要らなくなった。(0.1.x では、`react` が 19 に解決されて、`ERESOLVE` になっていた)
- peerDependencies から `react-router` を消した。(`react-router-dom` が、必要な `react-router` を持ってくる。`react-router` と `react-router-dom` の版がずれて、2 つ入ると、`useParams` が、別のルーターを見て、`/wbs/{id}` のページが空になるため) アプリの `package.json` に `react-router` を書いているときは、消す。
- `@uiw/react-md-editor` を、`dependencies` から消した。(`sogh` 0.3.0 が、自分の `dependencies` に持つようになった)

### 修正

- `FrameWbsNode` が、`react-router` から `useParams` を読んでいたのを、`react-router-dom` からに直した。(ほかの部品と同じ。`react-router` が、`react-router-dom` と別の版で入っていると、`/wbs/{id}` のページが空になった)
- `examples/wbs/P1033.js` も、`react-router` から読んでいた `useParams` を、`react-router-dom` からに直した。(`examples/wbs/` を `src/wbs/` にコピーして使うと、アプリから `react-router` を外したあと、ビルドが止まるため)

### 雛形

- `examples/app/package.template.json` を、React 19 にした。(`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` は `^0.2.0`、`@yanqirenshi/manipulater` は `^0.1.0`。`react-router` は無くした)

### 動作を確かめた

- React 19.3.1・MUI 9: iHub の参照アプリの全ページ (5 つの図・WBS・Scrum・Help・Account・ドック・サイドメニュー)。`peer` を持たない依存 (`react-measure`・`@splidejs/react-splide`・`@fortawesome/react-fontawesome`・`@yanqirenshi/markdown.sitter`・`@yanqirenshi/beach`・`react-bpmn`・`winbox`) も、動いた。
- React 18 のままの動作は、0.1.x と同じ (コードの変更は、`FrameWbsNode` の import だけ)。

## 0.1.1 (2026-11)

- `tion` を 0.1.3 以降 (`^0.1.3`) にした。`tion` 0.1.3 は、peerDependencies の `react-router-dom` を `^6.0.0 || ^7.0.0` に広げた版で、`react-router-dom` の 7 を使うアプリでも、`overrides` が要らなくなった。(最初の `npx ... ihub-srv init --app` の `--legacy-peer-deps` は、`npx` の一時的な入れ先で `react` が 19 に解決されるため、まだ要る。`package.json` ができたあとの `npm install` には要らない)
- 雛形 (`examples/app/package.template.json`) から、`overrides` を消した。(0.1.0 の雛形で作った `package.json` に、`overrides` が残っていても、害は無い)
- コードの変更は無い。

## 0.1.0 (2026-11)

iHub のコア (`src/ihub/`) を、npm のパッケージにした、最初の版です。
iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) を見てください。

### 切り出し

- `src/ihub/` を、パッケージにした。Babel で変換した ESM を `dist/` に入れて配布する。(`type: module` は付けていない。CRA の webpack で、CommonJS のパッケージの既定の import が壊れるため)
- 公開する名前: `IHub`・`createStore`・`ConfigProvider`・`useConfig`・`resolveConfig`・`pages`・`docPages`・`panels`・`Frame` などの中間の部品・`ItemWbsNode` などの小さな部品・`usePageTabs`・`manegers`・`wbs`・`useWbs`・`sogh`・`dataApi` のフック・`fetchRepositories`・`fetchProjectsV2`。
- 雛形を入れた。(`examples/data`・`examples/wbs`・`examples/app`。`ihub-srv init` / `init --app` がコピーする)

### 設定の形

- アプリは、設定 (`config`) を組み立てて、`<IHub config={config}>` に渡す。コアは、アプリのファイルを import しない。
- 設定の項目: `app`・`menus` (必須)・`menuColors`・`colors`・`operators` (必須)・`wbs` (必須)・`tabs`・`panels`・`help`・`github`。
- 書き込んだ画面の id を送るヘッダー名は、`app.name` から作る。(`X-{app.name}-Client`)
- bulma と `index.css` は、`<IHub>` が読む。アプリの `index.css` は、`<IHub>` の import より後に読む。

### 拡張点

- ページのタブとパネルを、設定の `tabs`・`panels` で、足す・差し替える・消せる。`TabbedPage` を公開した。
- Help の内容を、設定の `help.sections` で差し替えられる。

### ER 図

- ER のテーブルの色 (`color: { base, inner }`) に対応した。(`@yanqirenshi/model.er` 0.2.0・`@yanqirenshi/d3.er` 0.6.0)
  `er/entities.json` に書くと、その色で描かれる。インスペクタ (テーブルの見出しを右クリック) の「背景色 (外枠)」「背景色 (内側)」で書き換えられる。書いていないときは、既定の色。

### GitHub の OAuth

- OAuth のトークン (API サーバーが持つ) を先に使い、無ければ個人用アクセストークン (`github.token`) を使う。
- `GithubOAuth` (認証・切断のボタンと状態) を、Scrum のページの Account タブに出す。公開もしている。
