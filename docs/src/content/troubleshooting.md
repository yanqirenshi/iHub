# 困ったとき

| 症状 | 原因と直し方 |
|---|---|
| `npx ... ihub-srv init --app` が `ERESOLVE` で止まる | `@yanqirenshi/ihub.core` 0.1.x を使っているときは、最初の `npx` に `--legacy-peer-deps` が要ります。(`react` が 19 に解決されて、0.1.x が求める 18 と合わないためです) 0.2.0 以降では、要りません。0.2.0 以降なのに止まるときは、以前に 0.1.x を `--legacy-peer-deps` 付きで `npx` したときのキャッシュが、残っています。(エラーに `Found: @yanqirenshi/ihub.core@0.1.1` のような行が出ます) `npm cache npx ls` で、`@yanqirenshi/ihub.core, @yanqirenshi/ihub.srv` と書かれた行の、先頭のキーを調べて、`npm cache npx rm <キー>` で消してから、もう一度実行してください。(`npm cache clean --force` では、消えません。`npm cache npx` が無い古い npm では、`npm config get cache` で分かるフォルダの `_npx/<キー>` を、消してください) |
| `init --app` で作ったアプリで、`npm install` すると、古い版 (0.6.x) の iHub が入る | 0.9.0 までの `init --app` は、`package.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、雛形の `^0.6.0` のまま書いていました。(0.x の `^` は、minor の違う版を入れません) 2 つの版を、手で `^0.9.1` などに直して、`npm install` してください。(0.9.1 以降の `init --app` は、`init` に使った版を書きます) |
| 画面が表示されない (`/wbs/{id}` のページが空になる) | `react-router` と `react-router-dom` が、別の版で 2 つ入っています。(`npm ls react-router` で確かめられます) `package.json` の `react-router` を消して (`react-router-dom` が、必要な `react-router` を持ってきます)、`npm install` をやり直してください。 |
| `package.json` に、`overrides` (`tion` の `react-router-dom`) が残っている | `@yanqirenshi/ihub.core` 0.1.0 の雛形で作った `package.json` には、`overrides` が入っています。0.1.1 以降 (`tion` 0.1.3 以降) では要りませんが、残っていても害は無いので、消してかまいません。(`tion` が 0.1.2 以前だと、`npm install` が `ERESOLVE` で止まります。`npm update tion` で、0.1.3 以降にしてください) |
| 「データを読み込めませんでした」と表示される | API サーバーが動いていません。`npm start` で起動してください。(`npm run start:web` だけでは、API サーバーは起動しません) `npm start` のログに `[api]` のエラーが出ているときは、ポート 4000 をほかのアプリが使っていないか確かめてください。 |
| 画面の上に「… がフォーマットやルールに合っていないため、画面に反映していません。」と出る | `data/` の JSON に、書き間違いや、参照先の無いデータがあります。メッセージに出ている場所を直してください。`npx ihub-srv check data` でも確かめられます。 |
| 図をドラッグしても、位置が保存されない | API サーバーが止まっているか、データのファイルがフォーマットに合っていません。図の上のエラーを確かめてください。TM は、エンティティの見出しをつかんでドラッグします。 |
| 図を右クリックしても、インスペクタが開かない | 要素の上を、右クリックしてください。図の背景では、ブラウザの普通のメニューが開きます。ER 図は、見出しとカラムの文字の上を、TM は、エンティティの見出し (名前の部分) か識別子・属性の行の上を右クリックします。TM の結線 (線) は、右クリックではなくクリックで開きます。(線の上か、線の近くか、結線のラベルの文字の上。ラベルの上は 0.10.1 以降) Schedule は、矢羽根か、WBS・プロジェクトの箱 (名前の文字の上か、塗りの内側) か、マイルストーンの △ と名前 (0.10.0 以降) を右クリックします。(Schedule のインスペクタは 0.9.0 以降です。0.8.x では開きません) |
| 画面からノードを追加できない | フォームの下に、理由を表示しています。ワークパッケージの下には追加できません。 |
| GitHub の情報が表示されない | `.env.local` のトークンが無いか、権限が足りません。トークンの権限は、`repo`・`project`・`read:org`・`read:user` の 4 つです。書き直したあとは、`npm start` をやり直してください。OAuth で認証するときは、[GitHub との連携](#/github) を見てください。 |
| OAuth で認証したのに、「GitHub に接続していません。」のまま | `@yanqirenshi/ihub.srv` 0.4.x までに得たトークンには、`read:user` の権限がありません。0.5.0 にしたあとで、Scrum の Account タブから認証し直してください。 |
| OAuth で認証して、しばらくすると (8 時間ほど)、GitHub から読み込めなくなる | OAuth App の「Expire user access tokens」が入っています。外して、認証し直してください。(API サーバーは、トークンを取り直しません) |
| `ihub-srv` が見つからない・動かない | `@yanqirenshi/ihub.srv` が入っていません。`npm install` を実行してください。Node.js は 22 以上です。 |
| `ihub-srv init` が、「雛形 (examples/app) が見つかりません。」と言う | 実行したところに、`@yanqirenshi/ihub.core` が入っていません。`ihub-srv init` は、雛形を ihub.core から読みます。アプリのフォルダでは、`npm install` を実行してください。アプリの外で雛形を作るときは、`npx -p @yanqirenshi/ihub.srv ...` のように ihub.srv だけを入れるのではなく、[導入のしかた](#/setup) のように、`--package` で 2 つとも入れて実行してください。([iHub の更新](#/update) の「minor が上がったとき」の 5)(iHub のリポジトリの中では、`npm run build -w @yanqirenshi/ihub.core` で、雛形を作ってください) |
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
