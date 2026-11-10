# コピー版からの移行

iHub のリポジトリをフォルダごとコピーして使っていたアプリ (コピー版) を、パッケージ (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) を使う形に移す手順です。
新しいアプリを作るときは、[導入のしかた](#/setup) を見てください。

## 移すもの・移さないもの

コピー版では、iHub 本体が、アプリのフォルダの中に入っていました。
パッケージを使う形では、iHub 本体は `node_modules/` に入り、アプリのフォルダには、アプリのファイルだけが残ります。

| コピー版 | パッケージを使う形 |
|---|---|
| `src/ihub/` | 消す。(`@yanqirenshi/ihub.core`) |
| `server/` | 消す。(`@yanqirenshi/ihub.srv`) |
| `src/App.js`・`src/App.test.js` | 消す。(`src/index.js` が、設定を渡して、`<IHub>` を描く) |
| `src/index.js` | 設定を渡す形に書き換える。 |
| `src/Router.js`・`src/operators/`・`src/wbs/` | `import` を、`@yanqirenshi/ihub.core` に替える。 |
| `src/config/`・`src/index.css`・`public/`・`data/` | そのまま使う。 |
| `src/setupProxy.js` | そのまま使う。 |
| `package.json` の `scripts` | `ihub-srv` を使う形にする。 |
| コアの中を直していたところ (タブ・Help・OAuth など) | 設定 (`tabs`・`panels`・`help` など) に移す。 |

## 準備

1. 作業しているブランチを、commit しておきます。(戻せるようにするため)
2. iHub のどの版をコピーしたかが分かるときは、メモしておきます。(古いデータの形式のとき、下の「データを新しい形式にする」が要ります)

## 手順

### 1. コピーした iHub 本体を消す

```
git rm -r src/ihub server src/App.js src/App.test.js
```

(`src/App.test.js` が無いときは、省いてください)

### 2. 雛形のファイルを足す

```
npx --yes --package=@yanqirenshi/ihub.core --package=@yanqirenshi/ihub.srv -- ihub-srv init --app --skip-existing
```

- すでにあるファイル (`src/config/` など、自分のもの) は、そのままにして、無いものだけを作ります。(`src/js/` など)
- `package.json` に、`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` を足します。(すでにある項目は変えません)

### 3. `package.json` を直す

`scripts` を、`ihub-srv` を使う形にします。

| スクリプト | 変更前 | 変更後 |
|---|---|---|
| `start:api` | `node --watch-path=server server/index.mjs` | `ihub-srv --data data` |
| `serve` | `node server/index.mjs --static` | `ihub-srv --data data --static build` |
| `test:data` | `node --test "server/test/**/*.test.mjs"` | `ihub-srv check data` |

- 画面の設定の `app.name` を、`iHub` 以外にしたときは、`start:api` と `serve` に `--app-name <同じ名前>` を付けます。
- `test`・`eject` は、雛形の `package.json` にはありません。(残してもかまいません) 手順 1 で `src/App.test.js` を消すと、テストが 1 つも無くなるので、`npm test` は、テストが無いと言って止まります。(CRA の雛形のままの `App.test.js` は、もともと `learn react` という文字を探すだけで、動かないテストです) テストを書かないときは、`test` を消してかまいません。

`package.json` の `dependencies` と、`overrides` を直します。

**消すもの**

- iHub 本体が持つパッケージ: `@yanqirenshi/colonoscope`・`d3.deployment`・`d3.er`・`d3.sitemap`・`d3.ter`・`d3.unchi`・`menubook`・`model.*`・`react-masonry-component`・`table.wbs`・`beach`、`@splidejs/react-splide`・`@uiw/react-md-editor`・`bulma`・`react-measure`・`sogh`・`tion`、サーバーの `hono`・`@hono/node-server`・`ajv`・`ajv-i18n`
- `react-router`。(`react-router-dom` が、必要な `react-router` を持ってきます。アプリの `package.json` に `react-router` も書いていると、`react-router-dom` の中の版とずれて 2 つ入り、`/wbs/{id}` のページが空になることがあります。[困ったとき](#/troubleshooting) を見てください)
- `overrides` の、`tion` の `react-router-dom` の項目。(`tion` 0.1.3 以降では、要りません。`tion` は消すので、`overrides` ごと消します)

**残すもの**

アプリが直接使うパッケージです。(例: `@yanqirenshi/manipulater`・`@yanqirenshi/markdown.sitter`・`react`・`react-redux`・`react-router-dom`・`@mui/*`・`@emotion/*`、DFD などを足していたときの `@yanqirenshi/d3.dfd`)

上の「消すもの」に挙げたパッケージでも、**アプリの `src/` が `import` しているものは、消さずに残します。**
(iHub 本体が持っていても、アプリが直接 `import` するときは、アプリの `dependencies` に要ります。例: `src/wbs/` のページが `tion` を使う・Help のセクションが `@splidejs/react-splide` を使う)
消す前に、`src/` で `import` されていないかを、確かめてください。

```
grep -rn "from 'tion'\|from '@splidejs/react-splide'" src
```

(確かめるパッケージ名は、上の「消すもの」のそれぞれに替えます。`grep -rhoE "from '[^./'][^']*'" src | sort -u` で、`src/` が `import` しているパッケージの一覧が出ます)
残すときは、iHub 本体と同じ版の範囲にしてください。(例: `tion` は `^0.2.0`、`@splidejs/react-splide` は `^0.7.12`。範囲がずれて、2 つの版が入ると、動かなくなることがあります)

**上げるもの**

アプリで入れる、MUI・React などの版は、[導入のしかた](#/setup) の「アプリで入れるパッケージの版」の表に、合わせます。

アプリが直接使っている、iHub のパッケージ (`@yanqirenshi/manipulater` など) は、MUI を peerDependencies にした版に上げます。(`@yanqirenshi/manipulater` は `^0.1.0`) 古い版のままだと、その版が `@mui/material` 5 を持ち込んで、MUI が 2 つ入ります。

**使っていないもの**

コピー元の iHub の `package.json` から引き継いだだけで、アプリが使っていないものが残っていることがあります。(例: `@yanqirenshi/d3.gantt`・`d3.network`・`wnqi.big.size`・`react-bpmn`・`winbox`・`@fortawesome/*`・`workbox-*`・`@testing-library/*`)

- アプリの `src/` で `import` されていなければ、消してかまいません。(`grep -rn "<パッケージ名>" src` で確かめられます)
- 消すのは任意です。迷うときは、残してかまいません。(残しても、動きは変わりません。`npm install` が少し重くなるだけです)
- `workbox-*` は、雛形の `src/js/serviceWorkerRegistration.js` が使いません。(`src/` に、Workbox を使う `service-worker.js` を置いているときだけ、要ります)

```
npm install
```

`package-lock.json` は、消さずに、そのまま使ってください。(消すと、依存するパッケージの版が変わって、動かなくなることがあります)

`@mui/material` が、1 つだけ入ったことを確かめます。

```
npm ls @mui/material
```

すべての行が、同じ版 (`9.x`) で、`@mui/material@5` が出ないことを確かめてください。(5 が出るときは、それを持ち込んでいるパッケージを、上の「上げるもの」のように上げます。`npm ls @mui/material` の木に、持ち込んでいるパッケージが出ます)

### 4. `src/index.js` などを、パッケージの形にする

雛形の `src/index.js`・`src/Router.js`・`src/operators/`・`src/wbs/` で、上書きします。

```
npx ihub-srv init --app --only src/index.js --only src/Router.js --only src/operators --only src/wbs
git diff src
```

上書きするのは、コアの `import` を替えるためです。
コピー版でこれらのファイルを直していたときは、`git diff` で、自分の直したところが消えていないかを確かめて、移し直します。
(上書きすると、アプリが変えたコメントなども、雛形のものに戻ります。例: `src/Router.js` の `== iHub ==` を、アプリの名前に変えていたとき。`git diff` で見つけて、移し直してください)

**アプリが自分で書いたファイルは、上書きされません。**
`--only` が上書きするのは、雛形にあるファイルだけです。
アプリが自分で書いた `src/wbs/P{id}.js` (WBS のノードのページ) や、`src/operators/` に足したファイルは、`import` が替わらないので、手で替えます。
`src/ihub/` を指している `import` を、次のように探します。

```
grep -rn "ihub/" src
```

下の表のとおりに替えます。(同じファイルの `import` が複数あるときは、1 つの `import { ... } from '@yanqirenshi/ihub.core'` にまとめられます)

手順 2 と、この手順のあとで、`git status` に出るものは、次のとおりです。(UkiyoSnow の例)

| 状態 | ファイル | 内容 |
|---|---|---|
| 新しい (`??`) | `src/js/` (`serviceWorkerRegistration.js`・`reportWebVitals.js`) | CRA のもの。手順 2 の `--skip-existing` が作る |
| 新しい (`??`) | `src/operators/dockColor.js` | ドックの色。`import { DOCK_COLOR } from '../ihub/manegers/colors.js'` の代わり |
| 変わった (` M`) | `src/index.js`・`src/Router.js` | 設定を渡す形・`import` の替え |
| 変わった (` M`) | `src/operators/` の、コアを `import` していたもの・`src/wbs/` | `import` の替え。(`import` が無いファイルは、変わりません) |
| 変わった (` M`) | `package.json` | 手順 2・3 |

アプリに、`.gitignore`・`.env.local.template`・`public/` が無いときは、それらも新しいファイルとして出ます。
`import` の替えだけの差分なら、そのままで良いです。

`import` の替え方は、次のとおりです。(上書きせずに、手で直すときの参考にしてください)

| コピー版 | 変更後 |
|---|---|
| `import * as page from './ihub/components/pages/index.js'` | `import { pages as page } from '@yanqirenshi/ihub.core'` |
| `import * as page_docs from './ihub/components/pages/docs/index.js'` | `import { docPages as page_docs } from '@yanqirenshi/ihub.core'` |
| `import Frame from '../ihub/components/assemblies/frames/Frame.js'` | `import { Frame } from '@yanqirenshi/ihub.core'` |
| `import Frame from '../ihub/components/assemblies/frames/FrameWbsNode.js'` | `import { FrameWbsNode as Frame } from '@yanqirenshi/ihub.core'` |
| `import FrameTabs from '../ihub/components/assemblies/frames/FrameTabs.js'` (`FrameWbsNodeTabs` も同じ) | `import { FrameTabs } from '@yanqirenshi/ihub.core'` |
| `import Link from '../ihub/components/assemblies/Link.js'` | `import { Link } from '@yanqirenshi/ihub.core'` |
| `import GithubOAuth from '../ihub/components/assemblies/GithubOAuth.js'` | `import { GithubOAuth } from '@yanqirenshi/ihub.core'` |
| `import WBSTable from '../ihub/components/assemblies/WBSTable.js'` (`Account`・`AddWbsNode`・`TabbedPage`・`TableTMRelationships`・`TabsSearchParam` も同じ) | `import { WBSTable } from '@yanqirenshi/ihub.core'` |
| `import ItemWbsNode from '../ihub/components/parts/ItemWbsNode.js'` (`ErrorBoundary`・`HeadWbsPage`・`LinkInSite`・`LinkOutSite`・`LinkWBS`・`Tabs` も同じ) | `import { ItemWbsNode } from '@yanqirenshi/ihub.core'` |
| `import Wbs from '../ihub/components/panels/Wbs.js'` (`ER`・`TM`・`HelpEmpty` など、`panels/` のもの) | `import { panels } from '@yanqirenshi/ihub.core'` のあと、`panels.Wbs` |
| `import { usePageTabs } from '../ihub/hooks/usePageTabs.js'` | `import { usePageTabs } from '@yanqirenshi/ihub.core'` |
| `import { useWbs } from '../ihub/manegers/wbs.js'` | `import { useWbs } from '@yanqirenshi/ihub.core'` (`wbs` も同じ) |
| `import { errorMessage, useCollections, usePatchCollectionMutation } from '../ihub/redux/api/dataApi.js'` | `import { errorMessage, useCollections, usePatchCollectionMutation } from '@yanqirenshi/ihub.core'` |
| `import { fetchProjectsV2 } from '../ihub/redux/slices/scrumSlice.js'` | `import { fetchProjectsV2 } from '@yanqirenshi/ihub.core'` |
| `import sogh from '../ihub/manegers/sogh.js'` | `import { sogh } from '@yanqirenshi/ihub.core'` |
| `import { DOCK_COLOR } from '../ihub/manegers/colors.js'` | `src/operators/dockColor.js` (雛形にあります) を使う |

アプリの設定は、`src/index.js` の `config` に書きます。([設定の渡し方](#/customize))
コピー版では、`src/ihub/index.js` と `src/App.js` が、画面を組み立てていました。
その設定のうち、アプリのファイル (`src/config/`・`src/operators/`・`src/wbs/`) を指すものは、雛形の `src/index.js` が、すでに渡しています。

### 5. データを新しい形式にする

データが古い形式のときだけ、行います。

**ER が、フラット形式のとき** (`data/er/` に、`columns.json`・`column_instances.json`・`ports.json` があるとき)

```
npx ihub-srv migrate-er data
```

`data/er/` を、階層形式 (`identifiers.json`・`attributes.json` など) に変換します。
(`columns.json` などは、消えます。変換したデータは、検査してから書きます)

**主キー (識別子)**

フラット形式の主キーのインスタンスには、`column_type` が `IDENTIFIER` のデータと、`ID` のデータがあります。
`migrate-er` は、どちらも、識別子 (`identifiers.json`) にします。(`ihub.srv` 0.2.4 以前は、`IDENTIFIER` だけで、`ID` の主キーは、属性 (`attributes.json`) になりました)
`ihub.core` 0.2.5 以降 (`@yanqirenshi/d3.er` 0.6.1) は、識別子を、テーブルのカラムの先頭に描きます。(`IDENTIFIER` のデータは、これまで、末尾に描かれていました)
識別子か属性かは、COLUMN ごとではなく、**インスタンスごと**に決めます。主キー (`ID`・`IDENTIFIER`) のインスタンスだけが識別子で、それ以外 (外部キーなど) は属性です。
同じ COLUMN が、あるテーブルでは主キー、ほかのテーブルでは外部キーのとき (例: `user_id`) は、識別子のマスタと、属性のマスタに分かれます。(階層形式では、`identifiers[]` は識別子のマスタを、`attributes[]` は属性のマスタを指すため)
そのため、ER 図のカラムの並びは、移す前 (主キー → 属性 → タイムスタンプ → そのほか) と同じになります。
0.2.4 以前の `migrate-er` で変換したアプリは、元のフラット形式のデータ (git の履歴) から、0.2.5 以降の `migrate-er` で変換し直すと、主キーが識別子になり、先頭に描かれます。

**カラムの名前 (マスタが分かれることがあります)**

フラット形式では、カラムのインスタンス (`column_instances.json`) が、自分の `logical_name`・`physical_name`・`description` (と `data_type`) を持てました。
階層形式では、名前はマスタ (`identifiers.json`・`attributes.json`) だけが持ち、テーブルのカラムは、マスタを指すだけです。
そのため、`migrate-er` は、インスタンスの名前が、COLUMN (`columns.json`) の `name`・`code` と違うときは、名前の違うインスタンスごとに、別のマスタを作ります。

- インスタンスの名前が COLUMN と同じ (または無い) ときは、これまでどおり、COLUMN から作る 1 つのマスタを指します。
- 同じ COLUMN で、同じ名前のインスタンスは、1 つのマスタを指します。
- 同じ COLUMN を、違う名前で使っているとき (例: 同じテーブルの `synapse_id_from`・`synapse_id_to`) は、名前ごとに、マスタが分かれます。ER 図には、インスタンスごとの名前が出ます。
- 最初に現れた名前 (インスタンスの `_id` の順) のマスタが、COLUMN の `_id` を引き継ぎます。2 つ目からのマスタには、ER のデータのどの `_id` とも重ならない値を振ります。(何度変換しても、同じ結果になります)
- 変換したあとに、マスタの数 (COLUMN から作った数と、名前の違いで増えた数) を表示します。

`data/er/schemas.json` も作ります。中身は、`[]` (空) です。
これは、テーブルの名前空間 (データベースのスキーマ。例: `PUBLIC`) のマスタで、階層形式の 5 つのファイルの 1 つです。
フラット形式には、スキーマの情報が無かったので、空になります。(テーブルの `schema` は、付きません) ER 図の描画には使わないので、空のままで、困ることはありません。テーブルの名前空間を持たせたいときは、あとから足します。([データの管理](#/data))

**データが、`src/data/*.js` のとき** ([#21](https://github.com/yanqirenshi/iHub/pull/21) より前の iHub)

```
npx ihub-srv convert-legacy src/data data
```

- 書き出し先に同じ名前のファイルがあるときは、何も書かずに止まります。(上書きするときは `--force` を付けます)
- `src/data/` の `ACCOUNT_MENUS.js`・`ICONS.js`・`OPERATOR_ITEMS.js` は変換しません。`src/config/` に移します。
- 変換が済んだら、`src/data/` を消します。

どちらのときも、変換したあとに、フォーマットを確かめます。

```
npx ihub-srv check data
```

**コレクションのファイルが無いとき** (データの形式が古くなくても、確かめます)

コピーした時期より後に、iHub に増えたコレクション (例: `data/overview/`。コックピットの Overview タブのデータ) のファイルが、コピー版の `data/` に無いと、`npx ihub-srv check data` が、次のように止まります。

```
NG: data (2 件)
  overview/edges: ファイルがありません。
  overview/nodes: ファイルがありません。
```

足りないファイルを、足します。次のどちらでもかまいません。

- 雛形 (`@yanqirenshi/ihub.core` の `examples/data/`。`node_modules/@yanqirenshi/ihub.core/examples/data/`) から、同じ名前のファイルを写す。(サンプルのデータが入っています。アプリに合わせて、書き換えます)
- 空 (`[]`) のファイルを作る。(図が空になるだけで、動きます)

```
mkdir -p data/overview
echo "[]" > data/overview/nodes.json
echo "[]" > data/overview/edges.json
```

足したら、もう一度 `npx ihub-srv check data` で確かめます。

**変換で、なくなるもの**

`ihub.srv` 0.2.2 以前の `migrate-er` で変換したアプリは、カラムのインスタンスの `physical_name`・`description` が、COLUMN の `code`・`description` に替わっています。(0.2.3 で直りました)
元のフラット形式のデータ (git の履歴にあります) から、`@yanqirenshi/ihub.srv` 0.2.3 以降の `migrate-er` で変換し直すと、名前が戻ります。

`migrate-er` は、フラット形式の項目のうち、階層形式に写し先が決まっていないもの (コピー版で、アプリが足した項目) も、そのまま ER のテーブル (`er/entities.json`) とカラム (`identifiers.json`・`attributes.json`) に写します。
データとしては、失われません。

- ER のテーブルの `color` (`{ base, inner }`。テーブルの色) は、iHub 本体の項目です。写したあと、ER 図に、その色で描かれます。(インスペクタでも書き換えられます。[図の編集](#/diagrams))
- iHub 本体が知らない項目 (アプリが足した、ほかの項目) は、データには残りますが、図には出ません。
- フォーマット (スキーマ) に合わない値が写ったときは、`ihub-srv check data` が、その場所を教えます。

`git diff data` で、変換の前後のデータを比べて、確かめてください。
(コピー版で、`server/schemas/` を直して、項目を足していたときは、その項目が、iHub 本体のスキーマに合うかも、確かめてください)

### 6. コアの中を直していたところを、設定に移す

コピー版では、アプリが、`src/ihub/` の中を直して、機能を足していることがあります。
これらは、`src/ihub/` を消すと、無くなります。
iHub 本体の差し替え口 (設定) に移します。

まず、手順 1 で消す前の `src/ihub/` と、コピー元の iHub を比べて、直したところを探します。

1. iHub のリポジトリを、別のフォルダに `git clone` します。
2. コピーしたころの commit に、`git checkout` します。(分からないときは、`src/ihub/` との差がいちばん小さい commit を探します)
3. 比べます。

```
diff -r <iHub の clone>/src/ihub <アプリ>/src/ihub
```

(手順 1 で消したあとでも、`git show HEAD:src/ihub/<ファイル>` で、消す前のファイルを見られます)

| 直していたところ | 移し方 |
|---|---|
| ページにタブを足していた (`hooks/usePageTabs.js` の `TAB_DEFS`・`pages/*.js`) | 設定の `tabs` と `panels` |
| ページの WBS の `start_id` を変えていた (`pages/*.js`) | 設定の `panels` (下の例) |
| 設計のページの 4 つのパネルの `start_id` を変えていた (`panels/design/*.js`) | 設定の `panels` で、`panels.DesignPanels` などに `start_id` を渡す (下の例。0.2.2 以降) |
| Help を書き換えていた (`pages/Help/Section*.js`) | 設定の `help.sections` (下の例。0.2.4 以降は、`Slide` を `HelpSlide` で使える) |
| GitHub の OAuth を足していた (`server/github.mjs` など) | 不要。(iHub 本体に入っています。[GitHub との連携](#/github)) |
| サーバーに、アプリ固有のコレクションを足していた (`server/schemas/`・`validation/rules.mjs`) | `createApp` の `extensions` ([API サーバー](#/api)) |
| ER のテーブルの色分けを、描いたあとに塗り直していた (`panels/ER.js` の `paintTableColors` など)。`server/schemas/er/entities.schema.json` に `color` を足していた | 不要。(iHub 本体が、テーブルの `color` (`{ base, inner }`) で描くようになりました。スキーマにも入っています。手順 5 の `migrate-er` が、`color` をそのまま写します) |
| ER 図・TM 図のグリッド線を消していた (`panels/ER.js`・`TM.js` で、`new Rectum({ ... })` に `grid: { draw: false }` を渡していた) | 設定の `diagrams` (`diagrams: { er: { grid: { draw: false } }, tm: { grid: { draw: false } } }`。0.2.5 以降。[カスタマイズ](#/customize) の「図のグリッド線を消す」) |
| コピー版の `server/index.mjs` の、起動のログに、アプリの名前を入れていた (例: `bokasafn の API サーバーを起動しました`) | 移せない。(`ihub-srv` の起動のログは、iHub の表記のままで、変えられません。動きには関係しません。画面の名前 (`app.name`) と、書き込んだ画面の id を送るヘッダー (`--app-name`) は、別です) |
| 図の描き方など、部品の中を直していた | 設定の差し替え口が無いので、iHub のリポジトリに Issue を立てます。それまでは、そのパネルを、アプリで書いて、`panels` で差し替えます |

**iHub 本体が取り込んだので、移さなくてよいもの**

コピーした時期より後に、iHub 本体が取り込んだものがあります。
差に見えても、次のものは、移さずに、そのままで良いです。

- 上の表の、GitHub の OAuth と、ER のテーブルの色分け・`color`
- `server/schemas/` の差のうち、iHub 本体のスキーマに入ったもの。(`ihub-srv check data` が通れば、合っています。通らないときは、メッセージの場所を直すか、`createApp` の `extensions` で、アプリのスキーマを足します)
- ページを移ったあとの、サイドメニューの名前の表示。(コピー版では、ページを開き直さないと変わらないことがありましたが、いまは、開いているページの名前になります)

**例: DFD のタブを足していたとき**

コピー版では、`src/ihub/components/panels/Dfd.js` を足し、`pages/Batchs.js` と `hooks/usePageTabs.js` を直して、Batchs のページの先頭に DFD のタブを足していました。

1. `Dfd.js` を、アプリの `src/components/panels/Dfd.js` に移します。(`@yanqirenshi/d3.dfd` は、アプリの `dependencies` に残します)
2. `src/index.js` の設定に、タブとパネルを足します。

```jsx
import Dfd from './components/panels/Dfd.js';

const config = {
    // (省略)
    tabs: {
        PAGE_BATCHS: {
            selected: 'dfd',                                   // 初めに DFD を開く
            list: [
                { code: 'wbs',  hidden: true },                // 足したタブは末尾に付くので、
                { code: 'help', hidden: true },                // WBS と Help を、いったん消して、
                { code: 'dfd',  label: 'DFD' },                // DFD を足してから、
                { code: 'wbs',  label: 'WBS' },                // 足し直して、先頭に出す
                { code: 'help', label: 'Help' },
            ],
        },
    },
    panels: { PAGE_BATCHS: { dfd: Dfd } },
};
```

(DFD のタブが末尾でよいときは、`tabs` は `PAGE_BATCHS: { list: [{ code: 'dfd', label: 'DFD' }] }` だけで足ります)

**例: WBS のタブの `start_id` を変えていたとき**

コピー版では、`pages/Data.js` などの `<Wbs/>` に、`start_id={1003}` を付けていました。
パネルの部品を作って、`panels` で差し替えます。

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// 部品は、描画のたびに作り直さないように、モジュールの中で 1 度だけ作る。
const WbsFrom1003 = ()=> <panels.Wbs start_id={1003}/>;

const config = {
    // (省略)
    panels: { PAGE_DATA: { wbs: WbsFrom1003 } },
};
```

**例: 設計のページの 4 つのパネルの `start_id` を変えていたとき** (`@yanqirenshi/ihub.core` 0.2.2 以降)

コピー版では、`panels/design/Panels.js`・`Assemblies.js`・`Parts.js`・`Events.js` の `<WBSTable start_id="1"/>` を、タブごとに書き換えていました。
4 つのパネルは、`start_id` を受け取れます。(無いときは、`"1"`) `panels.DesignPanels`・`DesignAssemblies`・`DesignParts`・`DesignEvents` に、`start_id` を渡して、差し替えます。

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// 部品は、描画のたびに作り直さないように、モジュールの中で 1 度だけ作る。
const withStartId = (Panel, start_id)=> function DesignWbs () { return <Panel start_id={start_id}/>; };

const config = {
    // (省略)
    panels: {
        PAGE_DESIGN: {
            'ui-panels':     withStartId(panels.DesignPanels,     '1007'),
            'ui-assemblies': withStartId(panels.DesignAssemblies, '1008'),
            'ui-parts':      withStartId(panels.DesignParts,      '1009'),
            'ui-events':     withStartId(panels.DesignEvents,     '1010'),
        },
    },
};
```

(0.2.1 以前では、`WBSTable` を使って、パネルの並び (`Box`・`Container`) を、アプリで写して、差し替えます)

**例: Help を書き換えていたとき** (`@yanqirenshi/ihub.core` 0.2.4 以降)

コピー版では、`src/ihub/components/pages/Help/Section01.js`〜`Section03.js` の中身を書き換えていました。
iHub の既定の Help (3 つのセクション) を書き換えるときは、セクションを、アプリに写して、`help.sections` で渡します。

1. コピー版の `Section01.js`〜 (`git show HEAD:src/ihub/components/pages/Help/Section01.js` で、手順 1 で消す前のファイルを見られます) を、アプリの `src/components/help/` に写します。
2. セクションが使う `Slide` (`import Slide from './Slide.js'`) は、写さずに、`@yanqirenshi/ihub.core` の `HelpSlide` に替えます。
3. セクションが使う `@splidejs/react-splide` は、アプリの `dependencies` に残します。(手順 3 の「残すもの」)
4. `src/index.js` の設定で、`help.sections` に渡します。

```jsx
// src/components/help/Section01.js
import { Splide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { HelpSlide } from '@yanqirenshi/ihub.core';   // コピー版の import Slide from './Slide.js' の代わり

export default function Section01 (props) {
    const size = props.size;

    return (
        <Splide options={ { rewind: true } } aria-label="Help">
          <HelpSlide size={size}>
            {/* 書き換えた内容 */}
          </HelpSlide>
        </Splide>
    );
}
```

```jsx
// src/index.js
import Section01 from './components/help/Section01.js';

const config = {
    // (省略)
    help: { sections: [Section01] },
};
```

(0.2.3 以前では、`Slide.js` もアプリに写します)

ページの id (`PAGE_DATA` など) の一覧は、`@yanqirenshi/ihub.core` の README にあります。

**例: アプリの `docs/` (iHub のマニュアルのコピー) があるとき**

コピー版のアプリは、iHub のマニュアルを、アプリの `docs/` にコピーして、持っていることがあります。
(コピー版の前提 (フォルダごとコピーする・`src/ihub/` を直す・`server/`) が書かれています)
次のどちらかで、直します。どちらでもかまいません。

- iHub のマニュアル ([docs/src/content](https://github.com/yanqirenshi/iHub/tree/main/docs/src/content)) へのリンクに替える。(アプリの `docs/` は、アプリ固有の説明だけにする)
- アプリの説明に書き直す。(「iHub を、npm のパッケージで使っているアプリ」として、`about`・`setup`・`structure`・`update` などを書き直し、ほかのページは、`src/ihub/`・`server/` を指している行を直す) 見つけ方は、`grep -rn "src/ihub\|server/\|コピー" docs/src`

### 7. 動きを確かめる

```
npm start
```

- 画面が開き、サイドメニュー・ドック・図・WBS が、コピー版のときと同じように出る。
- 足していたタブ (DFD など) が出る。
- 図をドラッグして保存できる。
- `npm run build` が通る。

**移す前の画面と、比べるとき**

コピー版が古く、タブの選択を URL (`?tab=`) に持たないとき (コピー版の `hooks/usePageTabs.js` が無く、タブの選択を、画面の中の状態に持つ古い版) は、`/data?tab=wbs` のように URL でタブを指定して比べられません。
コピー版 (移す前) は、各ページを開いて、**タブを 1 つずつ押して**、比べてください。(移したあとは、`?tab=` の URL でも、タブを押しても、同じです) 比べるものは、画面の文字・図の見た目です。

**移す前と、同じにならないところ**

コピーした時期より後の、iHub 本体の更新で、見た目が変わるところがあります。
(アプリの直し間違いではありません)

- WBS の表: 見出しの表記 (`WP COLUMNS` → `Wp Columns`) と、表の上のツールバー (検索・列・ダウンロード) が、新しくなります。(`@yanqirenshi/table.wbs` 0.0.22。iHub の #63・#64) 表の中身は、同じです。
- サイドメニューの名前の表示が、開いているページの名前になります。(コピー版は、ページを開き直さないと変わらないことがありました)
- ER のテーブルの `color` で、図の色が描かれます。(コピー版でテーブルの色を塗り直していたとき)
- 本文の文字の色が、黒 (`rgb(0, 0, 0)`) から、`rgb(74, 74, 74)` (`#4a4a4a`) になります。(`<IHub>` が bulma を読み込み、bulma の `body { color: #4a4a4a }` が効くため。コピー版は、`body` の文字の色を決めていませんでした) 黒のままにしたいときは、アプリの `src/index.css` で上書きします。(`src/index.css` は、iHub の CSS のあとに読み込まれます)

```css
body { color: #000; }
```

移す前と後を比べるときは、これらの違いを除いて、同じになることを確かめてください。
(例: 同じ手順で、全ページを開いて、画面の文字を比べます。WBS の表の見出しは、`Wp Columns` を `WP COLUMNS` に戻して比べると、一致します)

## 移したあと

- `package.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、同じ版にそろえて、`package-lock.json` と一緒に commit します。
- iHub が新しくなったときは、[iHub の更新](#/update) のとおり、`npm update` で済みます。
- `README` などに「iHub をコピーして更新する」と書いていたときは、書き直します。
