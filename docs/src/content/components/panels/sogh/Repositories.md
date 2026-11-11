# Repositories

GitHub に接続したアカウント (viewer) のリポジトリの一覧を出します。
Scrum (`/scrum`) の「Repositories」タブのパネルです。

- ソース: `packages/ihub.core/src/components/panels/sogh/Repositories.js`

次の順に動きます。

1. GitHub に接続できたら (redux の `githubAuth.value` が `true`)、リポジトリを GitHub から読み込みます。(`fetchRepositories`)
2. 読み込んでいる間は、[Loading](#/components/panels/Loading) を、パネルの大きさで出します。
3. GitHub に接続していないときや、読み込みに失敗したときは、一覧の代わりに、知らせの文章を出します。(下の「注意」)
4. 読み込んだリポジトリを、sogh の `Repositories` の部品で、幅 `666px` の列に出します。

- 読み込んだリポジトリの id は、redux の store の `scrum.repositories` (`{ status, error, ids }`) に入ります。
- リポジトリは、一度読み込んだら、画面を読み込み直すまで読み込みません。
- 一覧は [ErrorBoundary](#/components/parts/ErrorBoundary) で囲んでいます。
  表示でエラーが起きたときは、「Repositories の表示でエラーが発生しました。」を出します。
  (GitHub からの読み込みの失敗は、ErrorBoundary ではなく、下の知らせで出します)

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
- 接続していないときと、読み込みに失敗したときは、一覧の代わりに、次の知らせを出します。

| とき | 出す文章 |
|---|---|
| 接続していない (`githubAuth.value` が `false`) | 「GitHub に接続していません。Account タブから、GitHub に接続してください。」 |
| 読み込みに失敗した (`scrum.repositories.status` が `failed`) | 「Repositories を GitHub から読み込めませんでした。(失敗の理由)」と、Account タブで接続の状態を確かめられる旨 |

- 知らせの「Account タブ」は、`/scrum?tab=account` へのリンクです。(参照アプリの URL です。Scrum のページをほかの URL に置いているアプリでは、リンク先がずれます)
- 0.3.0 までは、接続していないときも、読み込みに失敗したときも、空の一覧を出すだけでした。(0.3.1 で直しました)
