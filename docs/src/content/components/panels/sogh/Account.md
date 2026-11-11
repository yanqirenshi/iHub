# Account

GitHub との接続の状態と、OAuth で認証・切断するボタンを出します。
Scrum (`/scrum`) の「Account」タブのパネルです。
中身は [GithubOAuth](#/components/assemblies/GithubOAuth) で、この部品は、それを幅の狭い枠 (MUI の `Container` の `sm`) に入れて、スクロールできるようにしたものです。

- ソース: `packages/ihub.core/src/components/panels/sogh/Account.js`

アカウントのページ (`pages.Account`。参照アプリの `/account`) とは、別の部品です。
GitHub との接続を出すのは、この `panels.sogh.Account` です。
(0.2.x までは、assemblies にも `Account` という部品がありましたが、使われていなかったため、0.3.0 で外しました)

認証の手順は、[GitHub との連携](#/github) の「OAuth で認証する」にあります。

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.sogh.Account/>
```

## props

props はありません。
(タブのあるページのパネルとして使うと、`tab` を受け取りますが、使いません)

## 使い方の例

ほかのページのタブに、GitHub との接続を出します。([ページのタブとパネルを足す](#/customize))

```jsx
import { panels } from '@yanqirenshi/ihub.core';

const config = {
    // (省略)
    tabs:   { PAGE_DEVOPS: { list: [{ code: 'github', label: 'GitHub' }] } },
    panels: { PAGE_DEVOPS: { github: panels.sogh.Account } },
};
```

## 注意

- `<IHub>` の中で使ってください。
  redux の store の `githubAuth` (接続の状態) を読み、react-router の今の URL を、認証のあとに戻る先に使います。
- 認証は API サーバーが行います。
  API サーバーに OAuth App (`GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET`) が設定されていないときは、「GitHub で認証する」を押せません。
