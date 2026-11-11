# Loading

読み込み中であることを示す、「Loading ...」の大きな文字を出します。
文字は、箱の真ん中に、薄い灰色 (`#eee`) で出します。
箱の大きさは、既定では窓の全体 (幅 `100vw`・高さ `100vh`) です。
タブの中のように、親の大きさに合わせるときは、`width`・`height` に `'100%'` を渡します。

iHub の中では、次のところで使っています。

| 使っているところ | 出すとき | 大きさ |
|---|---|---|
| `<IHub>` の中のデータの読み込み (`DataGate`) | API サーバーからデータ (`GET /api/data`) を読み終えるまで | 窓の全体 |
| 艦橋 (`/`) の「Cockpit」タブ | GitHub につながっていて、Issue を読み終えるまで | 親 (`'100%'`) |
| Scrum (`/scrum`) の「Repositories」タブ ([Repositories](#/components/panels/sogh/Repositories)) | GitHub につながっていて、リポジトリの一覧を読み終えるまで | 親 (`'100%'`) |
| Scrum (`/scrum`) の「Projects」タブ ([Projects](#/components/panels/sogh/Projects)) | GitHub につながっていて、Projects の一覧を読み終えるまで | 親 (`'100%'`) |
| Scrum のプロジェクトのページ (`/scrum/users/:login/projects/:number`) | Project とそのアイテムを読み終えるまで (GitHub につながっていないときは、出したままになります) | 窓の全体 |
| Scrum のアイテムのページ (`/scrum/users/:login/projects/:number/items/:id`) | Issue とそのコメントを読み終えるまで | 窓の全体 |
| WBS のノードのページ (`/wbs/{id}`) | ノードのページのファイルを読み込み終えるまで (`<Suspense>` の `fallback`) | 窓の全体 |

- ソース: `packages/ihub.core/src/components/panels/Loading.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `width` | string | - | 箱の幅。CSS の値 (`'100%'` など)。既定は `'100vw'` (窓の幅) |
| `height` | string | - | 箱の高さ。CSS の値 (`'100%'` など)。既定は `'100vh'` (窓の高さ) |

## 使い方の例

```jsx
// タブのパネルの中で使うときは、親の大きさに合わせる。
function MyPanel () {
    const { data } = useMyData();

    if (!data)
        return <panels.Loading width="100%" height="100%"/>;

    return <MyTable data={data}/>;
}

// ページ全体の読み込み中は、窓の全体に出す。(既定)
<Suspense fallback={<panels.Loading/>}>
  <MyLazyPage/>
</Suspense>
```

## 注意

- `width`・`height` を渡さないと、置いた場所ではなく、窓の大きさ (`100vw`・`100vh`) になります。
タブの中のように、窓より狭いところに置くときは、`'100%'` を渡してください。(渡さないと、はみ出します)
- `width`・`height` は、0.3.1 で足しました。
0.3.0 までは、いつも窓の大きさで、タブの中では、タブの見出しの分だけ、はみ出していました。
- 文字の大きさは `166px` で決まっていて、変えられません。
