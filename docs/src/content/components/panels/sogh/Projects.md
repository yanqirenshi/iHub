# Projects

GitHub に接続したアカウント (viewer) の Projects の一覧を出します。
Scrum (`/scrum`) の「Projects」タブのパネルです。
Scrum を開いたときに、初めに出るタブです。

- ソース: `packages/ihub.core/src/components/panels/sogh/Projects.js`

次の順に動きます。

1. GitHub に接続できたら (redux の `githubAuth.value` が `true`)、Projects を GitHub から読み込みます。(`fetchProjectsV2`)
2. 読み込んでいる間は、[Loading](#/components/panels/Loading) を出します。
3. 読み込んだ Projects を、sogh の `ProjectsV2` の部品で出します。(MUI の `Container` の `lg` の幅)

- 読み込んだ Projects の id は、redux の store の `scrum.projectsV2` (`{ status, error, ids }`) に入ります。
- Projects は、一度読み込んだら、画面を読み込み直すまで読み込みません。
- 一覧は [ErrorBoundary](#/components/parts/ErrorBoundary) で囲んでいます。
  表示でエラーが起きたときは、「Projects の取得・表示でエラーが発生しました。」を出します。

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.sogh.Projects/>
```

## props

props はありません。
(タブのあるページのパネルとして使うと、`tab` を受け取りますが、使いません)

## 使い方の例

```jsx
import { panels } from '@yanqirenshi/ihub.core';

const config = {
    // (省略)
    tabs:   { PAGE_DEVOPS: { list: [{ code: 'projects', label: 'Projects' }] } },
    panels: { PAGE_DEVOPS: { projects: panels.sogh.Projects } },
};
```

## 注意

- `<IHub>` の中で使ってください。
  redux の store の `githubAuth` と `scrum` を使います。
- GitHub に接続している必要があります。([GitHub との連携](#/github))
  トークンには `project` の権限が要ります。
  接続していないときは、何も読み込まず、空の一覧になります。
- GitHub からの読み込みに失敗したときも、空の一覧になります。
  エラーの文章は出しません。(失敗の理由は、store の `scrum.projectsV2.error` に入ります)
