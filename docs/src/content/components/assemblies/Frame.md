# Frame

iHub の画面の枠を描きます。
左のサイドメニューと、下のドックを出し、その中に `children` (ページの内容) を描きます。
iHub のページは、この枠か、この枠を使う部品で囲んでいます。

| 描くもの | 使う部品 | 内容 |
|---|---|---|
| サイドメニュー | `@yanqirenshi/menubook` | 設定の `menus` のページと項目。項目を押すと、その URL へ移ります |
| ドック | `@yanqirenshi/manipulater` | 設定の `operators` のボタンと吹き出し |
| ページの内容 | `children` | 渡したものを、そのまま描きます |

- ソース: `packages/ihub.core/src/components/assemblies/frames/Frame.js`

サイドメニューで強調する項目は、今の URL の先頭 (`/business/xxx` なら `/business`) から決めます。
ブラウザの戻る・進むや、画面の中のリンクで URL が変わったときも、強調する項目が追従します。
URL に合う項目が無いときは、先頭の項目を強調します。

タブのあるページには [FrameTabs](#/components/assemblies/FrameTabs) を、WBS のノードのページには [FrameWbsNode](#/components/assemblies/FrameWbsNode) を使います。

## import のしかた

```jsx
import { Frame } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `children` | node | - | ページの内容 |

## 使い方の例

```jsx
import Container from '@mui/material/Container';
import { Frame } from '@yanqirenshi/ihub.core';

export default function MyPage () {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            ページの内容です。
          </Container>
        </Frame>
    );
}
```

## 注意

- `<IHub>` の中で使ってください。
  次の 3 つを使うためです。
  1. 設定 (`useConfig()`)
  2. redux の store
  3. react-router (`useLocation()`・`useNavigate()`)
- 読む設定は、次の 3 つです。([カスタマイズ](#/customize))

| 設定 | 使うところ |
|---|---|
| `colors` | 配色の主の色 (`main`) を、ドックの色と、サイドメニューの背景に使います |
| `menuColors` | サイドメニューの背景と文字の色、アカウントの円の色。`background` が無いときは、配色の主の色を背景に使います |
| `operators` | ドックの吹き出しの中身 (`Leafs`) と、ボタンのアイコンの付け外し (`labels`) |

- 読む redux の state は、次の 4 つです。

| state | 内容 |
|---|---|
| `window.value` | 窓の大きさ。ドックの位置を決めるのに使います |
| `operators` | ドックのボタン |
| `accountMenu` | サイドメニューのページと項目 (`menu`)、開いているか (`isOpend`) |
| `githubAuth.avatarUrl` | GitHub のアカウントの画像。サイドメニューのアイコンに出します |

- 枠の大きさは、窓の高さ (`100vh`) と、窓の幅まで (`max-width: 100vw`) です。
  ページの内容が窓より長いときは、`children` の側でスクロールさせてください。(例: `<Box sx={{height:'100%', overflow:'auto'}}>`)
