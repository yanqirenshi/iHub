# 更新履歴

`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` は、同じ版にそろえて出します。
変更の詳しい内容は、パッケージごとの CHANGELOG (npm のパッケージにも入っています) に書きます。

| パッケージ | 更新履歴 |
|---|---|
| `@yanqirenshi/ihub.core` | [packages/ihub.core/CHANGELOG.md](packages/ihub.core/CHANGELOG.md) |
| `@yanqirenshi/ihub.srv` | [packages/ihub.srv/CHANGELOG.md](packages/ihub.srv/CHANGELOG.md) |

版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマット・API・CLI を変えるときに、minor を上げます。

## 0.5.0 (2026-11)

- `@yanqirenshi/ihub.core`: 艦橋の Cockpit タブのカードを、Project の `NextAction.Date` の近い順に並べ、カードに日付を出すようにした。(日付の無い Issue は最後で、元の順。複数の Project で違うときは一番近い日付。過ぎた日付は赤で太字。日付は、自分が担当の Issue だけ、100 件ずつまとめて読む。読み込めなかったときは、これまでの並びで出す。Project に `NextAction.` の日付を書いていなければ、並びは変わらない)
- `@yanqirenshi/ihub.core`: ドックの「Issue の追加」を、ihub.core の部品 `ProjectItemForm` にして公開し、Issue を作るときに、日付と担当を指定できるようにした。(日付: 選んだ Project の `Plan.*`・`NextAction.*` の日付の項目。空は設定しない。担当: 作成先のリポジトリの `assignableUsers` から複数選べ、初めは自分。雛形の `src/operators/ProjectItemForm.js` は消し、ihub.core の部品を使う形に変わった。移らなくても、今のコピーは、そのまま動く) `dependencies` に `@yanqirenshi/markdown.sitter` を移した。
- `@yanqirenshi/ihub.srv`: GitHub の OAuth で認証しても「GitHub に接続していません。」のままになる不具合を直した。(求める権限に `read:user` を足した。画面が接続の確認に使う viewer の問い合わせが `email` を読み、その権限が無いと `INSUFFICIENT_SCOPES` になっていた。すでに認証している人は、この版にしたあと、認証し直す。個人用アクセストークンは、`read:user` の権限を足す)

## 0.4.0 (2026-11)

