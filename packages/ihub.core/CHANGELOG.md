# 更新履歴 (@yanqirenshi/ihub.core)

`@yanqirenshi/ihub.srv` と同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマットを変えるときに、minor を上げます。
(リポジトリ全体の更新履歴は、[ルートの CHANGELOG.md](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) にあります)

## 0.2.7 (2026-11)

### 追加

- 図の位置と拡大を、ブラウザ (`localStorage`) に自動で覚えて、次に開いたときに戻すようにした。(yanqirenshi/iHub#115)
  - 対象は、ER 図・TM・画面遷移図・システム構成図・Overview の 5 つ。図ごとに別々に覚える。
  - 人ごと・ブラウザごとの記憶で、`data/` は変わらない。鍵は `ihub:{app.name}:view:{図の code}`。(図の code: `er`・`tm`・`std`・`scd`・`overview`。開発中は、どのアプリも `localhost:3000` で開くので、アプリの名前で分けた)
  - 操作が終わったとき (ホイールを止めたとき・ドラッグを離したとき) に覚える。覚えたものが無いとき (初めて開くとき) は、これまでと同じ初めの位置。
  - 覚えた値が壊れているとき・`localStorage` が使えないときは、何も言わずに初めの位置で開く。
  - ほかのタブ・エディタ・git でデータが変わって図を描き直したときは、**初めの位置に戻らず**、覚えた位置で描き直す。(0.2.6 までは、初めの位置に戻った)
  - Overview の、描き直すときに svg の `__zoom` を読んで位置を引き継ぐ処理は、この仕組みに置き換えた。
- `useDiagramView(code)` を export した。アプリが足したパネルの図 (d3.* の `Rectum`) でも、同じように覚えられる。(`const bindView = useDiagramView('dfd'); bindView(rectum);`)

### 変更

- `dependencies` に `@yanqirenshi/assh0le` の `^0.5.9` を足した。(カメラを取り出して戻す `view`・`onViewChange` を持つ版。`package-lock.json` が古いアプリでも、assh0le 0.5.9・d3.svg 0.4.2 以上になる)
- 確かめた: 5 つの図それぞれで、動かして拡大 → ページを読み直す → 同じ位置と拡大で開いた。ほかのタブに移って戻る・ノードのドラッグ・ほかからの変更・インスペクタでの変更 (Overview) の描き直しのあとも、位置は変わらなかった。覚えたものが無いときは、これまでと同じ初めの位置。`app.name` を変えると、位置は混ざらなかった。壊れた値や、`localStorage` が使えないときも、図は出た。

## 0.2.6 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.srv` 0.2.6 と、版をそろえるだけ)
- README の peerDependencies の一覧に、マニュアルの「導入のしかた」の「アプリで入れるパッケージの版」の表へのリンクと、「Node.js は 22 以上」を足した。(`ihub.srv` の `engines` を `>=22` にしたことに合わせた)

## 0.2.5 (2026-11)

### 追加

- 設定に `diagrams` を足した。ER 図・TM 図が、設定の `diagrams.er.grid`・`diagrams.tm.grid` を、d3.er・d3.ter の `new Rectum({ ... })` の `grid` に、そのまま渡す。(例: `diagrams: { er: { grid: { draw: false } }, tm: { grid: { draw: false } } }` でグリッド線を消す。`size`・`span` も、d3 の `grid` の設定として渡せる) ER 図・TM 図は、別々に設定できる。
  - 設定が無いときは、いままでどおり、`grid` を渡さない。(グリッド線が出る)
  - コピー版で、`panels/ER.js`・`TM.js` に `grid: { draw: false }` を足してグリッド線を消していたアプリ (Bokasafn など) が、パネルを差し替えずに移せる。([コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) の手順 6 の表)
  - 書き方は、[カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) の「図のグリッド線を消す」と、この README の「図のグリッド線を消す」

### 変更

- `@yanqirenshi/d3.er` を `^0.6.1` にした。(識別子 (階層形式の `identifiers[]`) が、テーブルのカラムの先頭に描かれる。0.6.0 までは、末尾に描かれていた) `ihub-srv migrate-er` が、`column_type` が `ID` の主キーも識別子にするようになった (`@yanqirenshi/ihub.srv` 0.2.5) ので、変換し直したデータでは、主キーが先頭に描かれる。
  - **利用側への影響**: すでに階層形式のデータ (`IDENTIFIER` の識別子を持つ。例: UkiyoSnow) では、識別子が、末尾から先頭に移る。(データの変更は要らない)

## 0.2.4 (2026-11)

### 追加

- Help の 1 枚のスライド (`components/pages/Help/Slide.js`) を、`HelpSlide` として export した。(`import { HelpSlide } from '@yanqirenshi/ihub.core'`) Help を書き換えるアプリが、`help.sections` のセクションで、コアの内部のファイルをアプリに写さずに使える。(既定の Help は、変わらない) 書き方は、[カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) と、[コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) の手順 6 の「Help を書き換えていたとき」

### 手順書

- [コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) を、iwo.Studio の移行で分かったことに合わせて直した。(iHub#103)
  - 手順 3: 「消すもの」でも、アプリの `src/` が `import` しているもの (`tion`・`@splidejs/react-splide` など) は残す
  - 手順 4: `import` の替え方の表に、`Link`・`GithubOAuth`・`FrameTabs`・`WBSTable`・`parts` のもの・`panels` のもの・`usePageTabs`・`useWbs` を足した。アプリが自分で書いた `src/wbs/P*.js` は、`--only` では替わらず、手で替える。上書きで、アプリが変えたコメントが戻ること
  - 手順 6: Help を `help.sections` に移す例と、アプリの `docs/` (iHub のマニュアルのコピー) の直し方
  - 手順 7: コピーした時期より後の更新で、見た目が変わるところ (WBS の表など)

## 0.2.3 (2026-11)

`ihub-srv migrate-er` (`@yanqirenshi/ihub.srv`) の修正に合わせて、版をそろえた。コードの変更は、雛形だけ。(`migrate-er` の変更は、[ihub.srv の CHANGELOG](https://github.com/yanqirenshi/iHub/blob/main/packages/ihub.srv/CHANGELOG.md))

### 修正

- 雛形の `.env.local.template` (`ihub-srv init --app` が作る) に、GitHub の OAuth の 2 つの変数 (`GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET`) の欄を足した。(OAuth で認証するときだけ要る。これまでは、docs の「GitHub との連携」にだけ書かれていた)

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
