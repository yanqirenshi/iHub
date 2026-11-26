# 更新履歴 (@yanqirenshi/ihub.core)

`@yanqirenshi/ihub.srv` と同じ版にそろえて出します。
版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマットを変えるときに、minor を上げます。
(リポジトリ全体の更新履歴は、[ルートの CHANGELOG.md](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) にあります)

## 0.12.0 (2026-11)

### 追加 (ビジネスのページに、TM のデータを表で見るタブを足す。yanqirenshi/iHub#224)

- ビジネスのページ (`pages.Business`) の既定のタブに、`entities` (Entities)・`identifiers` (Identifiers)・`attributes` (Attributes)・`relationships` (Relationships) を、「TM」と「機能一覧」の間に、この順で足した。(`hooks/usePageTabs.js` の `TAB_DEFS.PAGE_BUSINESS`) 初めに開くタブは、これまでどおり `tm`。
- 4 つのタブは、`data/tm/` の `entities.json`・`identifiers.json`・`attributes.json`・`relationships.json` を、表 (MUI の `Table`) で出す。見るだけ。並びはファイルの順。(並べ替え・絞り込み・編集は無い)
  - Entities: ID・種別・名称・識別子・属性・説明。識別子・属性は、エンティティが持つ行の名前 (行に `name` があればそれ、無ければ参照しているマスタの名前)。
  - Identifiers・Attributes: ID・論理名・物理名・説明。名前が論理名と物理名の組なら、それぞれの列に出す。(片方しか無ければ、無い方は空) 名前が文字列なら、論理名の列に出し、物理名の列は空。(yanqirenshi/iHub#230)
  - Relationships: ID・種類・接続元のエンティティ・接続先のエンティティ・ラベル・サブセット (区分・区分コード)・説明。接続元・接続先は、エンティティの名前。
  - Entities・Relationships の名前は、文字列ならそのまま、論理名と物理名の組なら「論理名 (物理名)」。(同じなら 1 つ) 列の見出しは、TM のインスペクタ (model.tm の `fieldsOf` のラベル) に合わせた。
  - 指す先が見つからない (無い id の) ときは、id をそのまま出す。
  - レコードが無いとき (ファイルが空) は、表の代わりに、知らせを出す。(TM の 4 つのファイルは、スキーマに既定の値が無いので、ファイルが無いときは、これまでどおり API サーバーがデータを返さない)
  - 表がコンテンツエリアより長い・広いときは、表の中でスクロールする。見出しの行は、上に残る。
  - データは、API サーバーから読んだもの (`useCollections`)。TM タブのインスペクタで書き換えると、表も新しい値になる。
- パネル `panels.TmEntities`・`panels.TmIdentifiers`・`panels.TmAttributes`・`panels.TmRelationships` を足した。(`components/panels/tm/TmTables.js`。4 つで同じ表の部品を使う)
- 行の作り方 (名前の解決・論理名と物理名の分け方) は、`manegers/tmTables.js` にまとめ、テストを足した。(`test/tmTables.test.mjs`)
- 雛形の `examples/app/package.template.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、`^0.12.0` にした。
- **利用側から見える違い**:
  - ビジネスのページのタブが 4 つ増える。(Systemic Design / TM / **Entities / Identifiers / Attributes / Relationships** / 機能一覧 / WBS / Help)
  - 設定の `tabs.PAGE_BUSINESS` でタブを足しているアプリでは、足したタブは、これまでどおり末尾に並ぶ。新しい 4 つは、TM と機能一覧の間に入る。
  - 足したタブの code が、新しい 4 つのどれかと同じ (`entities` など) ときは、新しいタブの位置で、アプリのタブに差し替わる。(`mergeTabs` の重ね方。パネルも、設定の `panels.PAGE_BUSINESS` のものが使われる)
  - 新しいタブが要らないときは、`tabs.PAGE_BUSINESS` の `{ code: 'entities', hidden: true }` などで消せる。
  - データの形・設定の形は、変わらない。(データの移行は無い)

### 追加 (FrameWbsNode・FrameWbsNodeTabs: WBS の表の表示/非表示。yanqirenshi/iHub#176)

- WBS のノードのページの枠 `FrameWbsNode`・`FrameWbsNodeTabs` に、props `showWbsTable` を足した。`false` のとき、ノードから下の WBS の表 (`WBSTable`) を出さない。省略したとき (既定は `true`) は、0.11.x までと同じく出す。
  - `FrameWbsNode` では、消えるのは WBS の表だけで、子のノードを追加するフォーム (`AddWbsNode`) は、そのまま出る。

### 追加・変更 (FrameWbsNode・FrameWbsNodeTabs: 見出しの寄せ。yanqirenshi/iHub#176)

- `FrameWbsNode`・`FrameWbsNodeTabs` に、props `headAlign` を足した。見出し (ノードの種類・名前・説明) を、`'left'` (左寄せ)・`'center'` (中央寄せ)・`'right'` (右寄せ) から選べる。
- **2 つの枠の見出しの既定を、中央寄せに変えた。** 0.11.x までは左寄せだった。左寄せのままにするときは、`headAlign="left"` を付ける。(`'left'`・`'center'`・`'right'` 以外の値のときも、中央寄せ)
- 見出しを描く `HeadWbsPage` に、props `align` を足した。`HeadWbsPage` だけを使うときの既定は、0.11.x までと同じく左寄せ。(`'left'`・`'center'`・`'right'` 以外の値のときも、左寄せ)
- 寄せの値を決める処理 (`headAlignOf`) は、`HeadWbsPage` と 2 つの枠で共通に使う。(公開はしていない)
- `headAlign` は、見出しにだけ効く。タブの並びの寄せ (`centered`。0.5.0 以降)・`children`・WBS の表は、変わらない。
- **利用側から見える違い**:
  - `FrameWbsNode`・`FrameWbsNodeTabs` で描く WBS のノードのページの見出しが、**左寄せから中央寄せに変わる。**(専用のページが無いノードを描く雛形の `src/wbs/NotFoundWbsNodeComponent.js` も、`FrameWbsNode` を使っている) 左寄せのままにするページには、`headAlign="left"` を付ける。
  - `showWbsTable`・`headAlign` (と `HeadWbsPage` の `align`) を、props で渡せるようになった。渡さなければ、WBS の表は 0.11.x までと同じく出る。
  - `HeadWbsPage` だけを使っているページの見出しは、変わらない。(左寄せのまま)

## 0.11.0 (2026-11)

### 変更 (インスペクタを開く操作を、右クリックから Ctrl + クリック (Mac は ⌘ + クリック) に変える。yanqirenshi/iHub#222)

- 7 つの図 (ER 図・TM・クラス図・画面遷移図・システム構成図・艦橋の Overview・艦橋の Schedule) で、d3.* に `contextmenu` のコールバックを渡すのをやめ、`click` のコールバックで、Ctrl か ⌘ を押しているときだけ、インスペクタを開くようにした。
  - 判定は `manegers/inspectClick.js` の 1 か所にまとめた。d3.* の `click` の最後の引数 (DOM の MouseEvent) の `ctrlKey || metaKey` が真のときだけ開き、開くと決めたときに `event.preventDefault()` を呼ぶ。(リンクを持つ要素で、ブラウザがリンクを開くのを止めるため)
  - 開くもの: ER 図はテーブルの見出し・カラム。TM はエンティティの見出し・識別子の行・属性の行・結線 (線とラベル)。クラス図は箱・関係の線。システム構成図・画面遷移図・Overview はノード・線。Schedule は矢羽根・WBS の箱・プロジェクトの箱・マイルストーン。
  - Schedule の矢羽根の `click` は、Ctrl・⌘ があればインスペクタ (行き先へは移らない)、無ければ、これまでどおり行き先へ移る。
- `inspectClick(open, otherwise)`・`isInspectClick(event)` を公開した。(`import { inspectClick } from '@yanqirenshi/ihub.core'`。`manegers` からも引ける)
- 判定の関数のテストを足した。(`test/inspectClick.test.mjs`)
- `dependencies` を上げた。(`click` に `event` が渡る版。Foolsgolds/Assholes#253・#254・#257)
  - `@yanqirenshi/d3.er`: `^0.6.2` → `^0.6.6`
  - `@yanqirenshi/d3.ter`: `^0.4.3` → `^0.4.7`
  - `@yanqirenshi/d3.deployment`: `^0.11.1` → `^0.11.5`
  - `@yanqirenshi/d3.sitemap`: `^0.9.1` → `^0.9.4`
  - `@yanqirenshi/d3.unchi`: `^0.10.0` → `^0.10.3`
  - d3.classes (`^0.14.1`)・d3.yabane (`^0.9.0`) は、もとから `click` に `event` が渡るので、上げていない。model.* も、上げていない。
- 間の版で変わったこと (利用側から見える違いは、下の 3 つだけ):
  - 5 つとも: `click` のコールバックの最後の引数に、DOM の MouseEvent が渡る。(Foolsgolds/Assholes#253)
  - d3.ter 0.4.7: 結線の、クリックが届く範囲にポインタが入ると、線の色が変わる。(`relationship.click` を渡したときだけ。左ボタンを押している間は変わらない。Foolsgolds/Assholes#254) iHub は、色を d3.ter の既定 (`#1a73e8`) のまま使う。(設定は足していない)
  - d3.deployment 0.11.5・d3.sitemap 0.9.4・d3.unchi 0.10.3: リンクの部分 (ノードに添えたリンクのアイコンなど) の上でも、Ctrl・⌘ + クリックなら `click` のコールバックを呼ぶ。(修飾キーの無いクリックは、これまでどおりリンクを開く。Foolsgolds/Assholes#257)
  - そのほか (コメントの直し・既定の export のコンポーネントを名前つきでも出す・型の定義・`@babel/preset-react` を d3.er の依存から外す) は、動きを変えない。iHub のコードの直しは要らなかった。
- 雛形の `examples/app/package.template.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、`^0.11.0` にした。
- **利用側から見える違い**:
  - 図の要素の**右クリックでは、インスペクタが開かなくなった。**ブラウザの普通のメニューが出る。
  - インスペクタは、**Ctrl + クリック (Mac は ⌘ + クリック)** で開く。(Mac の Ctrl + クリックは、OS が右クリックとして扱うので、使えない)
  - **TM の結線 (線・ラベル) と、クラス図の関係の線は、クリックだけでは開かなくなった。**Ctrl + クリックで開く。
  - Schedule の矢羽根は、修飾キーの無いクリックでは、これまでどおり行き先へ移る。Ctrl + クリックでは、行き先へは移らず、インスペクタが開く。
  - 画面遷移図などのリンクのアイコンを Ctrl + クリックすると、インスペクタが開き、リンクは開かない。修飾キーの無いクリックでは、これまでどおりリンクが開く。
  - TM の結線は、ポインタが近づくと、線の色が変わる。
  - データの形・設定の形は、変わらない。(データの移行は無い)
- **制限**:
  - ⌘ + クリックは、押している間に 1px でも動くと、クリックにならず、ドラッグかパンになる。(修飾キーの無いクリックと同じ。Ctrl では起きない)
  - 触って操作する端末 (修飾キーの無い端末) では、インスペクタを開けない。
  - Mac の実機では、確かめていない。(`metaKey` のクリックのイベントを送って確かめた)

### 追加 (雛形のアプリに `src/manegers/` を入れる。yanqirenshi/iHub#175)

- 雛形のアプリ (`examples/app/`。`ihub-srv init --app` がコピーする) に、自分で作るデータのマネージャを置くフォルダ `src/manegers/` を入れた。中身は `README.md` だけ。(自分で作る部品を置く `src/components/` (0.6.1 から) と同じ扱い)
  - 雛形にコピーするものの一覧 (`scripts/copy-assets.mjs` の `REF_SRC`) に、`manegers` を足した。参照アプリにも、`src/manegers/README.md` を足した。
  - 0.10.x までの `init --app` で作ったアプリには、このフォルダは無い。自分でデータのマネージャを作るときに、作る。(無くても、動きは変わらない)

## 0.10.1 (2026-11)

### 修正 (TM の結線のラベルをクリックしても、インスペクタが開かない。yanqirenshi/iHub#218)

- `dependencies` の `@yanqirenshi/d3.ter` を `^0.4.3` に上げた。(範囲は、0.10.0 のままでも 0.4.3 を受けられる。下限を上げたのは、lock を持っているアプリが ihub.core を上げたときに、直った版が必ず入るようにするため。0.9.2 と同じ)
- d3.ter 0.4.3 は、結線のラベルのクリックも、結線のクリック (`callbacks.relationship.click`) として知らせるようになった。(Foolsgolds/Assholes#213) d3.ter 0.4.3 から、npm のパッケージにテストと開発用のファイルが入らなくなった。(Foolsgolds/Assholes#212。動きは同じ)
- iHub のコードの変更は無い。(`TM.js` は、`callbacks.relationship.click` を受けているだけ)
- 雛形の `examples/app/package.template.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、`^0.10.1` にした。
- **利用側から見える違い**:
  - TM の結線のラベルの文字の上をクリックすると、結線がインスペクタに開く。(0.10.0 までは、ラベルの上では開かず、線の上か、線の近くをクリックする必要があった)
  - 線の上・線の近く (線から約 4.5px) のクリックは、変わらない。
  - データの形・設定の形は、変わらない。(データの移行は無い)

## 0.10.0 (2026-11)

### 追加 (艦橋の Schedule タブ: マイルストーンを △ で描く。yanqirenshi/iHub#216)

- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.9.0` に、`@yanqirenshi/model.yabane` を `^0.2.0` に上げた。
- `master_schedule/milestones` (`data/master_schedule/milestones.json`。`{ id, name, date, parent か project, description?, background?, stroke?, font? }`) を読み、WBS かプロジェクトの行の中の、`date` の位置に、△ と名前を描く。(d3.yabane 0.9.0 の `milestones`) 矢羽根やほかのマイルストーンと横に重なるものは、d3.yabane が下の段へ積む。
- 置く行の決め方は、ワークパッケージと同じ。(`parent` があれば `parent` の WBS だけを見る。無ければ `project` のプロジェクト) `date` が実在しない日・置く行が見つからないものは、描かない。(`ihub-srv check` が知らせる誤り)
- 表示する期間に、マイルストーンの日付を入れる。(これまでは、ワークパッケージの一番早い `from` と一番遅い `to` だけから決めていた) ワークパッケージの期間の外のマイルストーンも、描かれる。
- ワークパッケージが 1 つも無くても、描けるマイルストーンがあれば、図を描く。(知らせ「予定がありません。」は、どちらも無いとき)
- △ は、押しても何もしない。(行き先は持たない) 右クリックで、インスペクタを出す。(d3.yabane 0.9.0 の `events.milestone.contextmenu`) 項目は model.yabane の `fieldsOf` で、名称・ID (読むだけ)・親の WBS・親のプロジェクト (読むだけ)・日付・背景色・枠線の色・枠線の太さ・枠線の種類・文字の大きさ・文字の色。並び順 (`order`) は、ほかと同じく出さない。
- 保存は、ほかと同じ。(変えた項目だけを `PATCH /api/master_schedule/milestones/{id}` で保存する) 日付に実在しない日を入れたときは、インスペクタが誤りを出して、保存しない。
- `manegers/schedule.js`: `SCHEDULE_COLLECTIONS` に `master_schedule/milestones` を足した。`buildScheduleData` は `milestones` を返し、`count` (図を描くかの判定) にマイルストーンを数え、`first`・`last` にマイルストーンの日付を入れる。
- `buildScheduleData` のテストを足した。(`npm test -w @yanqirenshi/ihub.core`。ihub.core の初めてのテスト。node の `node:test` で、`src/manegers/schedule.js` をそのまま読む)
- 雛形の `examples/app/package.template.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、`^0.10.0` にした。
- **利用側から見える違い**:
  - `milestones.json` が無いアプリでは、0.9.2 と同じに描く。(データの移行は無い)
  - `milestones.json` を書くと、△ が出る。マイルストーンの日付がワークパッケージの期間の外にあると、表示する期間が広がる。
  - 設定の形は、変わらない。

## 0.9.2 (2026-11)

### 修正 (クラス図の関係の線・TM の結線の当たりが、縮小すると狭くなる。yanqirenshi/iHub#212)

- `dependencies` の `@yanqirenshi/d3.classes` を `^0.14.1` に、`@yanqirenshi/d3.ter` を `^0.4.2` に上げた。(範囲は、0.9.1 のままでも、この 2 つを受けられる。下限を上げたのは、lock を持っているアプリが ihub.core を上げたときに、直った版が必ず入るようにするため)
- 2 つとも、線に重ねる透明な当たりの線を、`vector-effect: non-scaling-stroke` で描くようになった。(Foolsgolds/Assholes#209) 当たりの太さが、図の拡大率ではなく、画面の px で決まる。
- iHub のコードの変更は無い。(当たりの太さ `style().relationship.hit.width` を設定しているところは無い)
- 雛形の `examples/app/package.template.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、`^0.9.2` にした。
- **利用側から見える違い**:
  - クラス図の関係の線と、TM の結線の当たりが、拡大率に関わらず、線から約 4.5px になった。(0.9.1 は、図と一緒に拡大・縮小して、100% で約 4.5px、50% で約 2px、25% で約 1px だった。100% の約 4.5px は、0.9.1 の項目と README で「約 4px」と書いたものと同じ当たり)
  - 100% のときの動きは、変わらない。
  - 100% より拡大したときは、当たりが 0.9.1 より狭くなる。(200% のとき、画面の上で、約 9px から約 4.5px に)
  - データの形・設定の形は、変わらない。(データの移行は無い)

## 0.9.1 (2026-11)

### 修正 (雛形のアプリの package.json の iHub の版。yanqirenshi/iHub#207)

- `examples/app/package.template.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、`^0.6.0` から `^0.9.1` にした。(`ihub-srv init --app` は、0.9.1 から、この版ではなく、動かしている版を書く。雛形の版は、パッケージの版とそろっていることを、`@yanqirenshi/ihub.srv` のテストで確かめる)
- 画面の部品の変更は無い。

### 変更 (クラス図: 図の知識を `@yanqirenshi/model.classes` に、操作の受け取りを d3.classes のコールバックに替える。yanqirenshi/iHub#206)

- `dependencies` の `@yanqirenshi/d3.classes` を `^0.14.0` に上げ、`@yanqirenshi/model.classes` `^0.1.0` を足した。
- インスペクタの項目・入力の検証・patch への変換 (`withDefaults`・`fieldsOf`・`titleOf`・`applyPatch`・`movePatch`) は、`manegers/classes.js` から model.classes に移った。(iHub のコードを移したもので、項目・文言・保存する patch は変わらない) `manegers/classes.js` に残るのは、iHub 固有のもの (`CLASSES_COLLECTIONS`・`buildClassesData`・設定によるヘッダーの色 `headerOf`) だけ。
- 箱のドラッグの終わり・箱の右クリック・関係の線のクリックと右クリックは、DOM のリスナーで拾うのをやめ、d3.classes 0.14.0 のコールバック (`callbacks.class.dragend`・`callbacks.class.contextmenu`・`callbacks.relationship.click`・`callbacks.relationship.contextmenu`) で受ける。
- 動かした位置は、移動量 (`dragend` の `{ dx, dy }`) を、id で引いた保存済みのレコードの位置に足して保存する。(d3.classes 0.14.0 は、入力の `position` を書き換えない) 動かさずに離したとき (クリック) は、これまでどおり保存しない。
- クラス・属性・メソッドの名前は、文字列でも組でも、そのまま d3.classes に渡す。(d3.classes 0.14.0 が両方を受ける)
- **利用側から見える違い**:
  - 関係の線は、クリックでも右クリックでも開ける。(右クリックは 0.9.0 でも開けた。線の右クリックでブラウザのメニューが出ないのも、0.9.0 と同じ)
  - 関係の線の当たりが、線から 6px 以内から、約 4px 以内 (d3.classes が重ねる、透明な 9px の線) になった。これまでの 6px は画面の上の距離だったが、新しい当たりは図と一緒に拡大・縮小する。(拡大が 100% のとき約 4px、縮小して 58% のときは約 2.5px)
  - データの形・設定の形は、変わらない。(データの移行は無い)

## 0.9.0 (2026-11)

### 追加 (艦橋の Schedule タブ: 右クリックで、インスペクタを出して書き換える。yanqirenshi/iHub#204)

- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.8.0` に上げ、`@yanqirenshi/model.yabane` `^0.1.1` を足した。
- 矢羽根 (ワークパッケージ)・WBS の箱・プロジェクトの箱を右クリックすると、コンテンツエリアの右端に、インスペクタ (colonoscope の `ModelInspector`) を出す。(d3.yabane 0.8.0 の `events.reaf.contextmenu`・`events.branch.contextmenu`・`events.project.contextmenu`。ブラウザのメニューは出ない。図の何も無いところでは、これまでどおりブラウザのメニューが出る)
- 作りは、Overview タブと同じ。編集できる項目・検証・patch への変換・d3.yabane の既定の見た目は、model.yabane (`fieldsOf`・`applyPatch`・`withDefaults`・`titleOf`) が決める。iHub は、model が返す `{ collection, id, patch }` を `PATCH /api/master_schedule/{collection}/{id}` で保存するだけ。
- 出す項目: 名称・ID (読むだけ)・背景色・枠線の色・枠線の太さ・枠線の種類・文字の大きさ・文字の色。WBS とワークパッケージは、親の WBS・親のプロジェクト (読むだけ)。ワークパッケージは、予定の開始日・終了日。並び順 (`order`) は出さない。(iHub は、プロジェクトと WBS を、ファイルの配列の順で並べる)
- インスペクタに出すレコードは、読み込んだデータ (`master_schedule/projects`・`wbs`・`workpackages`) から id で引く。(d3.yabane に渡したデータは、名前を省略したり、親を付け替えたりしているので、使わない)
- 「適用」で、変えた項目だけを保存し、図を作り直す。位置・拡大・サイクル・1 目盛りの幅は、変えない。(位置をまだ覚えていないときは、今の位置を覚えてから作り直す) 名前を変えたときは、名前の列の幅も、新しい名前に合う。
- 入力の誤り (終了日が開始日より前・日付でない・色でない など) と、保存の失敗は、図の上に知らせる。(保存しない)
- インスペクタを開いているあいだは、右上の「− 100% ＋」と「日・週・月」を、インスペクタの左へずらす。(押せる) サイクルや幅を変えても、インスペクタは開いたまま。ほかからデータが変わって、選んでいたレコードが無くなったら、閉じる。
- 矢羽根の左クリック (行き先へ移る) は、これまでどおり。
- **利用側への影響**: Schedule タブで、データを書き換えられるようになる。(これまでは見るだけ) データの形・設定の形は、変わらない。

## 0.8.3 (2026-11)

### 変更 (艦橋の Schedule タブ: 行の区切り線。d3.yabane 0.7.0。yanqirenshi/iHub#202)

- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.7.0` に上げた。
- 行の区切り線を、最上位の箱どうしの間に加えて、入れ子の子どうし (子の WBS・親の箱の直下のワークパッケージの帯) の間にも引くようになった。(d3.yabane 0.7.0 の変更。子どうしの線は、間の真ん中の高さに、親の箱の右端から時間軸の右端まで。同じ帯の中の段の間には、引かない) 色は、これまでどおり `style.body.row.stroke.color` (`#aaa`)。
- iHub のコードの変更は無い。(d3.yabane の入力の形・`Rectum` の使い方は、変わっていない)
- **利用側への影響**: 入れ子があるとき、区切り線が増える。入れ子の無いデータは、0.8.2 と同じ見え方。

## 0.8.2 (2026-11)

### 変更 (艦橋の Schedule タブ: d3.yabane 0.6.0。yanqirenshi/iHub#198)

- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.6.0` に上げた。
- 初めの拡大の度合いを、描いたあとの実際の幅で決め直す作り (位置を覚えていないとき) を、d3.yabane の描き終わりを知らせる口 `rectum.onDraw(fn)` で受けるようにした。(0.8.1 の、Rectum の `draw` を包む作り (`onFirstDraw`) は、やめた) 初めの 1 回だけ使うので、呼ばれた中で `onDraw(null)` で外す。動きは 0.8.1 と同じ。
- 図を作り直すとき (サイクル・幅・データが変わったとき) は、前の図が測った名前の幅 (`rectum.labelWidths()`) を、新しい Rectum に渡す (`new Rectum({ labelWidths })`)。測り直しの描き直しが要らず、1 度の描画で済む。(前の図が無いとき (初めて開いたとき) は、渡さない。名前を書き換えたときは、新しい名前だけ、d3.yabane が測って描き直す)
- 現在線: 今日が表示する期間の外のときは、出なくなった。(d3.yabane 0.6.0 の直し。iHub のコードの変更は無い。0.8.1 までは、時間軸の外に出ていた)
- **利用側への影響**: 無い。(現在線が、時間軸の外に出なくなるだけ)

## 0.8.1 (2026-11)

### 追加 (艦橋の Schedule タブ: 1 目盛りの幅を、画面から変える。yanqirenshi/iHub#192)

- Schedule タブの右上の「日・週・月」のボタンの左に、1 目盛り (1 日・1 週・1 か月) の幅を変える「−」「＋」のボタンを置いた。(これまでは 111 で固定)
  - 幅は、決まった段を上り下りする。段は `50%`・`75%`・`100%`・`150%`・`200%`・`300%`・`400%`。(100% = これまでの 111。初めは 100%) ボタンの間に、今の段を出す。いちばん端の段では、その向きのボタンを押せない。
  - 選んだ段は、サイクルごとに、ブラウザの `localStorage` に覚える。鍵は `ihub:{app.name}:schedule:width:{d|w|M}`。覚えたものが無い・壊れている・段に無い値・`localStorage` が使えないときは、100%。
  - 変わるのは、時間軸の横の長さ (`scheduleScale` の `size` = 目盛りの数 × 111 × 段) だけ。表示する期間・行の高さ・名前の列の幅は、変わらない。初めの拡大の度合いは、変えたあとの `size` で決める。
  - 幅を変えたときは、画面の中央にあった日付が、ほぼ中央に残るように、図の位置の横だけを合わせて保管してから、図を作り直す。(拡大の度合いと縦の位置は、そのまま。中央が名前の列のときは、合わせない) 位置をまだ覚えていないとき (開いてから、動かしていないとき) は、今、画面に出ている位置と拡大の度合いを元にする。(拡大の度合いが変わらないので、1 目盛りの画面の幅が、段のとおりに変わる) 図の位置は、これまでどおりサイクルごとに覚え、幅の段ごとには分けない。
  - 幅を変えずに開いたときの初めの拡大の度合いは、その段の `size` で決める。(図の全体が画面に収まる度合い。式は、これまでのまま)
  - 100% より狭い段では、目盛りの見出し (d3.yabane の `style.head.cycle`) の文字の大きさ (既定 26) と、線から文字までの間 (既定 6) を、段に比例して小さくする。(隣の見出しと重ならないように。50% で 13) 100% 以上の段は、これまでと同じ見出し。
- `manegers/schedule.js`: `scheduleScale(data, cycle, width)` に、幅の段の引数を足した。(既定は 100。0.8.0 と同じ幅) `SCHEDULE_WIDTHS`・`DEFAULT_WIDTH`・`isWidth`・`unitWidth`・`stepWidth`・`headOfWidth`・`viewForWidth`・`WIDTH_KEY`・`readWidth`・`writeWidth` を足した。
- `manegers/diagram.js`: 保管した図の位置を、図の外から読み書きする `readDiagramView`・`writeDiagramView` を足した。
- データの形・設定の形は、変わらない。

### 変更 (艦橋の Schedule タブ: 名前の列の幅を、名前に合わせる。d3.yabane 0.5.0。yanqirenshi/iHub#194)

- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.5.0` に上げた。(名前の列 (プロジェクト・WBS) の幅が、列ごとに、描いた名前の幅に合う。左の余白 33 + 名前の幅 + 右の余白 33。時間軸の始まる位置も、それに合わせて変わる)
- 名前を、省略せずに d3.yabane に渡すようにした。(これまでは、決まった箱の幅 (555・333) に収まるように、末尾を `…` にしていた) 全角 30 文字ぶん (全角 1・半角 0.55 として数える) を超える名前だけ、末尾を `…` にする。(極端に長い名前で、列が広がりすぎないように)
- `style.body.row.w` (1 列の幅。名前の列が 1 つのとき 555、2 つ以上のとき 333) は、名前を測れなかった列の幅と、描く前の見積もりにだけ使う。(値は 0.8.0 のまま)
- 初めの拡大の度合い: 描いたあと (d3.yabane が名前を測って列の幅を決め、描き直したあと) の、実際の時間軸の右端で決め直す。(図の全体が画面に収まる度合い。下限 0.1・上限 0.4 は、これまでのまま) 位置を覚えているときは、覚えた位置のまま。
- 幅を変えたときの位置合わせ (`viewForWidth`) の時間軸の左端 (`start_x`) を、見積もり (`columnsWidth(columns) + ROW_MARGIN`) から、画面に出している図の実際の値 (`rectum.scale().range()[0]`) にした。
- `manegers/schedule.js`: `labelUnits` を消した。`LABEL_MAX_UNITS` を 14 から 30 にして、export した。`columnsWidth` の 2 つ目の引数 (`span`) を消した。(描く前の見積もりにだけ使う)
- **利用側への影響**: 名前の列の幅が、0.8.0 と変わる。(名前が短ければ細く、長ければ太く。0.8.0 で `…` になっていた名前も、30 文字ぶんまでは全部出る) データの形・設定の形は、変わらない。

### 利用側への影響 (0.8.1)

- 名前の列の幅が、名前に合うようになる。(#194) それ以外は、0.8.0 と同じ見え方。(1 目盛りの幅が 100% のとき)

## 0.8.0 (2026-11)

### 変更 (艦橋の Schedule タブ: プロジェクト・WBS の入れ子・見た目。yanqirenshi/iHub#188・#190)

- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.4.0` に上げた。(入力の `projects` で、プロジェクトをいちばん左の列に描ける)
- Schedule タブが読むコレクションを、d3.yabane の入力と同じ 3 つにした。`master_schedule/projects` (新しい)・`master_schedule/wbs` (0.7.0 の `rows`)・`master_schedule/workpackages` (0.7.0 の `items`)。`Pippala().build(from, to, { projects, wbs, workpackages })` で渡す。
  - プロジェクト: いちばん左の列に描く。WBS とワークパッケージは、`project` でプロジェクトの直下に入る。(`parent` があれば、`parent` が優先。d3.yabane と同じ)
  - WBS の入れ子 (`parent`): 深さごとに列が分かれる。ワークパッケージは、どの深さの WBS にも置ける。
  - 見た目: プロジェクト・WBS・ワークパッケージの `background`・`stroke`・`font` (d3.yabane の共有型) を渡す。
  - 並び: プロジェクトは `projects.json` の順、WBS は `wbs.json` の順 (配列の順を `order` として渡す)。子の WBS を持つ箱の直下のワークパッケージは、子の WBS のあとに、開始日の順で並ぶ。(d3.yabane のショーケースは `order` を書かず開始日の順なので、サンプルの `Task 1200` の位置は、ショーケースと違う)
  - 名前の列: 名前の列が 2 つ以上になるとき (プロジェクトの下に WBS がある・WBS の入れ子がある) は、1 列の幅を 333 にした。(1 列のときは、0.7.0 と同じ 555) 名前は、箱の幅 (子の WBS を持たない箱は、右端の列まで伸びる) と `font.size` に合わせて、末尾を `…` にする。初めの拡大の度合いは、名前の列の全体の幅も入れて決める。
  - 無い先を指す WBS・輪になった入れ子は、描くときは最上位として扱い、無い先を指すワークパッケージは描かない。(`ihub-srv check` が知らせる誤り。d3.yabane に輪を渡さない)
  - ワークパッケージの `result`・`progress` は、d3.yabane に渡さない。(描かない)
  - 予定が無いときの知らせを、新しいファイルの名前 (`wbs.json`・`workpackages.json`) にした。
- `manegers/schedule.js`: `SCHEDULE_COLLECTIONS` を 3 つのコレクションにした。`buildScheduleData` は、`projects`・`wbs`・`workpackages`・`columns` (名前の列の数) を返す。(0.7.0 の `rows` は無くなった) `wbsParents`・`rowColumnWidth`・`columnsWidth`・`labelUnits`・`NESTED_ROW_WIDTH`・`COLUMN_GAP` を足した。
- 参照アプリの `data/master_schedule/` に、d3.yabane のショーケースのサンプル (Foolsgolds/Assholes の `showcase/src/demos/data/yabane/` の `projects.json`・`wbs.json`・`workpackages.json`) を、そのまま入れた。(雛形 `examples/data/` には入れていない)
- **利用側への影響 (0.7.0 から)**: `data/master_schedule/rows.json` は `wbs.json` に、`items.json` は `workpackages.json` に、名前を変える。(中身は、そのまま使える。古い名前のファイルがあると、`ihub-srv check` が知らせる) プロジェクト・入れ子・見た目を書かなければ、0.7.0 と同じ見え方。`@yanqirenshi/ihub.srv` 0.8.0 とセットで使う。

## 0.7.0 (2026-11)

### 変更 (図のグリッド線を、既定で描かない。yanqirenshi/iHub#186)

- d3.* で描く 7 つの図 (ER 図・TM・クラス図・画面遷移図・システム構成図・艦橋の Overview・艦橋の Schedule) で、グリッド線を描かないのを既定にした。(d3.* に `grid: { draw: false }` を渡す)
- 設定の `diagrams` に、`std` (画面遷移図)・`scd` (システム構成図)・`overview`・`schedule` を足し、7 つの図とも `diagrams.{図}.grid` で上書きできるようにした。(名前は、図の位置を覚える code と同じ) 既定の `{ draw: false }` に、設定の `grid` を重ねる。`classes.header` など、今ある設定は、そのまま。
- `DEFAULT_CONFIG.diagrams` は、7 つの図の `{ grid: { draw: false } }` になった。`DIAGRAMS` (図の名前の一覧) を `config.js` に足した。
- **利用側への影響**: グリッド線を出していたアプリ (設定に何も書いていないアプリ) は、出なくなる。出したいときは、設定に `diagrams: { {図}: { grid: { draw: true } } }` を書く。すでに `{ draw: false }` を書いているアプリ (Bokasafn の hub など) は、そのままでよい。(消しても同じ)

### 追加 (艦橋の Schedule タブ: サイクル (日・週・月) の切り替え。yanqirenshi/iHub#184)

- Schedule タブの右上に「日・週・月」のボタンを置き、時間の目盛りのサイクルを切り替えられるようにした。(これまでは、週で固定)
  - 選んだサイクルは、ブラウザの `localStorage` に覚える。鍵は `ihub:{app.name}:schedule:cycle`。覚えたものが無い・壊れている・`localStorage` が使えないときは、週。
  - 1 目盛り (1 日・1 週・1 か月) の幅を、どのサイクルでも 111 (これまでの 1 週の幅) にそろえる。(`size` = 目盛りの数 × 111。月は、時間に比例する軸なので、月の日数で少し違う)
  - 表示する期間の前後の余白を、サイクルごとに 1 目盛りずつにした。(これまでは 1 週ずつ) 目盛りの最小の数は、日 28・週 15 (これまでと同じ)・月 12。足りないときは、右へ延ばす。(これまでは、図を引き伸ばしていた)
  - 図の位置と拡大は、サイクルごとに分けて覚える。(図の code は `schedule:d`・`schedule:w`・`schedule:M`。0.6.x までの `schedule` で覚えたものは、見出しの高さが変わったので、使わない) 初めの拡大の度合いも、サイクルごとの幅で決める。
  - `manegers/schedule.js`: `SCHEDULE_CYCLES`・`DEFAULT_CYCLE`・`UNIT_WIDTH`・`scheduleScale` (サイクルごとの表示期間と幅)・`readCycle`・`writeCycle`・`CYCLE_KEY` を足した。`buildScheduleData` は、サイクルによらない部分 (行・予定・行き先・予定の一番早い日と遅い日 `first`・`last`) を返す形にした。`SCHEDULE_CYCLE`・`WEEK_WIDTH` は、無くした。
- `dependencies` の `@yanqirenshi/d3.yabane` を `^0.3.0` に上げた。(日・週の見出しが出る。Foolsgolds/Assholes#180)
  - 日・週では、目盛りの見出しが 1 段増え、月の見出しが上の段に動く。見出しは、図の座標で -112 まで上に伸びるが、初めの位置 (上から 60px・拡大 0.4 まで) に収まる。(画面で確かめた)
  - 週の点線が、図の右端にも 1 本引かれる。(d3.yabane 0.3.0)
  - d3.yabane 0.3.0 は、行を `order` の順 (無ければ開始日の順) に並べるので、`rows.json` の順を `order` にして渡す。同じ行の予定は、これまでどおり開始日の順に並べ、重なるものを下の段へ回す。(`order` は渡さない)
  - 行の箱は、d3.yabane 0.3.0 で `rect` から `path` になった。(見た目は同じ。予定の無い行にも、箱が出るようになった)

### 変更 (艦橋の Schedule タブのデータを、WBS から切り離す。yanqirenshi/iHub#182)

- 艦橋の Schedule タブ (d3.yabane の矢羽根) が見るデータを、WBS のワークパッケージの `plan` から、新しい **`data/master_schedule/`** に替えた。予定は WBS とは別のファイルで管理し、WBS に無い予定も書ける。
  - `master_schedule/rows` (行) と `master_schedule/items` (予定)。どちらも、ファイルが無くてもよい。(無いときは、予定が無いものとして、知らせを出す)
  - 行は、`rows.json` の並びのまま、上から行になる。(これまでの、WBS の入れ子を 1 段の行に直す処理は、無くなった) 予定の無い行も出す。行の名前が長いときは、末尾を `…` にする。
  - 予定: `{ id, parent (行の id), name, plan: { from, to }, wbs?, url?, description? }`。表示する期間・目盛り・幅・段への分かれ方・図の位置と拡大を覚える作りは、これまでどおり。
  - 矢羽根を押したとき: `wbs` があれば `/wbs/{id}` へ、`url` (`http`・`https` だけ) があれば新しいタブ (`noopener`) で開く。どちらも無ければ、何もしない。(これまでは、いつも、ワークパッケージのページへ移った)
  - 予定が 1 つも無いときの知らせを、`data/master_schedule/rows.json`・`items.json` の書き方にした。
  - `manegers/schedule.js`: `SCHEDULE_COLLECTIONS` を `master_schedule/rows`・`master_schedule/items` にした。`rowLabel` は、名前 1 つを受け取る形になった。`linkOf` (押したときの行き先) を足した。
- **利用側への影響 (データの形が変わるので 0.7.0)**:
  - ワークパッケージの `plan` は、**使えなくなる**。書いてあると、`ihub-srv check` と API の書き込みが、誤りにする。(`plan` を書いていたデータは、`data/master_schedule/` の予定に移して、ワークパッケージからは消す。2026-11-17 に確かめたところ、iHub・雛形・3 つの hub のデータには、まだ書かれていない)
  - ワークパッケージで予定を書いていたときの移し方: 行 (これまで、行になっていた WBS) を `rows.json` に、ワークパッケージの `name`・`plan` を `items.json` に書く。(`parent` は行の `id`。押したときに、これまでどおり、ワークパッケージのページへ移したいときは、`wbs` にワークパッケージの `id` を書く)
  - 見本の予定は、参照アプリ・雛形の `data/` には、足していない。(ファイルが無くても動く)
- `@yanqirenshi/ihub.srv` 0.7.0 とセットで使う。(`master_schedule` のスキーマとルールは、ihub.srv にある)

## 0.6.1 (2026-11)

### 修正 (サイドメニュー: yanqirenshi/iHub#177)

- サイドメニューで、選択中 (とホバー中) の項目の白い枠の上下の余白が、ほぼ無かった不具合を直した。(文字とアイコンが、白い枠の上下の端に付いて見えていた)
  - 原因: サイドメニューの部品 (@yanqirenshi/menubook 0.1.1) の項目は、外の枠が高さ 33px・余白 4px で、`box-sizing` を指定していなかった。iHub が読み込む bulma がページ全体を `box-sizing: border-box` にするため、外の枠の 33px に余白が含まれ、白い枠が 25px に縮んでいた。(文字の行の高さは 24px)
  - menubook 0.1.3 で直った。(`box-sizing` を明示し、選択中・ホバー中は、白い枠を 33px にして、外の枠を 41px・上下の margin -4px にする。白い枠の周りに 4px の縁取りが一周し、1 行の高さは 33px のまま) `dependencies` の `@yanqirenshi/menubook` の下限を、`^0.1.1` から `^0.1.3` に上げた。(直った版を、必ず使うようにする)
  - menubook 0.1.2 は、上下の余白は付くが、白い枠の上下の縁取りが消えるので、使わない。
  - 1 行の高さ (33px)・メニュー全体の高さ・未選択の項目の見た目は、変わらない。ホバーしても、項目の並びは動かない。iHub のコードの変更は無い。
  - **利用側への影響**: ihub.core の次の版を待たずに直したいときは、アプリで `npm update @yanqirenshi/menubook` を実行して、menubook を 0.1.3 にする。(`^0.1.1` の範囲に入るので、`package.json` は変えなくてよい)

### 追加 (雛形のアプリ: `src/components/`)

- 雛形のアプリ (`examples/app/`。`ihub-srv init --app` がコピーする) に、自分で作る部品を置くフォルダ `src/components/` (`assemblies/`・`pages/`・`panels/`・`parts/`) を入れた。中身は、それぞれの `README.md` だけ。
  - これまでは、参照アプリにはあるが、雛形にコピーするものの一覧 (`scripts/copy-assets.mjs` の `REF_SRC`) に無かったので、雛形から作ったアプリには無かった。

## 0.6.0 (2026-11)

### 修正 (クラス図: yanqirenshi/iHub#171)

- クラス (`/classes`) のページの「クラス図」タブ (`?tab=class-diagram`) に、何も描かれない不具合を直した。
  - 原因: `PAGE_CLASSES` のタブには `class-diagram` があり、初めに選ばれるタブもこれだが、Classes ページのパネルの表には `wbs` と `help` しか無かった。`TabbedPage` は、表に無い code のタブを選ぶと、何も描かない。(エラーも出ない) そもそも、クラス図を描くもの (データのコレクション・描画のライブラリ・パネル) が、iHub 本体に無かった。
  - Classes ページのパネルの表に、`class-diagram` → クラス図のパネル (`panels.Classes`) を足した。

### 追加 (クラス図)

- クラス図のパネル `panels.Classes` を足した。`data/classes/` のデータを、`@yanqirenshi/d3.classes` で描く。(TM と同じ流儀)
  - 箱をドラッグすると、動かした位置を `classes/classes` の `position` に PATCH で保存する。(整数に丸める)
  - 箱を右クリックするとクラスを、線をクリック (か右クリック) すると関係を、右端のインスペクタ (colonoscope の `ModelInspector`) に出し、書き換えられる。(クラス: 名前・ステレオタイプ・位置・幅・説明。関係: 種類・端のクラスと位置 (辺か角度)・ラベル・多重度・端名・説明) 線は細いので、線から 6px の内のクリックも、その線と見なす。
  - 図の知識 (図に渡す形・編集できる項目・patch への変換) は、`manegers/classes.js` に置いた。(TM の model.tm に当たるもの。クラス図の model.* パッケージは無い)
  - 初めて開いたときは、クラスが全部見えるように描く。そのあとは、ほかの図と同じく、動かした位置と拡大の度合いを `localStorage` に覚える。(図の code は `classes`。d3.classes にはカメラを読み書きする口が無いので、d3-zoom の現在値と `g.viewport` の `transform` を使う)
  - 端のクラスが見つからない関係は描かずに、上に知らせる。(エディタで直接変えたファイルは、起動のときには検証しないため) id の重複などで描けないときは、理由を出す。
  - クラスが無いときは、「クラスがありません。data/classes/classes.json に書くと、ここに描きます。」と出す。
- 設定 `diagrams.classes` を足した。
  - `grid`: d3.classes の `grid` の設定を、そのまま渡す。(例: `{ draw: false }`)
  - `header`: クラスの箱のヘッダー (クラス名の行) の色。`{ by: 'layer', colors: { domain: '#fde68a', ... } }` の形で、`by` はクラスのレコードの項目のパス、`colors` は項目の値 → 色 (文字列は背景の色。d3.classes の `header` の形 `{ background, font }` でもよい)。レコードに `header` があれば、設定の色に重ねる。(レコードを優先する)
- 雛形のデータ (`examples/data/classes/classes.json`・`relationships.json`) を足した。(iHub の WBS とデータの読み書きを例にした 8 クラス・6 関係) 雛形のアプリ (参照アプリの `src/index.js`) に、`diagrams.classes.header` で `layer` ごとに塗り分ける設定を足した。
- `dependencies` に `@yanqirenshi/d3.classes` (`^0.13.0`) と `@yanqirenshi/model.core` (`^0.1.0`。入力の読み取りと patch の道具) を足した。

### 変更

- レコードの PATCH (`patchRecord`) で、URL の id を `encodeURIComponent` で符号化するようにした。(クラス図の `Plan->Workpackage` のような、記号を含む文字列の id のため。数の id は、これまでと同じ URL になる)

### 利用側への影響

- `data/classes/` が無いアプリも、そのまま動く。(クラス図のタブは、空の図になる。ihub.srv 0.6.0 が、ファイルの無いクラス図のコレクションを空の配列として扱う) ihub.core と ihub.srv は、どちらも 0.6.0 にする。
- クラス図を使うときは、`data/classes/classes.json`・`relationships.json` を作る。(雛形は `examples/data/classes/`。`ihub-srv check` で確かめられる)
- `pages.ClassDiagram` (「ClassDiagram」の文字を出すだけの、使われていない仮のページ) は、公開しているので、そのまま残した。

## 0.5.0 (2026-11)

ドックの「Issue の追加」を、ihub.core の部品 **`ProjectItemForm`** にして公開し、Issue を作るときに、**日付と担当を指定できる**ようにしました。(yanqirenshi/iHub#149)

### 変更 (d3.* などのライブラリを、最新の版にする。yanqirenshi/iHub#164)

- `dependencies` の下限を、最新の版に上げた。(直った版を、必ず使うようにする)
  - `@yanqirenshi/d3.yabane` `^0.1.15` → `^0.1.17`
  - `@yanqirenshi/d3.deployment` `^0.11.0` → `^0.11.1`
  - `@yanqirenshi/d3.ter` `^0.4.0` → `^0.4.1`
  - `@yanqirenshi/model.deployment`・`model.sitemap`・`model.tm` `^0.1.0` → `^0.1.1`
  - `@yanqirenshi/d3.er` `^0.6.1` → `^0.6.2`・`d3.sitemap` `^0.9.0` → `^0.9.1`・`colonoscope` `^0.5.0` → `^0.5.1`・`model.unchi` `^0.1.0` → `^0.1.1`
- **Schedule タブ: 同じ WBS の中で、期間が重なる矢羽根が、重ならなくなった。** (d3.yabane 0.1.17。0.4.0 の「制限 (d3.yabane 0.1.15)」が直った。[Foolsgolds/Assholes#173](https://github.com/Foolsgolds/Assholes/issues/173)) 重なる矢羽根は、重ならない段に分かれて描かれ、行の高さも、段の数に合う。
- d3.yabane 0.1.17 では、`plan` の無いワークパッケージを渡しても、TypeError にならなくなった。([Foolsgolds/Assholes#174](https://github.com/Foolsgolds/Assholes/issues/174)) iHub の Schedule タブは、これまでどおり、`plan` の無いワークパッケージを渡さない。
- システム構成図 (d3.deployment 0.11.1) で、線の矢印が描かれる。([Foolsgolds/Assholes#175](https://github.com/Foolsgolds/Assholes/issues/175))
- 0.4.0 の節の制限の記述は、そのときの記録なので、そのまま残す。

### 追加 (FrameWbsNodeTabs・TabsSearchParam: タブの中央寄せ。yanqirenshi/iHub#145)

- `TabsSearchParam` に、props `centered` (省略したときは `false` = 左寄せ) と `tabsProps` (MUI の `Tabs` に渡す props。例: `{ variant: 'scrollable' }`) を足した。
  - `value`・`onChange` は `TabsSearchParam` が決めるので、`tabsProps` に入っていても無視する。
  - `centered` と `tabsProps.centered` の両方があるときは、`centered` を優先する。
- `FrameWbsNodeTabs` も `centered`・`tabsProps` を受け取り、そのまま `TabsSearchParam` に渡す。省略したときは、今までどおり左寄せ。
- これまで必要だった、`FrameWbsNodeTabs` を `Box` で囲んで MUI のクラス名 (`.MuiTabs-flexContainer`) に CSS を当てる方法は、要らなくなる。(`children` の中のタブには効かない)

### 変更 (艦橋の Cockpit タブ: 出す Issue を絞る。yanqirenshi/iHub#148)

- 艦橋の Cockpit タブに出す Issue を、自分が担当の Issue のうち、次のどちらかに当てはまるものだけに絞るようにした。**Project に Plan も NextAction も書いていない Issue は、出なくなる。**
  1. 今日が、Issue が入っている Project の Plan の期間に入っている。(始まりは `Plan.Start` か `Plan.From`、終わりは `Plan.End` か `Plan.To`。日の単位で比べ、始まりの日と終わりの日の当日も含む。始まりと終わりの両方が入っている Project だけを見る)
  2. 1 に当てはまらなくても、`NextAction.` で始まる日付の項目が入っている。(過ぎていても、先でもよい)
  - 複数の Project に入っている Issue は、どれか 1 つの Project が当てはまれば、出す。並びは、#150 のまま。(NextAction の日付の近い順。日付の無いものは、最後で、元の順)
  - 絞った結果が 0 件のときは、「今日が Plan の期間に入っている Issue と、NextAction.Date が入っている Issue がありません。」と出す。(絞らずに全部を出す切り替えは、付けていない)
  - 日付を読み込めなかったときは、絞らずに、自分が担当の Issue を全部、読み込んだ順で出し、「日付を読み込めなかったので、Issue を絞らずに、読み込んだ順に出しています。(理由)」と、カードの上に控えめに出す。(#150 の「NextAction の日付を読み込めなかったので…」の文を、これに替えた)
  - Plan の日付は、#150 の NextAction の日付と**同じ 1 回の呼び出し**で読む。(呼び出しは増えない) 判定は、純粋な関数 `manegers/cockpitFilter.js` (`planRangesOf`・`isInPlan`・`isCockpitTarget`・`filterForCockpit`)。
  - `bridge` の state の `nextActionsError` を、`datesError` に改め、`plans` (Issue の id → Plan の期間) を足した。(ihub.core の内部。公開の API ではない)

### 追加 (艦橋の Cockpit タブ: NextAction.Date で並べる。yanqirenshi/iHub#150)

- 艦橋の Cockpit タブの Issue のカードを、Project の `NextAction.Date` の**近い (早い) 順**に並べるようにした。
  - 日付の無い Issue は、最後で、その中は、これまでの並び (GitHub から読み込んだ順) のまま。同じ日付のものも、これまでの並びのまま。
  - 1 つの Issue が複数の Project に入っていて、日付が違うときは、一番近い (早い) 日付を使う。名前が `NextAction.` で始まる日付の項目 (`NextAction.Date` など) の値を使う。(#149 の日付の欄と同じ考え)
  - カードに、「Next: 2026-11-24」のように、日付を出す。過ぎた日付 (今日より前) は、赤で太字にする。(今日は、過ぎていない)
  - 日付は、Issue を読んだあと、**自分が担当の Issue (カードになるもの) だけ**を、GitHub の GraphQL (`nodes(ids:)`) で、100 件ずつまとめて読む。(Issue の数だけは呼ばない。sogh は変えていない)
  - 日付の読み込みに失敗しても、カードは、これまでの並びで出し、その旨を、カードの上に控えめに出す。(#148 の絞り込みでは、絞らずに全部を出す)
  - Project の項目の値を読む部分 (`manegers/githubProject.js` の `fetchIssueDateValues`・`valuesByFieldPrefix`) は、項目の名前の頭で選ぶ作りにした。(Project の `Plan.*` で Issue を絞る iHub#148 でも使える) 並べ替えと過ぎた日付の判定は、`manegers/nextAction.js`。GraphQL を呼ぶ共通の部分は `manegers/githubGraphql.js` (`githubIssue.js` も、これを使う)
  - `panels.bridge.Monitor` に、カードの上に出す知らせの props `notice` (省略できる) を足した。

### 追加 (Issue の追加: 日付と担当。yanqirenshi/iHub#149)

- 日付: 選んだ Project の日付 (`DATE`) の項目のうち、名前が `Plan.` で始まるもの (`Plan.Start`・`Plan.End`・`Plan.From`・`Plan.To` など) と、`NextAction.` で始まるもの (`NextAction.Date`) を、日付の欄にして出す。(並びは、Project の項目の順。実績の `Result.*` と、それ以外の日付の項目 (`Start date` など) は、出さない) Project に足したあと、入れた日付を `updateProjectV2ItemFieldValue` で設定する。空の欄は、設定しない。当てはまる項目が無い Project では、日付の欄を出さない。
- 担当: 作成先のリポジトリで担当にできる人 (`assignableUsers`) から、複数選べる。初めは、ログイン中の自分が選ばれている。(自分が担当にできないリポジトリなら、空) 外すと、担当なしで作る。`createIssue` の `assigneeIds` で渡す。
- 失敗の知らせ: Issue は作れたが、Project に足せなかったとき・日付を設定できなかったときは、どの Issue かが分かるリンクと、理由 (日付は、設定できなかった項目の名前) を出す。(日付は、1 つが失敗しても、残りを設定する) 項目や担当を読み込めなかったときは、その旨を出して、日付なし・担当なしで作れる。

### 変更

- ドックの「Issue の追加」の吹き出しの中身を、雛形 (`src/operators/ProjectItemForm.js`) から、ihub.core の `assemblies` に移して、`ProjectItemForm` として公開した。(`import { ProjectItemForm } from '@yanqirenshi/ihub.core'`) GitHub の呼び出し (Issue の作成・Project への追加・項目の設定・担当の取得) は、`manegers/githubIssue.js` にある。
  - 吹き出しの位置 (`root`) は、これまでどおり、使う側 (雛形の `src/operators/Operators.js`) から渡す。
  - 吹き出しの枠の色は、雛形の `dockColor.js` ではなく、設定の `colors` (配色の主の色。ドックのボタンと同じ) から決める。
  - 作成先のリポジトリの決め方 (Project に紐づいた先頭のリポジトリ) は、そのまま。
- `dependencies` に `@yanqirenshi/markdown.sitter` の `^0.1.5` を足した。(本文の Markdown の編集。雛形の `package.template.json` と、参照アプリの `package.json` からは、外した)
- 雛形の `src/operators/ProjectItemForm.js` を消し、`src/operators/Operators.js` は、ihub.core の `ProjectItemForm` を使う。

### 利用側への影響

- Cockpit タブの並び: Project に `NextAction.` の日付を書いている Issue があると、並びが、日付の近い順に変わる。書いていなければ、これまでと同じ並び。(カードに、日付が出るだけ)
- **移らなくても、アプリの今のコピー (`src/operators/ProjectItemForm.js`) は、そのまま動く。** (日付と担当の欄は、出ない。アプリの `package.json` の `@yanqirenshi/markdown.sitter` は、残す)
- 日付と担当を使うには、アプリを、ihub.core の部品を使う形に移す。
  1. `src/operators/ProjectItemForm.js` を消す。
  2. `src/operators/Operators.js` の `import ProjectItemForm from './ProjectItemForm.js'` を、`import { ProjectItemForm } from '@yanqirenshi/ihub.core'` にする。(`<ProjectItemForm root={root}/>` の書き方は、そのまま)
  3. `src/operators/dockColor.js` は、ほかの吹き出し (`Other.js`・`AccountMenuSettings.js`・`labels.js`) が使っていれば、残す。
  4. `package.json` の `@yanqirenshi/markdown.sitter` は、アプリのほかのところで使っていなければ、消せる。
- 日付の項目の名前 (`Plan.`・`NextAction.`) は、iHub の Project の決まりに合わせてある。この名前の日付の項目が無い Project では、日付の欄は出ない。

### 確かめた

- Cockpit タブの NextAction の並び (#150):
  - 実際の GitHub に対して、**読み取りだけで**、実装と同じ問い合わせ (`nodes(ids:)` で、Issue の `projectItems` の日付の値) を、自分が担当の open の Issue 16 件に、1 回の呼び出しで流して、16 件ぶんの値が返ることを確かめた。(iHub の Project 50 (71 件) には、いまは `NextAction` の日付が 1 つも無く、実データでは、並びを確かめられなかった。`Plan.*` の値は、自分が担当の 9 件に入っていて、読めた)
  - 偽の `fetch` で、純粋な関数と読み込みを、25 項目確かめた。(複数の Project で違うときは一番近い日付・`Plan.`・`Result.` は NextAction に使わない・近い順で、日付なしは最後で元の順・同じ日付も元の順・今日は過ぎていない・250 件は 100 件ずつ 3 回・失敗は例外・#149 の Issue の作成が、共通の GraphQL の部分でも動く)
  - 参照アプリを、別のポートで起動し、GitHub の応答を偽物にした確認用のページ (確かめたあと消した) で、本物の艦橋のページを動かした。7 件の Issue (日付なし 2・過ぎた日付・今日・先の日付・2 つの Project に別の日付・他の人の担当) で、自分が担当の 6 件の日付が、1 回の呼び出しで読まれ、「過ぎた日付 (赤・太字) → 今日 → 2 つの Project の早い方 → 先の日付 → 日付なし 2 件 (元の順)」に並んだ。他の人の担当は、出なかった。
  - 日付の読み込みを失敗させると、カードは、読み込んだ順に出て、知らせが出た。GitHub に未接続のときの知らせ (0.3.1 の #131) は、これまでどおり。
- GitHub の GraphQL の問い合わせ (#149) を、**実際の GitHub に対して、読み取りだけで**確かめた。
  - スキーマ: `CreateIssueInput.assigneeIds` は `[ID!]`。`UpdateProjectV2ItemFieldValueInput` は `projectId`・`itemId`・`fieldId`・`value`。`ProjectV2FieldValue.date` は `Date`。`ProjectV2FieldCommon` (`id`・`name`・`dataType`) は、各項目の型が実装する。
  - iHub の Project の日付の項目は、`Result.Start`・`Result.End`・`Plan.Start`・`Plan.End`・`NextAction.Date`。作成先は `yanqirenshi/iHub`。担当にできる人と、ログイン中の自分も、取れた。
  - 別の Project では、`Start date`・`Target date` (名前が `Plan.` で始まらない日付) もあり、日付の欄から除かれることを、判定の関数で確かめた。
- 偽の `fetch` (GitHub の応答だけ偽物) で、GitHub への呼び出しの順序と中身を確かめた。(26 項目): 日付の項目の判定 (`Plan.*`・`NextAction.*` だけ。`Result.*`・`DATE` でないもの・`Plan.` で始まらないものは、除く)・Project の順の並び・担当の初めの選び方・`createIssue` に `assigneeIds` が渡る・空の日付は設定しない・担当なしは `[]`・Project に足せないとき・日付の 1 つが失敗しても残りを設定する・Issue を作れないとき。
- 参照アプリを、別のポートで起動し、GitHub の応答を偽物にした確認用のページで、本物の `ProjectItemForm` を動かして確かめた。(確認用のページは、確かめたあとに消した)
  - 日付の欄: iHub 型の Project は `Plan.Start`・`Plan.End`・`NextAction.Date` (`Result.*` は出ない)。Assholes 型は `Plan.From`・`Plan.To`。日付の項目が無い Project は、欄なし。
  - 担当: 初めは自分。複数選べ、外すと `assigneeIds: []`。
  - 日付 2 つ + 担当 2 人で作ると、`createIssue` → `addProjectV2ItemById` → 日付 2 回の順で呼ばれ、空の `Plan.End` は設定されなかった。作ったあと、タイトル・日付が空に戻り、担当が初めの選び方に戻った。
  - 日付の設定の失敗・Project への追加の失敗・Issue の作成の失敗の、どれも、リンクと理由が出た。(日付の失敗では、残りの日付は設定された)
- ドックの GitHub のボタンから、雛形の `Operators.js` を通して、ihub.core の `ProjectItemForm` が開いた。(未接続のときは「Github に接続していません。」) 枠の色は、ドックのボタンと同じ。
- `npm run build` が通った。
- 確かめていない: **本物の GitHub に、Issue を作ること** (Issue の作成・Project への書き込みは、確認を取ってからにするため、していない)。hub が使う個人用アクセストークン・OAuth のトークンの権限での動き。

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
  - **制限 (d3.yabane 0.1.15)**: 同じ WBS の中で、期間が重なる矢羽根は、同じ高さに重なって描かれる。(d3.yabane 側の制限。[Foolsgolds/Assholes#173](https://github.com/Foolsgolds/Assholes/issues/173) に、issue を立てた。直す時期は、決まっていない。d3.yabane が直れば、更新で直る)
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
