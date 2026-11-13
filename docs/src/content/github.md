# GitHub との連携

iHub は、GitHub の Issue や Projects を表示したり、Issue を追加したりできます。
使うには、OAuth で認証するか、GitHub の個人用アクセストークンを設定します。
両方あるときは、OAuth で得たトークンを使います。
どちらも設定しないときは、GitHub には接続しません。(ほかの機能は、いままでどおり使えます)

## OAuth で認証する

1. GitHub の Settings → Developer settings → OAuth Apps で、OAuth App を登録します。
   Authorization callback URL は `http://localhost:3000/api/github/oauth/callback` にします。
   (開発サーバーのポートを変えているときは、そのポートにします。`npm run serve` で開くときは `http://localhost:4000/api/github/oauth/callback` です)
2. `.env.local` に、OAuth App の Client ID と Client secret を書きます。(雛形の `.env.local.template` に、この 2 つの変数の欄があります)

```
GITHUB_OAUTH_CLIENT_ID=Ov23xxxxxxxxxxxxxxxx
GITHUB_OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. `npm start` をやり直します。(API サーバーが起動したときに読み込むため)
4. Scrum (`/scrum`) の Account タブの「GitHub で認証する」を押します。
   GitHub の認可画面で許可すると、元の画面に戻り、アカウントが表示されます。

- 権限は `repo`・`project`・`read:org` を求めます。
- client secret は API サーバーだけが読みます。(`REACT_APP_` で始まらないので、画面の JavaScript には入りません)
- トークンは API サーバーのメモリにだけ持ちます。API サーバーを起動し直したら、認証し直してください。
- 「接続を切る」を押すと、OAuth のトークンを捨てます。個人用アクセストークンがあれば、そちらでつなぎ直します。
- API サーバーが、トークンを画面に返せる (`GET /api/github/token`) のは、API サーバーが、このパソコンの中からの要求だけを受け付ける (`Host`・`Origin` の確認) ためです。API サーバーを、ほかのパソコンから使えるようにしたり、公開したりしないでください。
- callback URL は、画面を開く URL から作ります。(`http://` 固定です。`https` の後ろに置く構成は、想定していません)
- API サーバーを `ihub-srv` で起動するときは、作業フォルダの `.env.local` を、環境変数として読み込みます。
  (`createApp` で起動するときは、`createApp({ github: { client_id, client_secret } })` でも渡せます。[@yanqirenshi/ihub.srv](https://github.com/yanqirenshi/iHub/tree/main/packages/ihub.srv) の README を見てください)

OAuth の手順は、実際の OAuth App で確かめる必要があります。(iHub のテストは、GitHub への要求を差し替えて、認証の流れを確かめています)
OAuth App を用意したときに、上の手順で、認証できることを確かめてください。

## 個人用アクセストークンを設定する

`.env.local` に、トークンを書きます。

```
REACT_APP_GITHU_PARSONAL_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

- トークンには、`repo`・`project`・`read:org` の権限を付けてください。
- 書いたあとは、`npm start` をやり直してください。(起動したときに読み込むため)
- 画面の設定では、`github: { token: process.env.REACT_APP_GITHU_PARSONAL_TOKEN }` として渡します。([設定の渡し方](#/customize))
- トークンを設定すると、サイドメニューに GitHub のアカウントの画像が表示されます。

## 艦橋 (`/`)

自分が担当している (assignee が自分の) GitHub の Issue を、カードで並べます。(「Cockpit」タブ)

GitHub に接続していないときや、GitHub からの読み込みに失敗したときは、艦橋の「Cockpit」タブと、Scrum の「Repositories」「Projects」タブに、知らせの文章を出します。
知らせの中の「Account タブ」のリンクから、Scrum の Account タブ (`/scrum?tab=account`) へ移って、接続できます。
(0.3.0 までは、知らせを出さず、空の一覧やカード置き場を出すだけでした)

## Scrum (`/scrum`)

GitHub の Projects やリポジトリの情報を見るページです。
タブは、Repositories・Projects・Account・Help の 4 つです。(初めに開くのは Projects)

| URL | 内容 |
|---|---|
| `/scrum` | 自分の Projects など |
| `/scrum/users/{login}/projects/{number}` | Project |
| `/scrum/users/{login}/projects/{number}/items/{id}` | Project のアイテム |
| `/scrum/users/{login}/repositories/{repository}` | リポジトリ |
| `/scrum/users/{login}/repositories/{repository}/issues/{number}` | Issue |

## Issue を作って Project に追加する

ドックの GitHub のボタンを押すと、「Project にイシューを追加」の吹き出しが開きます。

1. Project を選びます。
   作成先のリポジトリ (Project に結び付いた先頭のリポジトリ) が、横に出ます。
2. タイトルを書きます。(必須)
3. 担当を選びます。
   作成先のリポジトリで担当にできる人から、複数選べます。
   初めは、ログイン中の自分が選ばれています。(外すと、担当なしで作ります)
4. 日付を入れます。
   選んだ Project の日付の項目のうち、名前が `Plan.` か `NextAction.` で始まるもの (`Plan.Start`・`Plan.End`・`NextAction.Date` など) が、欄になります。
   空の欄は、設定しません。
5. 本文 (Markdown) を書きます。
6. 「追加」を押すと、リポジトリに Issue を作り、Project に追加して、入れた日付を設定します。
   作ったあとは、タイトル・本文・日付が空に戻り、担当は初めの選び方に戻ります。

- 担当と日付は、0.5.0 以降です。
- 実績の日付 (`Result.*`) と、名前が `Plan.`・`NextAction.` で始まらない日付の項目 (`Start date` など) は、欄に出ません。当てはまる項目が無い Project では、日付の欄は出ません。
- Issue は作れたが、Project に追加できなかったときや、日付を設定できなかったときは、作った Issue へのリンクと、理由を出します。(日付は、1 つが失敗しても、残りを設定します)
- 吹き出しの中身は、ihub.core の部品 [ProjectItemForm](#/components/assemblies/ProjectItemForm) です。(0.4.x までの雛形では、アプリの `src/operators/ProjectItemForm.js` でした。移り方は、部品のページにあります)

## 注意

個人用アクセストークンは、ビルドした画面の JavaScript の中に入ります。
自分のパソコンだけで使い、ほかの人が見られる場所に画面を置かないでください。
