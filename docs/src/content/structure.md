# フォルダ構成

iHub のフォルダは、「アプリごとに書き換えるもの」と「iHub 本体 (書き換えないもの)」に分かれています。
iHub 本体を書き換えずにおくと、iHub が新しくなったときに、そのまま取り込めます。([iHub の更新](#/update))

## アプリごとに書き換えるもの

| フォルダ・ファイル | 内容 |
|---|---|
| `data/` | 設計のデータ (JSON)。git で共有します。 |
| `data/local/` | 個人の設定。画面から変わります。git では共有しません。 |
| `src/config/` | サイドメニューの項目 (`ACCOUNT_MENUS.js`)・サイドメニューの色 (`ACCOUNT_MENU_COLORS.js`)・アプリの配色 (`COLORS.js`)・アイコン (`ICONS.js`)・ドックのボタン (`OPERATOR_ITEMS.js`) |
| `src/components/` | 自分で作る部品 (`assemblies`・`pages`・`panels`・`parts`) |
| `src/wbs/` | WBS のノードのページ (`P{id}.js`) |
| `src/operators/` | ドックの吹き出しの中身 |
| `src/Router.js` | ページの URL |
| `src/index.js` | 入り口。アプリの設定 (サイドメニュー・配色・ドック・WBS のページなど) を組み立てて、`<IHub config={config}>` に渡し、`Router` を描きます。([設定の渡し方](#/customize)) |
| `src/index.css` | 見た目の上書き (iHub の CSS のあとに読み込みます) |
| `public/` | 画像など |

## iHub 本体 (書き換えないもの)

| フォルダ・ファイル | 内容 |
|---|---|
| `packages/ihub.core/` | 画面の部品 (`@yanqirenshi/ihub.core`)。`src/` に部品 (`components`)・Redux (`redux`)・データの扱い (`manegers`)・画面全体の `IHub.js`・設定の `config.js` などがあり、Babel で `dist/` に変換して使います。アプリのファイルは import せず、設定として受け取ります |
| `packages/ihub.core/examples/data/` | `data/` の雛形 |
| `packages/ihub.core/examples/wbs/` | `src/wbs/` の雛形 |
| `packages/ihub.core/examples/app/wbs/` | `src/wbs/` の `NotFoundWbsNodeData.js`・`NotFoundWbsNodeComponent.js` の雛形 |
| `src/js/` | service worker と reportWebVitals (CRA のもの) |
| `src/setupProxy.js` | 開発サーバーから API サーバーへの中継 |
| `packages/ihub.srv/` | API サーバー (`@yanqirenshi/ihub.srv`。データの読み書き・検証・変更の通知) |
| `packages/ihub.srv/src/schemas/` | データのフォーマット (JSON Schema) |
| `packages/ihub.srv/src/tools/` | 古い形式のデータ (`src/data/*.js`) を、`data/` の JSON に変換するスクリプト |

iHub 本体に直したいところが見つかったときは、iHub のリポジトリで直してから、アプリへ取り込んでください。
アプリの側で直したときは、iHub のリポジトリにも反映してください。

## 用意してある部品

`@yanqirenshi/ihub.core` (`packages/ihub.core/src/components/`) の部品は、自分のページでも使えます。

| フォルダ | 内容 |
|---|---|
| `pages/` | ページ |
| `panels/` | ページの中身 (ER 図・TM など) |
| `assemblies/` | 中間の部品 (枠の `frames/Frame.js`・`frames/FrameWbsNode.js` など) |
| `parts/` | 小さな部品 |

自分で作る部品は、`src/components/` の同じ名前のフォルダに置きます。
