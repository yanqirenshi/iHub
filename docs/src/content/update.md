# iHub の更新

iHub が新しくなったときに、アプリに取り込む手順です。
iHub 本体 (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) は `node_modules/` に入っているので、パッケージを新しくするだけで済みます。
(フォルダごとコピーして使っていたアプリは、[コピー版からの移行](#/migrate) を先に済ませてください)

## 新しくする

```
npm update @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

- `package.json` の範囲 (例: `^0.1.0`) の中で、新しい版に上がります。
- 0.x の間は、`^0.1.0` は 0.1.x だけを指します。minor (0.2.0 など) に上げるときは、範囲を書き換えます。

```
npm install @yanqirenshi/ihub.core@^0.2.0 @yanqirenshi/ihub.srv@^0.2.0
```

- 2 つのパッケージは、同じ版にそろえてください。
- 新しい版があるかは、`npm outdated` で確かめられます。

更新したあとは、2 つが同じ版になったかを、次のコマンドで確かめます。

```
npm ls @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

```
+-- @yanqirenshi/ihub.core@0.2.7
`-- @yanqirenshi/ihub.srv@0.2.7
```

- 出力の最初の行には、アプリの名前と場所が出ます。
その下の 2 行の `@` のあとの版が、同じになっていれば大丈夫です。(上は 0.2.7 の例です)
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

```
npx ihub-srv init --app ../ihub-template
```

(`../ihub-template` の `src/` と、自分の `src/` を比べて、必要なところだけを取り込みます)
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
