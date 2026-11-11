# Repositories

GitHub に接続したアカウント (viewer) のリポジトリの一覧を出します。
Scrum (`/scrum`) の「Repositories」タブのパネルです。

- ソース: `packages/ihub.core/src/components/panels/sogh/Repositories.js`

次の順に動きます。

1. GitHub に接続できたら (redux の `githubAuth.value` が `true`)、リポジトリを GitHub から読み込みます。(`fetchRepositories`)
2. 読み込んでいる間は、[Loading](#/components/panels/Loading) を出します。
3. 読み込んだリポジトリを、sogh の `Repositories` の部品で、幅 `666px` の列に出します。

- 読み込んだリポジトリの id は、redux の store の `scrum.repositories` (`{ status, error, ids }`) に入ります。
- リポジトリは、一度読み込んだら、画面を読み込み直すまで読み込みません。
- 一覧は [ErrorBoundary](#/components/parts/ErrorBoundary) で囲んでいます。
  表示でエラーが起きたときは、「Repositories の取得・表示でエラーが発生しました。」を出します。

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.sogh.Repositories/>
```

## props

props はありません。
(タブのあるページのパネルとして使うと、`tab` を受け取りますが、使いません)

## 使い方の例

```jsx
import { panels } from '@yanqirenshi/ihub.core';

const config = {
    // (省略)
    tabs:   { PAGE_DEVOPS: { list: [{ code: 'repositories', label: 'Repositories' }] } },
    panels: { PAGE_DEVOPS: { repositories: panels.sogh.Repositories } },
};
```

## 注意

- `<IHub>` の中で使ってください。
  redux の store の `githubAuth` と `scrum` を使います。
- GitHub に接続している必要があります。([GitHub との連携](#/github))
  接続していないときは、何も読み込まず、空の一覧になります。
- GitHub からの読み込みに失敗したときも、空の一覧になります。
  エラーの文章は出しません。(失敗の理由は、store の `scrum.repositories.error` に入ります)
