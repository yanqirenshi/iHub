# ErrorBoundary

子の部品を描いている途中で起きたエラーを受け止めて、画面全体が消えないようにします。
エラーが起きたときは、子の部品の代わりに、エラーの文章 (`fallback`) を出します。
エラーの中身は、ブラウザのコンソールに出します。(`console.error`)

- ソース: `packages/ihub.core/src/components/parts/ErrorBoundary.js`

iHub の中では、次のパネルで、GitHub のデータを描く部品を囲んでいます。

- [Repositories](#/components/panels/sogh/Repositories)
- [Projects](#/components/panels/sogh/Projects)

## import のしかた

```jsx
import { ErrorBoundary } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `children` | node | - | 囲む部品 |
| `fallback` | node | - | エラーが起きたときに出すもの。無いときは「表示中にエラーが発生しました。」を出します |

## 使い方の例

```jsx
<ErrorBoundary fallback="一覧の表示でエラーが発生しました。">
  <MyList/>
</ErrorBoundary>
```

## 注意

- 一度エラーを受け止めると、そのあとは `fallback` を出し続けます。
  子の部品や props が変わっても、元には戻りません。
  (戻すには、`key` を変えるなどして、ErrorBoundary を作り直します)
- 受け止めるのは、描画の途中のエラーだけです。(React の Error Boundary の決まり)
  ボタンを押したときの処理 (イベントハンドラ) や、非同期の処理 (データの取得など) のエラーは、受け止めません。
