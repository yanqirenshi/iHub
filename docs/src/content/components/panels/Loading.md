# Loading

読み込み中であることを示す、「Loading ...」の大きな文字を出します。
文字は、窓 (幅 `100vw`・高さ `100vh`) の真ん中に、薄い灰色 (`#eee`) で出します。

iHub の中では、次のところで使っています。

| 使っているところ | 出すとき |
|---|---|
| `<IHub>` の中のデータの読み込み (`DataGate`) | API サーバーからデータ (`GET /api/data`) を読み終えるまで |
| コックピット (`/`) の「Cockpit」タブ | GitHub につながっていて、Issue を読み終えるまで |
| Scrum (`/scrum`) の「Repositories」タブ ([Repositories](#/components/panels/sogh/Repositories)) | GitHub につながっていて、リポジトリの一覧を読み終えるまで |
| Scrum (`/scrum`) の「Projects」タブ ([Projects](#/components/panels/sogh/Projects)) | GitHub につながっていて、Projects の一覧を読み終えるまで |
| Scrum のプロジェクトのページ (`/scrum/users/:login/projects/:number`) | Project とそのアイテムを読み終えるまで (GitHub につながっていないときは、出したままになります) |
| Scrum のアイテムのページ (`/scrum/users/:login/projects/:number/items/:id`) | Issue とそのコメントを読み終えるまで |
| WBS のノードのページ (`/wbs/{id}`) | ノードのページのファイルを読み込み終えるまで (`<Suspense>` の `fallback`) |

- ソース: `packages/ihub.core/src/components/panels/Loading.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

```jsx
function MyPanel () {
    const { data } = useMyData();

    if (!data)
        return <panels.Loading/>;

    return <MyTable data={data}/>;
}

<Suspense fallback={<panels.Loading/>}>
  <MyLazyPage/>
</Suspense>
```

## 注意

- 大きさは、置いた場所ではなく、窓の大きさ (`100vw`・`100vh`) です。
タブの中のように、窓より狭いところに置くと、はみ出します。
- 文字の大きさは `166px` で決まっていて、変えられません。
