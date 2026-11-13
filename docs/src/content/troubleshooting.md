# 困ったとき

| 症状 | 原因と直し方 |
|---|---|
| `npx ... ihub-srv init --app` が `ERESOLVE` で止まる | `@yanqirenshi/ihub.core` 0.1.x を使っているときは、最初の `npx` に `--legacy-peer-deps` が要ります。(`react` が 19 に解決されて、0.1.x が求める 18 と合わないためです) 0.2.0 以降では、要りません。0.2.0 以降なのに止まるときは、以前に 0.1.x を `--legacy-peer-deps` 付きで `npx` したときのキャッシュが、残っています。(エラーに `Found: @yanqirenshi/ihub.core@0.1.1` のような行が出ます) `npm cache npx ls` で、`@yanqirenshi/ihub.core, @yanqirenshi/ihub.srv` と書かれた行の、先頭のキーを調べて、`npm cache npx rm <キー>` で消してから、もう一度実行してください。(`npm cache clean --force` では、消えません。`npm cache npx` が無い古い npm では、`npm config get cache` で分かるフォルダの `_npx/<キー>` を、消してください) |
| 画面が表示されない (`/wbs/{id}` のページが空になる) | `react-router` と `react-router-dom` が、別の版で 2 つ入っています。(`npm ls react-router` で確かめられます) `package.json` の `react-router` を消して (`react-router-dom` が、必要な `react-router` を持ってきます)、`npm install` をやり直してください。 |
| `package.json` に、`overrides` (`tion` の `react-router-dom`) が残っている | `@yanqirenshi/ihub.core` 0.1.0 の雛形で作った `package.json` には、`overrides` が入っています。0.1.1 以降 (`tion` 0.1.3 以降) では要りませんが、残っていても害は無いので、消してかまいません。(`tion` が 0.1.2 以前だと、`npm install` が `ERESOLVE` で止まります。`npm update tion` で、0.1.3 以降にしてください) |
| 「データを読み込めませんでした」と表示される | API サーバーが動いていません。`npm start` で起動してください。(`npm run start:web` だけでは、API サーバーは起動しません) `npm start` のログに `[api]` のエラーが出ているときは、ポート 4000 をほかのアプリが使っていないか確かめてください。 |
| 画面の上に「… がフォーマットやルールに合っていないため、画面に反映していません。」と出る | `data/` の JSON に、書き間違いや、参照先の無いデータがあります。メッセージに出ている場所を直してください。`npx ihub-srv check data` でも確かめられます。 |
| 図をドラッグしても、位置が保存されない | API サーバーが止まっているか、データのファイルがフォーマットに合っていません。図の上のエラーを確かめてください。TM は、エンティティの見出しをつかんでドラッグします。 |
| 図を右クリックしても、インスペクタが開かない | 要素の上を、右クリックしてください。図の背景では、ブラウザの普通のメニューが開きます。ER 図は、見出しとカラムの文字の上を、TM は、エンティティの見出し (名前の部分) か識別子・属性の行の上を右クリックします。TM の結線 (線) は、右クリックではなくクリックで開きます。 |
| 画面からノードを追加できない | フォームの下に、理由を表示しています。ワークパッケージの下には追加できません。 |
| GitHub の情報が表示されない | `.env.local` のトークンが無いか、権限が足りません。トークンの権限は、`repo`・`project`・`read:org`・`read:user` の 4 つです。書き直したあとは、`npm start` をやり直してください。OAuth で認証するときは、[GitHub との連携](#/github) を見てください。 |
| OAuth で認証したのに、「GitHub に接続していません。」のまま | `@yanqirenshi/ihub.srv` 0.4.x までに得たトークンには、`read:user` の権限がありません。0.5.0 にしたあとで、Scrum の Account タブから認証し直してください。 |
| OAuth で認証して、しばらくすると (8 時間ほど)、GitHub から読み込めなくなる | OAuth App の「Expire user access tokens」が入っています。外して、認証し直してください。(API サーバーは、トークンを取り直しません) |
| `ihub-srv` が見つからない・動かない | `@yanqirenshi/ihub.srv` が入っていません。`npm install` を実行してください。Node.js は 22 以上です。 |
| `ihub-srv init` が、雛形が見つからないと言う | `@yanqirenshi/ihub.core` が入っていません。`npm install` を実行してください。(iHub のリポジトリの中では、`npm run build -w @yanqirenshi/ihub.core` で、雛形を作ってください) |
| `npm start` ですぐに止まる | 画面のポート (3000) を、ほかのアプリが使っています。[ビルドと配信](#/build) の「ポートを変える」を見て、別のポートにしてください。 |
| エディタで変えた内容が、画面に出ない | 画面が API サーバーとつながっていないことがあります。画面を読み直してください。 |
| サイドメニューの項目が消えた | ドックのメニューのボタン (≡) で、非表示になっていないか確かめてください。 |

## データを元に戻したいとき

`data/` は git で管理しているので、git で元に戻せます。

```
git checkout -- data/er/entities.json
```

戻すと、開いている画面にもすぐ反映されます。

## 個人の設定を消したいとき

`data/local/` のファイルを消すと、サイドメニューの表示は既定値に戻ります。
