# iHub の更新

iHub のリポジトリで直したところを、iHub をコピーしたアプリへ取り込む手順です。

## 置き換えるもの (iHub 本体)

| フォルダ・ファイル | 取り込み方 |
|---|---|
| `src/ihub/` | 新しいものに置き換えます。 |
| `server/` | 新しいものに置き換えます。 |
| `src/setupProxy.js` | 新しいものに置き換えます。 |
| `package.json` | 依存するパッケージ (`dependencies`) と `scripts` の差分を見て、合わせます。 |

## 置き換えないもの (アプリのもの)

`data/`・`src/config/`・`src/components/`・`src/wbs/`・`src/operators/`・`src/Router.js`・`src/App.js`・`src/index.css`・`.env.local`

## 手順

1. iHub のリポジトリで、何が変わったかを確かめます。
iHub の PR や Issue には、「別プロジェクトへの反映手順」を書いていることがあります。
(例: [サイドメニューの on/off を加えたとき](https://github.com/yanqirenshi/iHub/issues/17))
2. iHub 本体のフォルダとファイルを、新しいものに置き換えます。
3. アプリのファイル (`src/config/` など) の書き方が変わったときは、反映手順のとおりに直します。
4. データのフォーマットが変わったときは、`server/schemas/` と `src/ihub/data_example/` を見て、自分の `data/` を直します。
直したら、`npm run test:data` で確かめます。
5. `npm install` を実行してから、`npm start` で動きを確かめます。

## アプリで iHub 本体を直したとき

アプリの側で iHub 本体 (`src/ihub/` など) を直したときは、iHub のリポジトリにも同じ変更を入れてください。
そうしないと、次に iHub を取り込んだときに、直したところが消えてしまいます。
(例: [アプリで直した部品を iHub に取り込んだとき](https://github.com/yanqirenshi/iHub/issues/19))
