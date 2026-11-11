# 更新履歴 (@yanqirenshi/ihub.core)

`@yanqirenshi/ihub.srv` と同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマットを変えるときに、minor を上げます。
(リポジトリ全体の更新履歴は、[ルートの CHANGELOG.md](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) にあります)

## 0.4.0 (2026-11)

艦橋に **Schedule タブ**を足し、WBS のワークパッケージに、予定の期間 (`plan`) を書けるようにしました。(yanqirenshi/iHub#133)
あわせて、`@yanqirenshi/menubook` を `^0.1.1` に上げました。(サイドメニューの見た目と開閉の不具合の修正。yanqirenshi/iHub#140。0.3.2 として出す予定だった分を、この版にまとめた)

### 追加

- 艦橋 (`pages.Bridge`) のタブの最後に、Schedule (code `schedule`) を足した。(Cockpit・Overview・Schedule。初めに開くのは Cockpit のまま。`?tab=schedule` で開ける) パネルは `panels.bridge.Schedule` として公開した。
  - 予定の期間 (`plan`) のあるワークパッケージを、矢羽根 ([@yanqirenshi/d3.yabane](https://github.com/Foolsgolds/Assholes/tree/main/packages/d3.yabane)) で並べる。見るだけ。(期間は、JSON を直接書く)
  - 行になるのは、`plan` のあるワークパッケージを直接持つ WBS。d3.yabane の行は入れ子にできないので、入れ子の WBS は 1 段の行に直し、行の名前に、上の WBS の名前を `/` でつないで入れる。(例: 「開発 / 画面」。長いときは、上の WBS の名前を左から省く。行が 2 つ以上のプロジェクトにあるときは、先頭にプロジェクトの名前) 並びは、WBS の木を上から順にたどった順。
  - 表示する期間は、`plan` の一番早い `from` から、一番遅い `to` まで。前後に 1 週の余白を付ける。目盛りは週。図の幅は、期間に比例する。(最小は 15 週分)
  - 矢羽根 (と、名前の文字) を押すと、そのワークパッケージのページ (`/wbs/{id}`) へ移る。
  - 図の位置と拡大の度合いは、ほかの図と同じく、ブラウザに覚える。(図の code は `schedule`。`useDiagramView('schedule')`)
  - `plan` のあるワークパッケージが 1 つも無いときは、図の代わりに、書き方の知らせを出す。使えない `plan` (`to` が `from` より前・実在しない日) は、描かない。
  - ほかからデータが変わったときは、図を作り直す。(位置と拡大は、覚えた値で戻る)
  - **制限 (d3.yabane 0.1.15)**: 同じ WBS の中で、期間が重なる矢羽根は、同じ高さに重なって描かれる。(d3.yabane 側の制限。d3.yabane が直れば、更新で直る)
- データの形: `data/wbs/workpackages.json` の各レコードに、任意の `plan: { from, to }` (`'YYYY-MM-DD'`) を書けるようにした。(`@yanqirenshi/ihub.srv` 0.4.0 のスキーマとルール)

### 変更

- `dependencies` に `@yanqirenshi/d3.yabane` の `^0.1.15` を足した。(`package-lock.json` では、`dayjs` が 1.11.10 から 1.11.23 に上がる。d3.yabane が `^1.11.11` を求めるため)
- `dependencies` の `@yanqirenshi/menubook` を、`^0.1.0` から `^0.1.1` にした。(下の「修正 (menubook 0.1.1)」)

### 修正 (menubook 0.1.1)

- アカウントのアイコン (アバター) が、メニューの上端の枠の中央から、右下に 5px ずれていたのを、中央に置くようにした。(yanqirenshi/MenuBook#3)
- メニューの外へマウスを出しても、メニューが閉じないことがあったのを、閉じるようにした。(yanqirenshi/MenuBook#3)
  - アバターからメニューへ移ったあと、メニューの外へ出たとき。
  - アバターにホバーしたあと、メニューを通らずに外へ出たとき。
- 選択中とホバー中のメニュー項目で、白い枠の左右の余白が、指定 (11px) より狭くなっていたのを、直した。(リセット CSS の `img { max-width: 100% }` などがかかると起きていた。yanqirenshi/MenuBook#4)

### 変更

- `dependencies` の `@yanqirenshi/menubook` を、`^0.1.0` から `^0.1.1` にした。(直った版を、必ず使うようにするため) `package-lock.json` も 0.1.1 にした。

### 利用側への影響

- `plan` を書かなければ、データも画面も変わらない。(Schedule タブが増えて、「予定の期間 (plan) のあるワークパッケージがありません」と出る) `plan` を書いたワークパッケージが、Schedule タブに出る。
- Schedule タブは、既定のタブとして増える。設定の `tabs.PAGE_BRIDGE` で、タブの一覧 (`list`) を足している・差し替えているアプリでも、増える。出したくないときは、`tabs.PAGE_BRIDGE.list` に `{ code: 'schedule', hidden: true }` を書く。
- アプリの `package.json` に、d3.yabane を足す必要はない。(ihub.core の `dependencies` に入る)
- `npm update` @yanqirenshi/ihub.core @yanqirenshi/ihub.srv` で、menubook も 0.1.1 になる。(`package-lock.json` が menubook 0.1.0 のままのアプリも、ihub.core の下限が `^0.1.1` になったので、更新で 0.1.1 になる)
- アプリのコードの変更は要らない。サイドメニューの配色の設定 (`menuColors` の `background`・`text`・`avatar`) は、これまでどおり効く。
- `Frame.js` の、menubook を上書きする書き方 (`menuColors` の `text`・`avatar` のための CSS) は、3 つの不具合をよけるものではなく、0.1.1 でも使う作り (クラス `pair-color1`・文字の色・アイコンの反転) が変わっていないので、そのまま残した。

### 確かめた

- Schedule タブ: 参照アプリを、別のポートで起動し、入れ子の WBS (プロジェクト → WBS → WBS → ワークパッケージ。WBS が、WBS とワークパッケージの両方を直接持つものも入れた)・plan の無いワークパッケージ・使えない plan・長い名前の行・期間の重なる矢羽根を置いて確かめた。(確かめたあと、データは消した。見本のデータは、変えていない)
  - 行が、WBS の木を上から順にたどった順で、「開発」「開発 / 画面」「開発 / API」「… / とても長い名前の WBS…」と出た。plan の無いワークパッケージは、出なかった。
  - `?tab=schedule` で Schedule タブが開いた。Cockpit・Overview タブは、これまでどおりだった。
  - 矢羽根の図形と、名前の文字の、どちらを押しても、`/wbs/{id}` へ移った。
  - ホイールで拡大し、ドラッグして動かした位置が、`localStorage` (`ihub:iHub:view:schedule`) に入り、読み込み直すと、同じ位置と拡大で戻った。
  - API を通して plan を変えたとき、図が作り直され (矢羽根が動き)、位置と拡大は、そのままだった。
  - plan をすべて消すと、知らせが出た。(サイドメニューにかからない位置) 戻すと、図に戻った。
  - 画面を行き来する間、コンソールのエラーと警告は、出なかった。
- 日付の検査: `to` が `from` より前・実在しない日・形の誤りの plan を、API の書き込みが 400 で断り、理由を日本語で返した。
- menubook 0.1.0 と 0.1.1 を、参照アプリで見比べた。(`package-lock.json` を直す前と、直したあと)
  - アバター: 0.1.0 は、メニューの上端の枠の中心から、右下に (5, 5) ずれていた。0.1.1 は、(0, 0)。
  - 開閉: 0.1.0 は、アバターにホバー → メニューへ移動 → メニューの外へ出ても、開いたまま (アイコン 17 個のまま)。アバターにホバーしたあと、メニューを通らずに外へ出ても、開いたまま。0.1.1 は、どちらも閉じた (17 個 → 0 個)。
  - 選択中の項目の、白い枠の左の余白: 0.1.0 は 2px (枠の幅 78px)。0.1.1 は、指定どおりの 11px (枠の幅 96px)。ホバー中の項目も、11px。
  - 配色: 標準の設定 (背景 `{ r: 157, g: 91, b: 139 }`・文字 `null`・アバター `#A6A5C4`) と、変えた設定 (背景 `{ r: 255, g: 217, b: 0 }`・文字 `#2b2b2b`・アバター `#cc3366`) の、どちらも、背景・選択中の文字の色・アバターの円の色・アイコンの反転が、0.1.0 と 0.1.1 で同じ値だった。
- `npm run build` が通った。

## 0.3.1 (2026-11)

動きの不具合を 4 つと、見た目とエラーの扱いを 3 つ直しました。(yanqirenshi/iHub#124・#125・#126・#127・#129・#130・#131)
どれも、部品に渡す値を、いままでどおりにしているアプリは、そのまま動きます。

### 修正 (動き)

- `FrameTabs`: `onChangeTabs` を渡さずにタブを押すと、`TypeError` になっていたのを、何も起きないようにした。(#124)
- `FrameWbsNodeTabs`: ノードのページ (`pages.WbsNode`) が渡す `wbs_node` (データのレコードそのままで、`_id` と `_class` が無い) を、そのまま渡しても、WBS の表がノードの下だけになり、見出しに種類 (`_class`) も出るようにした。(#125)
  - 0.3.0 までは、`_id` が無いため、表がノードの下ではなく、プロジェクト全体になり、見出しの `_class` の欄が空だった。
  - 中で、`useWbs().get(id)` で、`_id` を持つノードを引き直す。`_id` を持つノードを渡していたアプリは、そのまま動く。(引けないときは、渡されたものを使う)
- `TabsSearchParam`: 初めのタブを、描画の途中ではなく、描画のあと (`useEffect`) に `onChange` で知らせるようにした。(React の「Cannot update a component while rendering a different component」の警告が、出なくなる) (#126)
  - `value` が空のときの初めのタブは、URL の `?tab=` (`tabs` にあるもの)。無い・`tabs` に無い値のときは、先頭のタブにした。(`usePageTabs` と同じ動き)
  - **利用側への影響**: `value` が空で、URL に `?tab=` があるとき、これまでは先頭のタブが選ばれていた。いまは、URL のタブが選ばれる。
  - `onChange` を渡さなくても、`TypeError` にならない。
- `GithubOAuth`: 認証から戻ったときに、`?tab=` などのクエリが消えていたのを、戻るようにした。(`return_to` に、`location.pathname + location.search` を渡す) 例: `/scrum?tab=account` で認証すると、Account タブに戻る。(0.3.0 までは `/scrum` に戻り、既定の Projects タブが開いた) (#127)
  - API サーバー (`@yanqirenshi/ihub.srv` の `safeReturnTo`) は、クエリ付きの戻り先を、もともと受け付けて、そのまま戻す。サーバーの変更は要らない。(テストを足して確かめた)

### 修正 (見た目とエラーの扱い)

- `panels.DesignAssemblies`・`DesignParts`・`DesignEvents`: 長い WBS の表の下が見えなかったのを、見えるようにした。(外側の Box に `height: '100%'`・`overflow: 'auto'` と、下の余白 `pb: 22` を付けた。`DesignPanels` と同じ) (#129)
  - 0.3.0 までは、表が窓より長いと、スクロールできず、下の行が見えなかった。
- `panels.Loading`: 大きさを、`width`・`height` の props で決められるようにした。(既定は、いままでどおり窓の全体 (`100vw`・`100vh`)) タブの中で使っているところ (Scrum の Repositories・Projects タブ、艦橋の Cockpit タブ) は、`'100%'` を渡して、親の大きさに合わせる。(#130)
  - 0.3.0 までは、タブの中でも窓の全体の大きさで、タブの見出しの分だけ、下にはみ出していた。
  - 窓の全体に出すところ (ページの読み込み中: `pages.WbsNode`・`ScrumProject`・`ScrumProjectItem`) は、変えていない。
- Scrum の Repositories・Projects タブと、艦橋の Cockpit タブ: GitHub に接続していないときと、読み込みに失敗したときに、知らせを出すようにした。(#131)
  - 接続していないとき: 「GitHub に接続していません。Account タブから、GitHub に接続してください。」(Account タブ `/scrum?tab=account` へのリンク付き。この URL は、参照アプリのもの)
  - 読み込みに失敗したとき (status が `failed`): 「Repositories を GitHub から読み込めませんでした。(エラーの文章)」と、Account タブへのリンク。
  - `ErrorBoundary` の文を、「取得・表示でエラー」から「表示でエラー」に直した。(読み込み (thunk) の失敗は、`ErrorBoundary` では受け止めないため)
  - **利用側への影響**: GitHub に接続していないとき、3 つのタブの表示が、空の一覧 (Cockpit は、空のカード置き場) から、知らせの文章になる。
  - 知らせの部品 (`panels/sogh/GithubNotice.js`) は、内部のもので、公開していない。

### 確かめた

- 参照アプリを、別のポートで起動し、一時的な確認用のページ (`FrameTabs`・`FrameWbsNodeTabs` を使うもの) で、直す前と後を比べた。(確かめたあと、ページは消した)
  - #124: 直す前は、タブを押すと `onChangeTabs is not a function`。直したあとは、エラーが出ない。
  - #125: 直す前は、表の最初の行が、プロジェクト (`1 iHub`) で、見出しに `WBS` が出なかった。直したあとは、表が、そのノード (`1001 W-A`) とその下だけで、見出しに `WBS` が出た。
  - #126: 直す前は、「Cannot update a component」の警告が出て、`?tab=b` で開いても、タブ A が選ばれた。直したあとは、警告が出ず、`?tab=b` で B が選ばれた。`?tab=` が無いときと、`tabs` に無い値 (`?tab=zzz`) のときは、先頭の A。タブを押すと、URL の `?tab=` が変わる。
  - #127: 直す前は、`/scrum?tab=account` の認証ボタンが、`return_to=/scrum` で API サーバーを呼んだ。直したあとは、`return_to=/scrum?tab=account`。
- `@yanqirenshi/ihub.srv` のテスト (60 件。クエリ付きの戻り先の 2 件を足した) と、参照アプリのビルド (`react-scripts build`) が通った。
- (#129・#130・#131) 別のポートの参照アプリで、直す前と後を比べた。(一時的な確認用のページ・データは、確かめたあとに消した)
  - #129: 60 行の WBS で、直す前は、中間組立品・部品・UI イベントの 3 つのタブで、最後の行が画面の下 (2218px。窓の高さは 768px) にあり、スクロールできなかった。直したあとは、4 つのタブ (パネルを含む) とも、スクロールして、最後の行が見えた。
  - #130: タブの中の Loading は、直す前は、親より 48px (タブの見出しの分) 高く、はみ出した。直したあとは、Repositories・Projects・Cockpit の 3 つで、親とぴったり (はみ出し 0)。props を渡さない Loading は、これまでどおり窓の全体の大きさ。
  - #131: GitHub の状態 (読み込み中・失敗・未接続・成功) を固定して、3 つのタブを確かめた。直す前は、失敗と未接続で、空の一覧 (Cockpit は何も無し) だけだった。直したあとは、失敗と未接続で、上の文章 (Account タブへのリンク付き) が出る。成功 (空) は、これまでどおり。Account タブのリンクを押すと、`/scrum?tab=account` が開き、Account タブが選ばれた。GitHub につながない実際の状態でも、3 つのタブに「GitHub に接続していません。…」が出た。エラーは出なかった。
- 確かめていない: GitHub の実際の接続での読み込みの失敗。(トークンが無いため。Redux の状態を固定して確かめた)
- 確かめていない: GitHub での実際の認証 (OAuth App が無いため)。クライアントが送る `return_to` と、サーバーが戻す先 (テスト) を、別々に確かめた。

## 0.3.0 (2026-11)

「コックピット」のページを、「艦橋 (Bridge)」に改めました。(yanqirenshi/iHub#122)
**古い名前も、別名として残しているので、古い書き方のアプリは、そのまま動きます。**
あわせて、使われていない部品と、中身の無いタブを外しました。(yanqirenshi/iHub#128・#132)

### 変更

- 公開している名前を、cockpit から bridge に改めた。

| 新しい名前 | 古い名前 (別名。そのまま使える) |
|---|---|
| `pages.Bridge` | `pages.Cockpit` (同じ部品) |
| `panels.bridge` (`Monitor`・`Card`・`Overview`) | `panels.cockpit` (同じもの) |
| 設定のページの id `PAGE_BRIDGE` | `PAGE_COCKPIT` |

- 設定の `tabs.PAGE_COCKPIT`・`panels.PAGE_COCKPIT` を書いているアプリも、そのまま効く。`PAGE_BRIDGE` と両方あるときは、`PAGE_BRIDGE` を優先して重ねる。(`tabs` は、古い id の `list` のあとに、新しい id の `list` を重ねる。`selected` は `PAGE_BRIDGE` を優先。`panels` は、同じ code を `PAGE_BRIDGE` が上書きする)
- **古い名前は、将来の minor で消すことがある。** 新しい名前に移しておくとよい。
- 艦橋のページの中の「Cockpit」タブ (自分が担当している GitHub の Issue をカードで並べる) は、名前を変えていない。(code `cockpit`・表示 `Cockpit`)
- 中だけの名前も、bridge に改めた。(ファイル・フォルダ・Redux のスライス。`components/pages/Bridge.js`・`components/panels/bridge/`・`Monitor.js`・`redux/slices/bridgeSlice.js`)
  - Redux のストアのキーは `cockpit` から `bridge` に、アクションの型は `cockpit/fetchIssues` から `bridge/fetchIssues` になった。(ストアは内部のもので、公開している名前ではない。アプリのパネルが `useSelector(s=> s.cockpit)` と読んでいたときだけ、`s.bridge` に直す)
- README の「公開しているもの」の表で、`HelpSlide` の行が 2 回出ていたのを、1 つにした。説明の「コックピット」も、「艦橋」に直した。
- 見本データ (`examples/data/overview/nodes.json`) の、Overview のノードの文字「Cockpit」を、「Bridge」にした。(データの形は変わらない)
- 参照アプリ (雛形のもと): サイドメニューの表示を「コックピット」から「艦橋」に、`src/Router.js` を `<page.Bridge/>` に、`src/config/ICONS.js` のアイコンの名前を `bridge` にした。(アイコンの形は同じ)
  - サイドメニューの項目の code は、`cockpit` のままにした。code は、ドックの Z から切り替えた on/off を保存する個人の設定 (`data/local/account_menus.json`) の鍵なので、変えると、保存した設定が効かなくなるため。

### 削除

- assemblies の `Account` の公開をやめた。ファイル (`components/assemblies/Account.js`・`Account/`) も消した。(使われていない作りかけの部品。yanqirenshi/iHub#128)
  - `pages.Account` (参照アプリの `/account`) と `panels.sogh.Account` (Scrum の Account タブ) は、別のものなので、残している。
  - 3 つの hub (UkiyoSnow・iwo.Studio・Bokasafn) が、この部品を使っていないことは、確かめてある。
- Scrum のページの、中身の無い 4 つのタブ (`timeline`・`gantt-chart`・`issues`・`pull-requests`) を外した。(中身ができるまで。yanqirenshi/iHub#132) タブは、`repositories`・`projects`・`account`・`help` の 4 つになった。初めに開くタブ (`projects`) は、同じ。
  - **利用側への影響**: 設定の `tabs.PAGE_SCRUM` で、この 4 つの code を指していたアプリは、次のようになる。
    1. `list` に書いていたときは、アプリが足したタブとして出る。(パネルは、設定の `panels.PAGE_SCRUM` で足さないと、中身は空。これまでも、既定のタブの中身は空だった)
    2. `hidden: true` で消していたときは、何も起きない。
    3. `selected` に指していて、`list` に書いていないときは、先頭のタブ (`repositories`) になる。
    4. URL の `?tab=issues` などは、初めに開くタブ (`projects`) になる。
  - 設定に書いていないアプリは、4 つのタブが出なくなるだけで、ほかは変わらない。

### 利用側への影響 (hub が新しい名前に移るとき)

どれも、しなくても動く。(古い名前は別名として残している)

1. `src/Router.js`: `<page.Cockpit/>` を `<page.Bridge/>` にする。
2. サイドメニューの表示 (`label`): 「コックピット」を「艦橋」にする。項目の `code` (`cockpit`) は、変えないほうがよい。(個人の設定の鍵。変えると、保存した on/off が効かなくなる)
3. 設定の `tabs`・`panels` で `PAGE_COCKPIT` を使っているときは、`PAGE_BRIDGE` にする。`panels.cockpit` を使っているときは、`panels.bridge` にする。
4. Overview のノードの文字「Cockpit」は、アプリのデータ (`data/overview/nodes.json`) のものなので、変えたいときだけ直す。

### 確かめた

- 参照アプリで、`/` に艦橋のページが出て、サイドメニューに「艦橋」と出た。Cockpit・Overview タブが、これまでどおり動いた。(Overview には、ノード「Bridge」が出た。タブを切り替えると、`?tab=` が変わる)
- 参照アプリを、一時的に古い名前 (`<page.Cockpit/>`・設定の `tabs.PAGE_COCKPIT`・`panels.PAGE_COCKPIT`・`panels.cockpit.Card`・`Monitor`) にして、そのまま動いた。(タブの追加・既定のタブを消す・パネルの差し替えも効いた)
- ビルドした `dist` で、`PAGE_COCKPIT` だけ・`PAGE_BRIDGE` だけ・両方・どちらも無い・ほかのページの設定の 5 つの場合に、`tabs`・`panels` が、上の説明どおりに重なることを確かめた。
- `npm run build`・`ihub-srv check` (参照アプリの `data/` と、`examples/data/`)・`@yanqirenshi/ihub.srv` のテスト (58 件) が通った。
- 参照アプリで、Scrum (`/scrum`) のタブが 4 つ (Repositories・Projects・Account・Help) で、Projects が初めに開く。Account タブの GitHub 接続の部品と、`/account` のページ (`pages.Account`) は、これまでどおり動いた。`?tab=issues` は、Projects になった。
- 外した 4 つの code を設定で指していたときの 4 つの場合 (上の 1. から 4.) を、ビルドした `dist` の `mergeTabs` で確かめた。
- `assemblies/Account` を import しているファイルが、ほかに無いことと、参照アプリのビルド (`react-scripts build`) が通ることを確かめた。
- 確かめていない: GitHub に接続した状態の Cockpit タブ (Issue のカード)。トークンが無いため。(Redux のスライスの改名は、ストアのキー `bridge` を、ページが読めることまで確かめた)

## 0.2.7 (2026-11)

### 追加

- 図の位置と拡大を、ブラウザ (`localStorage`) に自動で覚えて、次に開いたときに戻すようにした。(yanqirenshi/iHub#115)
  - 対象は、ER 図・TM・画面遷移図・システム構成図・Overview の 5 つ。図ごとに別々に覚える。
  - 人ごと・ブラウザごとの記憶で、`data/` は変わらない。鍵は `ihub:{app.name}:view:{図の code}`。(図の code: `er`・`tm`・`std`・`scd`・`overview`。開発中は、どのアプリも `localhost:3000` で開くので、アプリの名前で分けた)
  - 操作が終わったとき (ホイールを止めたとき・ドラッグを離したとき) に覚える。覚えたものが無いとき (初めて開くとき) は、これまでと同じ初めの位置。
  - 覚えた値が壊れているとき・`localStorage` が使えないときは、何も言わずに初めの位置で開く。
  - ほかのタブ・エディタ・git でデータが変わって図を描き直したときは、**初めの位置に戻らず**、覚えた位置で描き直す。(0.2.6 までは、初めの位置に戻った)
  - Overview の、描き直すときに svg の `__zoom` を読んで位置を引き継ぐ処理は、この仕組みに置き換えた。
- `useDiagramView(code)` を export した。アプリが足したパネルの図 (d3.* の `Rectum`) でも、同じように覚えられる。(`const bindView = useDiagramView('dfd'); bindView(rectum);`)

### 変更

- `dependencies` に `@yanqirenshi/assh0le` の `^0.5.9` を足した。(カメラを取り出して戻す `view`・`onViewChange` を持つ版。`package-lock.json` が古いアプリでも、assh0le 0.5.9・d3.svg 0.4.2 以上になる)
- 確かめた: 5 つの図それぞれで、動かして拡大 → ページを読み直す → 同じ位置と拡大で開いた。ほかのタブに移って戻る・ノードのドラッグ・ほかからの変更・インスペクタでの変更 (Overview) の描き直しのあとも、位置は変わらなかった。覚えたものが無いときは、これまでと同じ初めの位置。`app.name` を変えると、位置は混ざらなかった。壊れた値や、`localStorage` が使えないときも、図は出た。

## 0.2.6 (2026-11)

- コードの変更は無い。(`@yanqirenshi/ihub.srv` 0.2.6 と、版をそろえるだけ)
- README の peerDependencies の一覧に、マニュアルの「導入のしかた」の「アプリで入れるパッケージの版」の表へのリンクと、「Node.js は 22 以上」を足した。(`ihub.srv` の `engines` を `>=22` にしたことに合わせた)

## 0.2.5 (2026-11)

### 追加

- 設定に `diagrams` を足した。ER 図・TM 図が、設定の `diagrams.er.grid`・`diagrams.tm.grid` を、d3.er・d3.ter の `new Rectum({ ... })` の `grid` に、そのまま渡す。(例: `diagrams: { er: { grid: { draw: false } }, tm: { grid: { draw: false } } }` でグリッド線を消す。`size`・`span` も、d3 の `grid` の設定として渡せる) ER 図・TM 図は、別々に設定できる。
  - 設定が無いときは、いままでどおり、`grid` を渡さない。(グリッド線が出る)
  - コピー版で、`panels/ER.js`・`TM.js` に `grid: { draw: false }` を足してグリッド線を消していたアプリ (Bokasafn など) が、パネルを差し替えずに移せる。([コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) の手順 6 の表)
  - 書き方は、[カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) の「図のグリッド線を消す」と、この README の「図のグリッド線を消す」

### 変更

- `@yanqirenshi/d3.er` を `^0.6.1` にした。(識別子 (階層形式の `identifiers[]`) が、テーブルのカラムの先頭に描かれる。0.6.0 までは、末尾に描かれていた) `ihub-srv migrate-er` が、`column_type` が `ID` の主キーも識別子にするようになった (`@yanqirenshi/ihub.srv` 0.2.5) ので、変換し直したデータでは、主キーが先頭に描かれる。
  - **利用側への影響**: すでに階層形式のデータ (`IDENTIFIER` の識別子を持つ。例: UkiyoSnow) では、識別子が、末尾から先頭に移る。(データの変更は要らない)

## 0.2.4 (2026-11)

### 追加

- Help の 1 枚のスライド (`components/pages/Help/Slide.js`) を、`HelpSlide` として export した。(`import { HelpSlide } from '@yanqirenshi/ihub.core'`) Help を書き換えるアプリが、`help.sections` のセクションで、コアの内部のファイルをアプリに写さずに使える。(既定の Help は、変わらない) 書き方は、[カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) と、[コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) の手順 6 の「Help を書き換えていたとき」

### 手順書

- [コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) を、iwo.Studio の移行で分かったことに合わせて直した。(iHub#103)
  - 手順 3: 「消すもの」でも、アプリの `src/` が `import` しているもの (`tion`・`@splidejs/react-splide` など) は残す
  - 手順 4: `import` の替え方の表に、`Link`・`GithubOAuth`・`FrameTabs`・`WBSTable`・`parts` のもの・`panels` のもの・`usePageTabs`・`useWbs` を足した。アプリが自分で書いた `src/wbs/P*.js` は、`--only` では替わらず、手で替える。上書きで、アプリが変えたコメントが戻ること
  - 手順 6: Help を `help.sections` に移す例と、アプリの `docs/` (iHub のマニュアルのコピー) の直し方
  - 手順 7: コピーした時期より後の更新で、見た目が変わるところ (WBS の表など)

## 0.2.3 (2026-11)

`ihub-srv migrate-er` (`@yanqirenshi/ihub.srv`) の修正に合わせて、版をそろえた。コードの変更は、雛形だけ。(`migrate-er` の変更は、[ihub.srv の CHANGELOG](https://github.com/yanqirenshi/iHub/blob/main/packages/ihub.srv/CHANGELOG.md))

### 修正

- 雛形の `.env.local.template` (`ihub-srv init --app` が作る) に、GitHub の OAuth の 2 つの変数 (`GITHUB_OAUTH_CLIENT_ID`・`GITHUB_OAUTH_CLIENT_SECRET`) の欄を足した。(OAuth で認証するときだけ要る。これまでは、docs の「GitHub との連携」にだけ書かれていた)

## 0.2.2 (2026-11)

### 追加

- 設計のページ (`PAGE_DESIGN`) の 4 つのパネル (`ui-panels`・`ui-assemblies`・`ui-parts`・`ui-events`) が、`start_id` (この id のノードから下だけの WBS を出す) を、props で受け取れるようにした。(無いときは、これまでと同じ `"1"`。設定なしの設計のページは、変わらない)
- その 4 つのパネルを、`panels` から export した。(`panels.DesignPanels`・`panels.DesignAssemblies`・`panels.DesignParts`・`panels.DesignEvents`)
  - 設定の `panels.PAGE_DESIGN` で、`start_id` を渡して差し替えられる。(これまでは、アプリで、`WBSTable` を使って、パネルの並びを写す必要があった) 書き方は、[カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) と [コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) の手順 6

## 0.2.1 (2026-11)

### 修正

- 「リストの key が無い」警告 (`Each child in a list should have a unique "key" prop.`) を、なくした。(画面の見た目と動きは、変わらない)
  - `SystemicDesign` (システミックデザインのページ): セクションに、`label` の `key` を付けた。
  - BPMN のパレット レベル 1 (`Level1`): 表の行に `name`、画像にファイル名の `key` を付けた。
  - BPMN のパレット レベル 2 (`Level2Table`): 見出しのセルに、添字の `key` を付けた。(見出しの定義に、一意な値が無いため)

## 0.2.0 (2026-11)

React 19 に対応し、MUI 5 の重複をなくしました。

### 利用側への影響

- peerDependencies の `react`・`react-dom` を、`^18.3.1 || ^19.0.0` にした。(これまでは `^18.3.1`) **React 18 のままでも、動きます。** React 19 に上げるときは、アプリの `package.json` の `react`・`react-dom` を `^19.0.0` にして、`npm install` する。(`@testing-library/react` を使っているときは、16 以上)
- `tion` (0.2.0)・`@yanqirenshi/menubook` (0.1.0)・`@yanqirenshi/manipulater` (0.1.0)・`sogh` (0.3.0) を、MUI と Emotion を peerDependencies にした版に上げた。これで、`@mui/material` は、アプリの 1 つだけになる。(これまでは、これらが MUI 5 を持ち込んでいたため、MUI 9 のアプリには、MUI 5 も入っていた。`@mui/lab`・`@mui/x-date-pickers` も入らなくなった)
- 最初の `npx ... ihub-srv init --app` に、`--legacy-peer-deps` が要らなくなった。(0.1.x では、`react` が 19 に解決されて、`ERESOLVE` になっていた)
- peerDependencies から `react-router` を消した。(`react-router-dom` が、必要な `react-router` を持ってくる。`react-router` と `react-router-dom` の版がずれて、2 つ入ると、`useParams` が、別のルーターを見て、`/wbs/{id}` のページが空になるため) アプリの `package.json` に `react-router` を書いているときは、消す。
- `@uiw/react-md-editor` を、`dependencies` から消した。(`sogh` 0.3.0 が、自分の `dependencies` に持つようになった)

### 修正

- `FrameWbsNode` が、`react-router` から `useParams` を読んでいたのを、`react-router-dom` からに直した。(ほかの部品と同じ。`react-router` が、`react-router-dom` と別の版で入っていると、`/wbs/{id}` のページが空になった)
- `examples/wbs/P1033.js` も、`react-router` から読んでいた `useParams` を、`react-router-dom` からに直した。(`examples/wbs/` を `src/wbs/` にコピーして使うと、アプリから `react-router` を外したあと、ビルドが止まるため)

### 雛形

- `examples/app/package.template.json` を、React 19 にした。(`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` は `^0.2.0`、`@yanqirenshi/manipulater` は `^0.1.0`。`react-router` は無くした)

### 動作を確かめた

- React 19.3.1・MUI 9: iHub の参照アプリの全ページ (5 つの図・WBS・Scrum・Help・Account・ドック・サイドメニュー)。`peer` を持たない依存 (`react-measure`・`@splidejs/react-splide`・`@fortawesome/react-fontawesome`・`@yanqirenshi/markdown.sitter`・`@yanqirenshi/beach`・`react-bpmn`・`winbox`) も、動いた。
- React 18 のままの動作は、0.1.x と同じ (コードの変更は、`FrameWbsNode` の import だけ)。

## 0.1.1 (2026-11)

- `tion` を 0.1.3 以降 (`^0.1.3`) にした。`tion` 0.1.3 は、peerDependencies の `react-router-dom` を `^6.0.0 || ^7.0.0` に広げた版で、`react-router-dom` の 7 を使うアプリでも、`overrides` が要らなくなった。(最初の `npx ... ihub-srv init --app` の `--legacy-peer-deps` は、`npx` の一時的な入れ先で `react` が 19 に解決されるため、まだ要る。`package.json` ができたあとの `npm install` には要らない)
- 雛形 (`examples/app/package.template.json`) から、`overrides` を消した。(0.1.0 の雛形で作った `package.json` に、`overrides` が残っていても、害は無い)
- コードの変更は無い。

## 0.1.0 (2026-11)

iHub のコア (`src/ihub/`) を、npm のパッケージにした、最初の版です。
iHub をフォルダごとコピーして使っていたアプリは、[コピー版からの移行](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/migrate.md) を見てください。

### 切り出し

- `src/ihub/` を、パッケージにした。Babel で変換した ESM を `dist/` に入れて配布する。(`type: module` は付けていない。CRA の webpack で、CommonJS のパッケージの既定の import が壊れるため)
- 公開する名前: `IHub`・`createStore`・`ConfigProvider`・`useConfig`・`resolveConfig`・`pages`・`docPages`・`panels`・`Frame` などの中間の部品・`ItemWbsNode` などの小さな部品・`usePageTabs`・`manegers`・`wbs`・`useWbs`・`sogh`・`dataApi` のフック・`fetchRepositories`・`fetchProjectsV2`。
- 雛形を入れた。(`examples/data`・`examples/wbs`・`examples/app`。`ihub-srv init` / `init --app` がコピーする)

### 設定の形

- アプリは、設定 (`config`) を組み立てて、`<IHub config={config}>` に渡す。コアは、アプリのファイルを import しない。
- 設定の項目: `app`・`menus` (必須)・`menuColors`・`colors`・`operators` (必須)・`wbs` (必須)・`tabs`・`panels`・`help`・`github`。
- 書き込んだ画面の id を送るヘッダー名は、`app.name` から作る。(`X-{app.name}-Client`)
- bulma と `index.css` は、`<IHub>` が読む。アプリの `index.css` は、`<IHub>` の import より後に読む。

### 拡張点

- ページのタブとパネルを、設定の `tabs`・`panels` で、足す・差し替える・消せる。`TabbedPage` を公開した。
- Help の内容を、設定の `help.sections` で差し替えられる。

### ER 図

- ER のテーブルの色 (`color: { base, inner }`) に対応した。(`@yanqirenshi/model.er` 0.2.0・`@yanqirenshi/d3.er` 0.6.0)
  `er/entities.json` に書くと、その色で描かれる。インスペクタ (テーブルの見出しを右クリック) の「背景色 (外枠)」「背景色 (内側)」で書き換えられる。書いていないときは、既定の色。

### GitHub の OAuth

- OAuth のトークン (API サーバーが持つ) を先に使い、無ければ個人用アクセストークン (`github.token`) を使う。
- `GithubOAuth` (認証・切断のボタンと状態) を、Scrum のページの Account タブに出す。公開もしている。