- `@yanqirenshi/ihub.core`: 艦橋に、Schedule タブを足した。(`panels.bridge.Schedule`。予定の期間 `plan` のあるワークパッケージを、矢羽根 (@yanqirenshi/d3.yabane) で並べる。見るだけ。矢羽根を押すと `/wbs/{id}` へ移る。図の位置と拡大を覚える。`plan` が 1 つも無いときは、書き方の知らせを出す。制限: 同じ WBS の中で期間が重なる矢羽根は、重なって描かれる。d3.yabane 側の件で、[Foolsgolds/Assholes#173](https://github.com/Foolsgolds/Assholes/issues/173)) `dependencies` に `@yanqirenshi/d3.yabane` を足した。(`plan` を書かなければ、何も変わらない)
- `@yanqirenshi/ihub.srv`: ワークパッケージに、任意の `plan: { from, to }` (`'YYYY-MM-DD'`) を書けるようにした。(スキーマと、日付・順序のルール。`ihub-srv check` と API が、誤りを知らせる)
- `@yanqirenshi/ihub.core`: `@yanqirenshi/menubook` を `^0.1.1` に上げた。サイドメニューの見た目と開閉の不具合の修正。アバターが、メニューの上端の枠の中央から右下に 5px ずれていた。メニューの外へマウスを出しても、メニューが閉じないことがあった。選択中・ホバー中の項目の、白い枠の左右の余白が狭くなっていた。(アプリのコードの変更は要らない。`npm update` で menubook も 0.1.1 になる。0.3.2 として出す予定だった分を、この版にまとめた)

## 0.3.1 (2026-11)

- `@yanqirenshi/ihub.core`: 動きの不具合を 4 つ直した。`FrameTabs` が `onChangeTabs` 無しで `TypeError` になる (#124)。`FrameWbsNodeTabs` の WBS の表が、ノードの下ではなく、プロジェクト全体になる (#125)。`TabsSearchParam` が、描画の途中で親の `setState` を呼び、URL の `?tab=` を読まない (#126)。`GithubOAuth` で認証から戻ると、`?tab=` が消える (#127)。見た目とエラーの扱いも 3 つ直した。設計の 3 つのパネルの長い表の下が見えない (#129)。`panels.Loading` が、タブの中でもはみ出す (`width`・`height` の props を足した) (#130)。Scrum の Repositories・Projects と艦橋の Cockpit タブが、GitHub への未接続・読み込みの失敗を知らせない (#131)。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえる。戻り先のクエリのテストを足した)

## 0.3.0 (2026-11)

- `@yanqirenshi/ihub.core`: 「コックピット」のページを、「艦橋 (Bridge)」に改めた。(`pages.Bridge`・`panels.bridge`・設定のページの id `PAGE_BRIDGE`。古い名前の `pages.Cockpit`・`panels.cockpit`・`PAGE_COCKPIT` は、別名として残していて、古い書き方のアプリは、そのまま動く。古い名前は、将来の minor で消すことがある) ページの中の「Cockpit」タブは、名前を変えていない。hub が新しい名前に移るときの書き換え (Router.js の `page.Bridge`・メニューの表示) は、パッケージの CHANGELOG の「利用側への影響」にある。
- `@yanqirenshi/ihub.core`: assemblies の `Account` (使われていない作りかけの部品) の公開をやめて、ファイルも消した。Scrum のページの、中身の無い 4 つのタブ (`timeline`・`gantt-chart`・`issues`・`pull-requests`) を外した。(`pages.Account`・`panels.sogh.Account` は、残している。設定の `tabs.PAGE_SCRUM` でこの 4 つの code を指していたアプリへの影響は、パッケージの CHANGELOG にある)
- `@yanqirenshi/ihub.srv`: スキーマの説明文の「コックピット」を、「艦橋」に直した。(動きは変わらない。版をそろえる)

## 0.2.7 (2026-11)

- `@yanqirenshi/ihub.core`: 図の位置と拡大を、ブラウザ (`localStorage`) に自動で覚えて、次に開いたときに戻すようにした。(ER 図・TM・画面遷移図・システム構成図・Overview。人ごと・ブラウザごとの記憶で、`data/` は変わらない。覚えたものが無いときは、これまでと同じ初めの位置。ほかからデータが変わって図を描き直したときは、初めの位置に戻らず、覚えた位置で描き直す) `useDiagramView` を export した。アプリが足したパネルの図でも使える。`dependencies` に `@yanqirenshi/assh0le` の `^0.5.9` を足した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.6 (2026-11)

- `@yanqirenshi/ihub.srv`: `engines` の `node` を、`>=20.12` から `>=22` にした。(docs の「Node.js 22 以上」と、そろえた。保守期間の終わった Node.js 20 を、対象から外す。動きの変更は無い)
- `@yanqirenshi/ihub.core`: コードの変更は無い。(版をそろえるだけ。README に、docs の版の表へのリンクを足した)

## 0.2.5 (2026-11)

- `@yanqirenshi/ihub.core`: 設定の `diagrams` で、ER 図・TM 図の `grid` (d3.er・d3.ter の設定) を渡せるようにした。(`diagrams: { er: { grid: { draw: false } } }` でグリッド線を消す。設定が無いときは、変わらない)
- `@yanqirenshi/ihub.srv`: `ihub-srv migrate-er` が、`column_type` が `ID` の主キーも識別子にするようにした。(これまでは `IDENTIFIER` だけ。0.2.4 以前で変換したアプリは、元のフラット形式のデータから変換し直すと、主キーが識別子になる)
- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.er` を 0.6.1 にした。(識別子が、テーブルのカラムの先頭に描かれる)

## 0.2.4 (2026-11)

- `@yanqirenshi/ihub.core`: Help の `Slide` を、`HelpSlide` として export した。(Help を書き換えるアプリが、`help.sections` で使える) 「コピー版からの移行」の手順書を、iwo.Studio の移行で分かったことに合わせて直した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.3 (2026-11)

- `@yanqirenshi/ihub.srv`: `ihub-srv migrate-er` が、カラムのインスタンスの名前 (`physical_name` など) を、落とさないようにした。名前の違うインスタンスごとに、別のマスタを作る。0.2.2 以前で変換したアプリは、元のフラット形式のデータから変換し直すと、名前が戻る。
- `@yanqirenshi/ihub.core`: 雛形の `.env.local.template` に、GitHub の OAuth の 2 つの変数の欄を足した。(コードの変更は無い。版をそろえるだけ)

## 0.2.2 (2026-11)

- `@yanqirenshi/ihub.core`: 設計のページの 4 つのパネルが、`start_id` を受け取れるようにし、`panels` から export した。(`panels.DesignPanels` など。設定なしでは、変わらない)
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.1 (2026-11)

- `@yanqirenshi/ihub.core`: 「リストの key が無い」警告 (`SystemicDesign`・BPMN のパレット) を、なくした。(画面の見た目と動きは、変わらない)
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.2.0 (2026-11)

- `@yanqirenshi/ihub.core`: React 19 に対応した。(peerDependencies は `^18.3.1 || ^19.0.0`。React 18 のままでも動く) `tion`・`menubook`・`manipulater`・`sogh` を、MUI を peerDependencies にした版に上げて、`@mui/material` の重複 (MUI 5) をなくした。最初の `npx ... init --app` の `--legacy-peer-deps` は、要らなくなった。peerDependencies から `react-router` を消した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.1.1 (2026-11)

- `@yanqirenshi/ihub.core`: `tion` を 0.1.3 以降にして、アプリの `package.json` の `overrides` を要らなくした。(最初の `npx ... init --app` の `--legacy-peer-deps` は、まだ要る)雛形から `overrides` を消した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(版をそろえるだけ)

## 0.1.0 (2026-11)

iHub のコア (`src/ihub/`) と API サーバー (`server/`) を、npm のパッケージにした、最初の版です。
(切り出し・設定の形・ページのタブとパネルと Help の拡張点・GitHub の OAuth・CLI `ihub-srv`・ER のテーブルの色)

iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](docs/src/content/migrate.md) を見てください。
