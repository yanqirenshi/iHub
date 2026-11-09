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
npx --yes --legacy-peer-deps --package=@yanqirenshi/ihub.core --package=@yanqirenshi/ihub.srv -- ihub-srv init --app --skip-existing
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
- `overrides` (`tion` の `react-router-dom`) が無いときは、足します。(`@yanqirenshi/ihub.core` の README を見てください)

`dependencies` から、iHub 本体が持つパッケージを消します。

- 消すもの: `@yanqirenshi/colonoscope`・`d3.deployment`・`d3.er`・`d3.sitemap`・`d3.ter`・`d3.unchi`・`menubook`・`model.*`・`react-masonry-component`・`table.wbs`・`beach`、`@splidejs/react-splide`・`@uiw/react-md-editor`・`bulma`・`react-measure`・`sogh`・`tion`、サーバーの `hono`・`@hono/node-server`・`ajv`・`ajv-i18n`
- 残すもの: アプリが直接使うパッケージ。(例: `@yanqirenshi/manipulater`・`@yanqirenshi/markdown.sitter`・`react`・`react-redux`・`react-router-dom`・`@mui/*`・`@emotion/*`、DFD などを足していたときの `@yanqirenshi/d3.dfd`)

```
npm install
```

`package-lock.json` は、消さずに、そのまま使ってください。(消すと、依存するパッケージの版が変わって、動かなくなることがあります)

### 4. `src/index.js` などを、パッケージの形にする

雛形の `src/index.js`・`src/Router.js`・`src/operators/`・`src/wbs/` で、上書きします。

```
npx ihub-srv init --app --only src/index.js --only src/Router.js --only src/operators --only src/wbs
git diff src
```

上書きするのは、コアの `import` を替えるためです。
コピー版でこれらのファイルを直していたときは、`git diff` で、自分の直したところが消えていないかを確かめて、移し直します。

`import` の替え方は、次のとおりです。(上書きせずに、手で直すときの参考にしてください)

| コピー版 | 変更後 |
|---|---|
| `import * as page from './ihub/components/pages/index.js'` | `import { pages as page } from '@yanqirenshi/ihub.core'` |
| `import * as page_docs from './ihub/components/pages/docs/index.js'` | `import { docPages as page_docs } from '@yanqirenshi/ihub.core'` |
| `import Frame from '../ihub/components/assemblies/frames/Frame.js'` | `import { Frame } from '@yanqirenshi/ihub.core'` |
| `import Frame from '../ihub/components/assemblies/frames/FrameWbsNode.js'` | `import { FrameWbsNode as Frame } from '@yanqirenshi/ihub.core'` |
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

**変換で、なくなるもの**

iHub 本体の ER のデータ (`er/entities` など) のフォーマットに無い項目は、変換で、なくなります。
(コピー版で、`server/schemas/` を直して、項目を足していたときなど)
たとえば、ER のテーブルの `color` (テーブルの色) は、いまの iHub 本体にはありません。
`git diff data` で、なくなった項目が無いかを確かめてください。
iHub 本体に項目が要るときは、iHub のリポジトリに Issue を立ててください。

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
| ページの WBS の `start_id` を変えていた (`pages/*.js`・`panels/design/*.js`) | 設定の `panels` (下の例) |
| Help を書き換えていた (`pages/Help/Section*.js`) | 設定の `help.sections` |
| GitHub の OAuth を足していた (`server/github.mjs` など) | 不要。(iHub 本体に入っています。[GitHub との連携](#/github)) |
| サーバーに、アプリ固有のコレクションを足していた (`server/schemas/`・`validation/rules.mjs`) | `createApp` の `extensions` ([API サーバー](#/api)) |
| 図の描き方など、部品の中を直していた | 設定の差し替え口が無いので、iHub のリポジトリに Issue を立てます。それまでは、そのパネルを、アプリで書いて、`panels` で差し替えます |

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

ページの id (`PAGE_DATA` など) の一覧は、`@yanqirenshi/ihub.core` の README にあります。

### 7. 動きを確かめる

```
npm start
```

- 画面が開き、サイドメニュー・ドック・図・WBS が、コピー版のときと同じように出る。
- 足していたタブ (DFD など) が出る。
- 図をドラッグして保存できる。
- `npm run build` が通る。

## 移したあと

- `package.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、同じ版にそろえて、`package-lock.json` と一緒に commit します。
- iHub が新しくなったときは、[iHub の更新](#/update) のとおり、`npm update` で済みます。
- `README` などに「iHub をコピーして更新する」と書いていたときは、書き直します。
