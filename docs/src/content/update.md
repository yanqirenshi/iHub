# iHub の更新

iHub が新しくなったときに、アプリに取り込む手順です。
iHub 本体 (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) は `node_modules/` に入っているので、パッケージを新しくするだけで済みます。
(フォルダごとコピーして使っていたアプリは、[コピー版からの移行](#/migrate) を先に済ませてください)

## 新しくする

```
npm update @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

- `package.json` の範囲 (例: `^0.10.0`) の中で、新しい版に上がります。
- 0.x の間は、`^0.10.0` は 0.10.x だけを指します。minor (0.11.0 など) に上げるときは、範囲を書き換えます。

```
npm install @yanqirenshi/ihub.core@^0.10.0 @yanqirenshi/ihub.srv@^0.10.0
```

- 2 つのパッケージは、同じ版にそろえてください。
- 新しい版があるかは、`npm outdated` で確かめられます。

更新したあとは、2 つが同じ版になったかを、次のコマンドで確かめます。

```
npm ls @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

```
+-- @yanqirenshi/ihub.core@0.10.1
`-- @yanqirenshi/ihub.srv@0.10.1
```

- 出力の最初の行には、アプリの名前と場所が出ます。
その下の 2 行の `@` のあとの版が、同じになっていれば大丈夫です。(上は 0.10.1 の例です)
- 版が違うときは、片方に、`package.json` の範囲に合わない版として `invalid` が付くことがあります。
上の `npm install` で、同じ版を指定して、入れ直してください。

## 版の付け方

iHub は、[semver](https://semver.org/lang/ja/) で版を付けます。
0.x の間は、次のように読みます。

| 上がるところ | 意味 | 取り込むときに |
|---|---|---|
| patch (0.1.0 → 0.1.1) | 不具合の修正。設定の形や公開している部品は変わりません | `npm update` だけで済みます |
| minor (0.1.0 → 0.2.0) | 設定の形・公開している部品・データのフォーマットが変わることがあります | 下の「minor が上がったとき」を見ます |

## minor が上がったとき

1. 変更の内容を、[CHANGELOG](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) で確かめます。
iHub の PR や Issue には、「アプリで直すところ」を書いていることがあります。
2. `@yanqirenshi/ihub.core` の peerDependencies (React・MUI など) の求める版が変わったときは、アプリの `package.json` の版を合わせます。
CHANGELOG に、peerDependencies の変更が書かれています。(例: 0.2.0 は、React 19 に対応して、`react`・`react-dom` が `^18.3.1 || ^19.0.0` になりました)
[導入のしかた](#/setup) の「アプリで入れるパッケージの版」の表を見て、アプリの `package.json` の `react`・`@mui/material` などを、求める版に直します。
(合っていないと、`npm install` が `ERESOLVE` で止まったり、同じパッケージが 2 つ入って、動かなくなったりします)
直したら `npm install` して、1 つだけ入っていることを確かめます。

```
npm ls @mui/material
```

(出力に `deduped` と付いているものは、同じものを使っています。版の違うものが 2 つ出てきたときは、`package.json` の版を、表に合わせ直します)

3. 設定の形が変わったときは、`src/index.js` の設定 (`config`) を、CHANGELOG のとおりに直します。
(設定の項目は、[カスタマイズ](#/customize) の「設定の渡し方」と、`@yanqirenshi/ihub.core` の README にあります)
4. データのフォーマットが変わったときは、`npx ihub-srv check data` で、直すところを確かめます。
直したら、もう一度 `npx ihub-srv check data` で確かめます。
5. 雛形のファイル (`src/config/`・`src/operators/` など) が変わったときは、新しい雛形を別のフォルダに作って、自分のファイルと見比べます。
新しい版を入れたあとで、アプリのフォルダで、次のコマンドを実行します。

```
npx ihub-srv init --app ../ihub-template
```

(`../ihub-template` の `src/` と、自分の `src/` を比べて、必要なところだけを取り込みます)

- `ihub-srv init --app` は、雛形を、入っている `@yanqirenshi/ihub.core` の `examples/app/` から読みます。
そのため、ihub.core が入っているところ (アプリのフォルダ) で実行します。
作る雛形は、入っている ihub.core の版のものです。(`package.json` に書く 2 つのパッケージの版も、入っている版です)
- ihub.core が入っていないところで実行すると、「雛形 (examples/app) が見つかりません。」と出て、止まります。(`npx -p @yanqirenshi/ihub.srv ihub-srv init --app` のように、ihub.srv だけを入れて実行したときも同じです)
- 上げる前に、新しい版の雛形を見たいときは、[導入のしかた](#/setup) と同じ形で、2 つのパッケージの版を指定して実行します。(0.10.1 の例)

```
npx --yes --package=@yanqirenshi/ihub.core@0.10.1 --package=@yanqirenshi/ihub.srv@0.10.1 -- ihub-srv init --app ../ihub-template-0.10.1
```

(アプリのフォルダの中で実行しても、指定した版の雛形を作ります。アプリに入っている版は、変わりません)
雛形のうち、指定したファイルだけを上書きするときは、`--only` を使います。

```
npx ihub-srv init --app --only src/operators --only src/wbs
```

6. `npm start` で、動きを確かめます。

## iHub 本体を直したいとき

`node_modules/` の中は、直さないでください。
`npm install` をやり直すと、消えてしまいます。

| したいこと | 方法 |
|---|---|
| ページにタブやパネルを足す・差し替える | 設定の `tabs`・`panels` ([カスタマイズ](#/customize)) |
| Help の内容を差し替える | 設定の `help.sections` |
| サイドメニュー・ドック・配色を変える | 設定の `menus`・`operators`・`colors` など |
| API サーバーに、アプリ固有のコレクションやルートを足す | `createApp` の `extensions` ([API サーバー](#/api)) |
| 上のどれでもできない | iHub のリポジトリで直して、新しい版を出してもらいます。(Issue を立ててください) |

## 古いデータの形式から移すとき

古い形式 (`src/data/*.js`・ER のフラット形式) のデータを持つアプリは、[コピー版からの移行](#/migrate) の「データを新しい形式にする」を見てください。

## 0.4.x 以前から上げるとき

0.5.0 から、GitHub と接続するトークンに、`read:user` の権限が要ります。
`read:user` が無いと、画面が「GitHub に接続していません。」のままになります。
上げたあとで、次のどちらかをします。

1. OAuth で認証している人は、Scrum (`/scrum`) の Account タブで、認証し直します。(0.4.x 以前に得たトークンには、`read:user` がありません)
2. 個人用アクセストークンを使っている人は、トークンに `read:user` の権限を足します。(権限は、`repo`・`project`・`read:org`・`read:user` の 4 つです)

詳しくは、[GitHub との連携](#/github) にあります。
このあとの「0.6.x から 0.7.0 以降に上げるとき」「0.8.x から 0.9.x に上げるとき」「0.9.x から 0.10.x に上げるとき」も、順に見てください。

## 0.6.x から 0.7.0 以降に上げるとき

0.7.0・0.8.0 では、データのフォーマットと、図の既定の見た目が変わりました。
`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` を、同じ版 (0.8.0 以降) にそろえてから、次のものを直します。

### ワークパッケージの `plan` を書いていたとき

艦橋の Schedule タブの予定は、0.7.0 から、`data/wbs/workpackages.json` の `plan` ではなく、`data/master_schedule/` に書きます。
ワークパッケージの `plan` は使えなくなり、書いてあると `npx ihub-srv check data` が誤りにします。

1. Schedule の行になっていた WBS (`plan` のあるワークパッケージを持つ WBS) を、`data/master_schedule/wbs.json` に書きます。(`id`・`name`)
2. ワークパッケージの `name`・`plan` を、`data/master_schedule/workpackages.json` に書きます。`parent` には、1 の WBS の `id` を書きます。
3. 矢羽根を押したときに、これまでどおり、ワークパッケージのページへ移したいときは、`wbs` に `data/wbs/` のワークパッケージの `id` を書きます。
4. `data/wbs/workpackages.json` から、`plan` を消します。
5. `npx ihub-srv check data` で確かめます。

書き方は、[データの管理](#/data) の「Schedule の予定 (`master_schedule`)」にあります。
0.7.0 で `data/master_schedule/rows.json`・`items.json` を作っていたときは、0.8.0 から、`wbs.json`・`workpackages.json` に名前を変えます。(中身は、そのまま使えます。古い名前のファイルがあると、`ihub-srv check` が知らせます)

### 図のグリッド線を出していたとき

d3.* で描く 7 つの図は、0.7.0 から、既定ではグリッド線を描きません。
これまでどおり出したい図は、設定の `diagrams` に `{ grid: { draw: true } }` を書きます。([カスタマイズ](#/customize) の「図のグリッド線を描く」)
グリッド線を消すために `{ draw: false }` を書いていたアプリは、そのままで構いません。

### 見え方が変わるところ (直さなくてよいもの)

- Schedule タブは、図の右上の「日・週・月」のボタンで、目盛りのサイクルを切り替えられます。(0.7.0) 初めは、これまでと同じ週です。
- Schedule タブは、「−」「＋」のボタンで、1 目盛りの幅を変えられます。(0.8.1)
- Schedule タブの名前の列の幅が、名前に合うようになります。(0.8.1)
- Schedule タブの現在線 (今日の位置の縦の線) は、今日が表示する期間の外のときは、描かなくなります。(0.8.2)
- Schedule タブの図の位置は、0.6.x で覚えたものを使わず、初めの位置で開きます。(図の code が、サイクルごとに分かれたため)

0.9.0 以降で変わったところは、次の「0.8.x から 0.9.x に上げるとき」を見てください。

## 0.8.x から 0.9.x に上げるとき

0.9.0〜0.9.2 では、データのフォーマットと設定の形は、0.8.x から変わっていません。
(0.8.3 は、npm に出していません。中身は、0.9.0 に入っています)
`package.json` の 2 つのパッケージの範囲を `^0.9.0` などに書き換えて、上の「新しくする」の `npm install` で入れ直します。

### `init --app` で作ったアプリ

0.9.0 までの `npx ihub-srv init --app` で作ったアプリは、`package.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` が、雛形の `^0.6.0` のままになっています。
このままでは、`npm update` しても、0.6.x のままです。(0.x の `^` は、minor の違う版を入れません)
2 つの版を、`^0.9.1` などに直してから、`npm install` してください。
0.9.1 以降の `init --app` は、`init` に使った版を書きます。([導入のしかた](#/setup))

### 見え方が変わるところ (直さなくてよいもの)

- Schedule タブで、入れ子の子どうしの間にも、行の区切り線を引きます。(0.9.0) 入れ子の無いデータは、0.8.x と同じ見え方です。
- Schedule タブで、矢羽根・WBS の箱・プロジェクトの箱を右クリックすると、インスペクタで、名前・予定・見た目を書き換えられます。(0.9.0) 書き換えると、`data/master_schedule/` のファイルが変わります。([図の編集](#/diagrams) の「Schedule で名前・予定・見た目を変える」)
- クラス図の関係の線と、TM の結線の当たり (線の近くをクリックしても、線が開く幅) は、拡大の度合いにかかわらず、画面の上で約 4.5px です。(0.9.2)
  - クラス図は、0.9.0 までは画面の上で 6px、0.9.1 は図と一緒に拡大・縮小する当たり (100% で約 4.5px) でした。
  - 100% のときの動きは、0.9.1 と変わりません。100% より拡大したときは、0.9.1 より狭くなります。(200% のとき、画面の上で約 9px から約 4.5px)

## 0.9.x から 0.10.x に上げるとき

0.10.0・0.10.1 では、データのフォーマットと設定の形は、0.9.x から変わっていません。
(`data/master_schedule/milestones.json` は、マイルストーンを描きたいときに足します。無くても動きます)
`package.json` の 2 つのパッケージの範囲を `^0.10.0` などに書き換えて、上の「新しくする」の `npm install` で入れ直します。
(0.x の `^0.9.0` は、0.10.x を入れません。`npm update` だけでは、0.9.x のままです)

### 見え方が変わるところ (直さなくてよいもの)

- Schedule タブで、`data/master_schedule/milestones.json` に書いたマイルストーンを、WBS かプロジェクトの行に △ で描きます。(0.10.0) 右クリックで、インスペクタで書き換えられます。`milestones.json` が無いアプリは、0.9.x と同じ見え方です。(書き方は [データの管理](#/data) の「Schedule の予定 (`master_schedule`)」)
- マイルストーンの日付がワークパッケージの期間の外にあると、Schedule タブの表示する期間が、そこまで広がります。(0.10.0)
- TM の結線のラベルの文字の上をクリックしても、結線がインスペクタに開きます。(0.10.1) 線の上と線の近くのクリックは、0.9.2 と変わりません。
