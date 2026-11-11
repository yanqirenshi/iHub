# GithubOAuth

GitHub との接続の状態と、認証と切断のボタンを描きます。
iHub の中では、Scrum (`/scrum`) の Account タブ ([panels.sogh.Account](#/components/panels/sogh/Account)) に出しています。

- ソース: `packages/ihub.core/src/components/assemblies/GithubOAuth.js`

接続の状態は、redux の state の `githubAuth` から読みます。
状態ごとに、次のように描きます。

| 状態 (`githubAuth.value`) | 描くもの |
|---|---|
| `null` か `'STARTED'` | 「接続しています…」 |
| `true` | アカウントの画像と名前と、接続に使ったトークンの種類 (OAuth で得たトークンか、個人用アクセストークンか) |
| `false` | 「GitHub に接続していません。」 |

ボタンは、次の 2 つです。

| ボタン | 出すとき | 押したとき |
|---|---|---|
| 「GitHub で認証する」(OAuth で接続しているときは「GitHub で認証し直す」) | いつも | API サーバーの `/api/github/oauth/login` へ移ります。認証が終わると、今のページに戻ります |
| 「接続を切る」 | OAuth で得たトークンで接続しているとき | API サーバーの OAuth のトークンを捨てて (`DELETE /api/github/token`)、画面を読み直します。個人用アクセストークンがあれば、そちらでつなぎ直します |

認証のしかたは、[GitHub との連携](#/github) の「OAuth で認証する」を見てください。

## import のしかた

```jsx
import { GithubOAuth } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

```jsx
import Container from '@mui/material/Container';
import { GithubOAuth } from '@yanqirenshi/ihub.core';

function MyAccountPanel () {
    return (
        <Container maxWidth="sm" sx={{pt:3}}>
          <GithubOAuth/>
        </Container>
    );
}
```

## 注意

- `<IHub>` の中で使ってください。
  次の 2 つを使うためです。
  1. redux の state の `githubAuth` (`<IHub>` が GitHub に接続して、書き込みます)
  2. react-router の `useLocation()` (認証のあとに戻るページを決めます)
- API サーバー (`@yanqirenshi/ihub.srv`) が動いている必要があります。
  認証と切断は、API サーバーが行います。
- 「GitHub で認証する」は、API サーバーに OAuth App が設定されていると分かったとき (`githubAuth.configured` が `true`) だけ押せます。
  設定されていないときは、環境変数 `GITHUB_OAUTH_CLIENT_ID` と `GITHUB_OAUTH_CLIENT_SECRET` を設定するよう、案内の文を出します。
  API サーバーに問い合わせられなかったときは、案内の文を出さずに、ボタンを押せないままにします。
- 認証のあとは、今のページに、`?tab=` などの検索パラメーターも含めて戻ります。
  (例: `/scrum?tab=account` で認証すると、Account タブに戻ります)
  0.3.0 までは、パス (`/scrum` など) だけに戻り、検索パラメーターは消えていました。(0.3.1 で直しました)
- 切断に失敗したときは、ボタンの下に「接続を切れませんでした。」と出します。
