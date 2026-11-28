# 更新履歴

`@yanqirenshi/ihub.core` と `@yanqirenshi/ihub.srv` は、同じ版にそろえて出します。
変更の詳しい内容は、パッケージごとの CHANGELOG (npm のパッケージにも入っています) に書きます。

| パッケージ | 更新履歴 |
|---|---|
| `@yanqirenshi/ihub.core` | [packages/ihub.core/CHANGELOG.md](packages/ihub.core/CHANGELOG.md) |
| `@yanqirenshi/ihub.srv` | [packages/ihub.srv/CHANGELOG.md](packages/ihub.srv/CHANGELOG.md) |

版は [semver](https://semver.org/lang/ja/) で付けます。0.x の間は、設定の形・公開する部品・データのフォーマット・API・CLI を変えるときに、minor を上げます。

## 0.12.1 (2026-11)

- `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`: 艦橋の Overview の線を、破線・点線で描ける版 (d3.unchi 0.10.4・model.unchi 0.1.3) を取り込んだ。(yanqirenshi/iHub#252) 線のインスペクタに「線の種類」(`stroke.type`。`solid`・`dashed`・`dotted`) が増え、データにも書ける。空や知らない文字で適用すると、誤りを出して書かない。(空にしても、項目は消えない) いままで線の `stroke.type` に何か書いていたデータは、描かれ方が変わる。範囲が `^` なので、0.12.0 を新しく `npm install` したアプリにも入っている。iHub のコードの変更は無い。データの形・設定の形は変わらない。
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.12.1` にそろえた。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。`stroke.type` を書いた線の `POST`・`PATCH`・検査のテストを足した。

## 0.12.0 (2026-11)

- `@yanqirenshi/ihub.core`: ビジネスのページに、TM のデータ (`data/tm/` の entities・identifiers・attributes・relationships) を表で見るタブ (Entities・Identifiers・Attributes・Relationships) を、「TM」と「機能一覧」の間に足した。(yanqirenshi/iHub#224) 並びはファイルの順。(書き換え・削除は、表からはできない)エンティティの識別子・属性、結線の接続元・接続先は、id ではなく名前で出す。Identifiers・Attributes は、名前を論理名と物理名の列に分けて出す。(yanqirenshi/iHub#230) 初めに開くタブは、これまでどおり TM。
- `@yanqirenshi/ihub.core`: ビジネスのページの Entities のタブに、「Entity の追加」ボタンを足した。(yanqirenshi/iHub#232) 押すと、モーダルのフォーム (叩き台) が出て、エンティティを 1 件足せる。左の枠にエンティティのイメージ (入力から d3.ter で描く)、右の枠にタブ「基本」(種別・論理名・物理名・説明)・「Identifiers」・「Attributes」(左に選んだ一覧、右に検索とマスタの一覧。行を押して選ぶ) が並ぶ。
- `@yanqirenshi/ihub.core`: ビジネスのページの Identifiers・Attributes・Relationships のタブに、「Identifier の追加」「Attribute の追加」「Relationship の追加」ボタンを足した。(yanqirenshi/iHub#238) 押すと、モーダルのフォームが出て、レコードを 1 件足せる。結線は、2 つのエンティティの位置から、向かい合う辺に接続位置 (`from.position`・`to.position`) を決めて保存する。(yanqirenshi/iHub#240) 4 つの「〜 の追加」のモーダルを開いている間は、サイドメニューも、モーダルの背景の下になる。「Entity の追加」のイメージは、論理名が空のあいだ、「????????」ではなく、薄い色の「(論理名)」と出す。
- `@yanqirenshi/ihub.core`: 艦橋の Overview のタブを開いている間だけ、ドックの右端に「要素の追加」の丸を出すようにした。(yanqirenshi/iHub#242) 押すと、吹き出しの中に、ノードの登録フォーム (叩き台。名称・幅・高さ・背景色・枠線の色) が出て、最上位のノードを足せる。(いまのノードの右に置く。吹き出しは開いたままで、続けて足せる) フォームの項目は、名称・幅・高さ・背景 (色・不透明度)・枠線 (種類・色・太さ・角の丸み・影)・文字 (大きさ・色・太さ)・説明・リンクの 15 個。(yanqirenshi/iHub#244) 色は `CSS.supports` で確かめ、色でない文字は保存しない。(背景色・枠線の色も) タブ (やページ) を開いている間だけ、ドックに丸を足すフック `useDockOperator` を公開した。設定の `operators` の形は、変わらない。
- `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`: インスペクタの項目を足した版 (model.unchi 0.1.2・model.core 0.1.2・model.tm 0.1.4・model.er 0.2.3) を取り込んだ。(yanqirenshi/iHub#246) 艦橋の Overview のノードのインスペクタに、8 項目 (文字の大きさ・色・太さ・角の丸み・影・背景の不透明度・説明・リンク) が増える。TM・ER 図のエンティティのインスペクタに、属性の行ごとに「NOT NULL: 属性の名前」の欄が増え、Null 制約 (`not_null`) を書き換えられる。「ノードの追加」のフォームのラベル「背景の透明度」を、インスペクタと同じ「背景の不透明度」に直した。
- `@yanqirenshi/ihub.core`: WBS のノードのページの枠 `FrameWbsNode`・`FrameWbsNodeTabs` に、props `showWbsTable` (WBS の表を出すか。既定は出す) と `headAlign` (見出しの寄せ) を足した。(yanqirenshi/iHub#176) **2 つの枠の見出しの既定が、左寄せから中央寄せに変わった。** 左寄せのままにするときは、`headAlign="left"` を付ける。(見出しの部品 `HeadWbsPage` にも `align` を足した。`HeadWbsPage` の既定は左寄せのまま)
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.12.0` にそろえた。
- `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`: TM・ER のデータ型 (`data_type`)・Null 制約 (`not_null`) の版 (model.core 0.1.1・model.tm 0.1.3・d3.ter 0.4.8・model.er 0.2.2・d3.er 0.6.7) を取り込んだ。(yanqirenshi/iHub#234) TM・ER 図のインスペクタで、識別子・属性のマスタの項目が 4 つ増える。(データ型・長さ・小数部の桁数・データ型の説明) Identifiers・Attributes のタブの表に、「データ型」の列 (`decimal(10, 2)` など) を足した。API サーバーの検査のスキーマも、そろえた。いまのデータは、そのまま読める。(ER の文字列の `data_type` も、これまでどおり使える)

## 0.11.0 (2026-11)

- `@yanqirenshi/ihub.core`: 図の要素のインスペクタを開く操作を、右クリックから **Ctrl + クリック (Mac は ⌘ + クリック)** に変えた。(yanqirenshi/iHub#222。7 つの図: ER 図・TM・クラス図・画面遷移図・システム構成図・艦橋の Overview・艦橋の Schedule) 右クリックでは、インスペクタは開かず、ブラウザの普通のメニューが出る。0.10.x までクリックだけで開いた TM の結線・クラス図の関係の線も、Ctrl + クリックにそろえた。(修飾キーの無いクリックでは開かない) Schedule の矢羽根は、修飾キーの無いクリックでは、これまでどおり行き先へ移る。
- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.er` を `^0.6.6`、`@yanqirenshi/d3.ter` を `^0.4.7`、`@yanqirenshi/d3.deployment` を `^0.11.5`、`@yanqirenshi/d3.sitemap` を `^0.9.4`、`@yanqirenshi/d3.unchi` を `^0.10.3` に上げた。(`click` のコールバックに `event` が渡る。TM の結線は、ポインタが近づくと色が変わる)
- `@yanqirenshi/ihub.core`: 判定の関数 `inspectClick`・`isInspectClick` を公開した。(アプリが足した図のパネルでも、同じ操作にそろえられる)
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.11.0` にそろえた。
- `@yanqirenshi/ihub.core`: 雛形のアプリ (`ihub-srv init --app` で作るアプリ) に、自分で作るデータのマネージャを置くフォルダ `src/manegers/` を入れた。(yanqirenshi/iHub#175。中身は `README.md` だけ)
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.11.0 と、版をそろえるだけ)

## 0.10.1 (2026-11)

- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.ter` を `^0.4.3` に上げた。(yanqirenshi/iHub#218) TM の結線のラベルの文字の上をクリックしても、結線がインスペクタに開くようになった。(0.10.0 までは、ラベルの上では開かず、線の上か、線の近くをクリックする必要があった) 線の上・線の近くのクリックは、変わらない。iHub のコードの変更は無い。データの形・設定の形は変わらない。
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.10.1` にそろえた。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.10.1 と、版をそろえるだけ)

## 0.10.0 (2026-11)

- `@yanqirenshi/ihub.core`: 艦橋の Schedule タブに、マイルストーン (`data/master_schedule/milestones.json`) を、WBS かプロジェクトの行の、日付の位置に △ と名前で描くようにした。(yanqirenshi/iHub#216) 表示する期間に、マイルストーンの日付も入れる。ワークパッケージが無くても、描けるマイルストーンがあれば図を描く。△ は、押しても何もせず、右クリックでインスペクタ (名称・日付・見た目) を出す。`@yanqirenshi/d3.yabane` を `^0.9.0`、`@yanqirenshi/model.yabane` を `^0.2.0` に上げた。
- `@yanqirenshi/ihub.srv`: データのコレクション `master_schedule/milestones` を足した。(ファイルが無いときは空。データの移行は無い) `ihub-srv check` は、マイルストーンの id の重複・`parent` も `project` も無いもの・その先が無いもの・実在しない日付を、誤りとして知らせる。
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.10.0` にそろえた。

## 0.9.2 (2026-11)

- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.classes` を `^0.14.1`、`@yanqirenshi/d3.ter` を `^0.4.2` に上げた。(yanqirenshi/iHub#212) クラス図の関係の線と、TM の結線の当たり (クリック・右クリックが届く範囲) が、図を縮小しても狭くならず、拡大率に関わらず線から約 4.5px になった。(0.9.1 は、図と一緒に拡大・縮小して、100% で約 4.5px、50% で約 2px だった。0.9.1 の項目で「約 4px」と書いたものと同じ当たり) 100% のときの動きは変わらない。100% より拡大したときは、0.9.1 より狭くなる。(200% のとき、画面の上で約 9px から約 4.5px に)iHub のコードの変更は無い。データの形・設定の形は変わらない。
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.9.2` にそろえた。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.9.2 と、版をそろえるだけ)

## 0.9.1 (2026-11)

- `@yanqirenshi/ihub.srv`: `ihub-srv init --app` で作る `package.json` の `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv` を、init に使った版 (`^0.9.1` など) にするようにした。(yanqirenshi/iHub#207) これまでは、雛形に書いた `^0.6.0` のままで、`npm install` で 0.6.x が入っていた。
- `@yanqirenshi/ihub.core`: 雛形の `examples/app/package.template.json` の iHub の版を、`^0.9.1` にそろえた。
- `@yanqirenshi/ihub.core`: クラス図の図の知識 (インスペクタの項目・patch への変換) を `@yanqirenshi/model.classes` `^0.1.0` に置き換え、箱のドラッグ・右クリック、線のクリック・右クリックを、DOM で拾うのをやめて `@yanqirenshi/d3.classes` `^0.14.0` のコールバックで受けるようにした。(yanqirenshi/iHub#206) 関係の線の当たりは、線から 6px 以内から、約 4px 以内 (拡大が 100% のとき。図と一緒に拡大・縮小する) になった。線は、これまでどおりクリックでも右クリックでも開ける。データの移行は無い。
- `@yanqirenshi/ihub.srv`: `classes` の検査を model.classes の `check` に、`schemas/classes` を model.classes の `SCHEMAS` の内容にした。(検査と文言は同じ。スキーマは説明の 1 文だけが違う)

## 0.9.0 (2026-11)

- `@yanqirenshi/ihub.core`: 艦橋の Schedule タブで、矢羽根・WBS の箱・プロジェクトの箱を右クリックすると、右端にインスペクタが出て、名称・見た目 (背景色・枠線・文字)・予定の開始日と終了日 (矢羽根だけ) を書き換えられるようにした。(yanqirenshi/iHub#204。作りは Overview タブと同じ。変えた項目だけを `PATCH /api/master_schedule/{collection}/{id}` で保存する。並び順は出さない) `@yanqirenshi/d3.yabane` を `^0.8.0` に上げ、`@yanqirenshi/model.yabane` `^0.1.1` を足した。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.9.0 と、版をそろえるだけ。インスペクタの保存は、今の `master_schedule/*` のスキーマとルールを通る)

## 0.8.3 (2026-11)

- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.yabane` を `^0.7.0` に上げた。(yanqirenshi/iHub#202) 艦橋の Schedule タブで、行の区切り線を、入れ子の子どうし (子の WBS・直下のワークパッケージの帯) の間にも引くようになった。iHub のコードの変更は無い。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.8.3 と、版をそろえるだけ)

## 0.8.2 (2026-11)

- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.yabane` を `^0.6.0` に上げた。(yanqirenshi/iHub#198) 艦橋の Schedule タブで、今日が表示する期間の外のときは、現在線が出なくなった。サイクル・幅を変えて図を作り直すときは、前の図が測った名前の幅を引き継ぎ、1 度の描画で済む。初めの拡大の度合いは、d3.yabane の描き終わりの知らせ (`onDraw`) で決め直す。(動きは 0.8.1 と同じ)
- `@yanqirenshi/ihub.srv`: `wbs/workpackages` のスキーマの説明文の、古い名前 (`rows`・`items`) を直した。(スキーマの形・検査は、変わらない)

## 0.8.1 (2026-11)

- `@yanqirenshi/ihub.core`: 艦橋の Schedule タブに「−」「＋」のボタンを置き、1 目盛り (1 日・1 週・1 か月) の幅を、`50%`〜`400%` の段で変えられるようにした。(yanqirenshi/iHub#192。100% = これまでの 111。選んだ段は、サイクルごとにブラウザに覚える。幅を変えても、画面の中央にあった日付は、ほぼ中央に残る。100% より狭い段では、目盛りの見出しの文字を小さくする) データの形・設定の形は、変わらない。
- `@yanqirenshi/ihub.core`: `@yanqirenshi/d3.yabane` を `^0.5.0` に上げた。(yanqirenshi/iHub#194) 艦橋の Schedule タブの名前の列 (プロジェクト・WBS) の幅が、列ごとに、名前に合う。名前は省略せずに出す。(全角 30 文字ぶんを超える名前だけ、末尾を `…` にする) **名前の列の幅が、0.8.0 と変わる。**
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.8.1 と、版をそろえるだけ)

## 0.8.0 (2026-11)

- `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`: 艦橋の Schedule タブの `data/master_schedule/` を、d3.yabane の入力と同じ `projects.json`・`wbs.json`・`workpackages.json` にした。(プロジェクトをいちばん左の列に描く。WBS の入れ子・プロジェクト・WBS・ワークパッケージの見た目 (`background`・`stroke`・`font`) を書ける。ワークパッケージの `result`・`progress` は受け取るが、描かない) `@yanqirenshi/d3.yabane` を `^0.4.0` に上げた。参照アプリの `data/master_schedule/` に、d3.yabane のショーケースのサンプルを、そのまま入れた。(雛形には入れていない) **0.7.0 から: `rows.json` は `wbs.json` に、`items.json` は `workpackages.json` に、名前を変える。** (古い名前のファイルがあると、`ihub-srv check` が知らせる)

## 0.7.0 (2026-11)

- `@yanqirenshi/ihub.core`: d3.* で描く 7 つの図 (ER 図・TM・クラス図・画面遷移図・システム構成図・Overview・Schedule) で、グリッド線を描かないのを既定にした。設定の `diagrams` に `std`・`scd`・`overview`・`schedule` を足し、7 つとも `diagrams.{図}.grid` で上書きできる。(`{ draw: true }` で描く) **グリッド線を出していたアプリは、出なくなる。**
- `@yanqirenshi/ihub.core`: 艦橋の Schedule タブに「日・週・月」のボタンを置き、時間の目盛りのサイクルを切り替えられるようにした。(選んだものはブラウザに覚える。初めは週。1 目盛り (1 日・1 週・1 か月) の幅は、どれも 111 にそろえる。図の位置と拡大は、サイクルごとに覚える) `@yanqirenshi/d3.yabane` を `^0.3.0` に上げた。(日・週の見出しが出る)
- `@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`: 艦橋の Schedule タブのデータを、WBS のワークパッケージの `plan` から切り離して、新しい `data/master_schedule/` (`rows.json` の行・`items.json` の予定) にした。(行は `rows.json` の順。予定は `parent` (行の id)・`name`・`plan` が必須で、行き先は任意で `wbs` (押すと `/wbs/{id}`) か `url` (新しいタブ) のどちらか 1 つ。どちらも無ければ、押しても何も起きない。ファイルが無くても動く) **データの形が変わるので 0.7.0。ワークパッケージの `plan` は、使えなくなる。(書いてあると `ihub-srv check` が誤りにする) 予定は `data/master_schedule/` に書く。**

## 0.6.1 (2026-11)

- `@yanqirenshi/ihub.core`: サイドメニューで、選択中 (とホバー中) の項目の白い枠の上下の余白が、ほぼ無かった不具合を直した。(yanqirenshi/iHub#177。bulma の `box-sizing: border-box` で、menubook の白い枠が 33px から 25px に縮んでいた) `dependencies` の `@yanqirenshi/menubook` を `^0.1.3` にした。(白い枠 33px の周りに 4px の縁取りが一周し、1 行の高さは 33px のまま。iHub のコードの変更は無い)
- `@yanqirenshi/ihub.core`: 雛形のアプリ (`examples/app/`) に、自分で作る部品を置くフォルダ `src/components/` (`assemblies/`・`pages/`・`panels/`・`parts/`。中身は `README.md` だけ) を入れた。
- `@yanqirenshi/ihub.srv`: コードの変更は無い。(ihub.core 0.6.1 と、版をそろえるだけ)

## 0.6.0 (2026-11)

- `@yanqirenshi/ihub.core`: クラス (`/classes`) のページの「クラス図」タブに、何も描かれない不具合を直した。(yanqirenshi/iHub#171。タブはあるが、パネルの表に `class-diagram` が無く、`TabbedPage` が何も描いていなかった) クラス図のパネル `panels.Classes` を足し、`data/classes/` のデータを `@yanqirenshi/d3.classes` で描く。(箱のドラッグで位置を保存し、右クリック・クリックで、インスペクタからクラスと関係を書き換えられる。TM と同じ流儀) 設定 `diagrams.classes` (`grid`・`header`。ヘッダーを、クラスの項目の値ごとに塗り分ける) を足した。PATCH の URL の id を符号化するようにした。
- `@yanqirenshi/ihub.srv`: クラス図のドメイン `classes` (`classes/classes`・`classes/relationships`) のスキーマとルールを足した。(項目は d3.classes の入力の形のまま。アプリ固有の項目も書ける) スキーマに `default` があるコレクションは、ファイルが無くてもよいようにした。(`data/classes/` の無いアプリも、そのまま動く) URL の id が数字だけで、数値で見つからないときは、文字列としても探す。
- 参照アプリ: `data/classes/` (雛形と同じ見本) と、`diagrams.classes.header` で `layer` ごとに塗り分ける設定を足した。

## 0.5.0 (2026-11)

- `@yanqirenshi/ihub.core`: `dependencies` の d3.* などの下限を、最新の版に上げた。(d3.yabane 0.1.17: Schedule タブで、同じ WBS の中で期間が重なる矢羽根が、重ならなくなった。d3.deployment 0.11.1: システム構成図で、線の矢印が描かれる。d3.ter 0.4.1・model.deployment/sitemap/tm 0.1.1・d3.er 0.6.2・d3.sitemap 0.9.1・colonoscope 0.5.1・model.unchi 0.1.1) 参照アプリ (ルートの `package.json`) の `@yanqirenshi/d3.network` も、`^0.10.0` にした。
- `@yanqirenshi/ihub.core`: `FrameWbsNodeTabs` と `TabsSearchParam` に、タブを中央寄せにする props `centered` (省略したときは左寄せ) と、MUI の `Tabs` に渡す props `tabsProps` を足した。(`TabsSearchParam` が決める `value`・`onChange` は、`tabsProps` で上書きできない。`centered` と `tabsProps.centered` の両方があるときは `centered` が優先)
- `@yanqirenshi/ihub.core`: 艦橋の Cockpit タブに出す Issue を、自分が担当の Issue のうち、今日が Project の Plan の期間 (`Plan.Start`〜`Plan.End`・`Plan.From`〜`Plan.To`。当日を含む) に入っているものと、`NextAction.` の日付が入っているものだけに絞るようにした。(Project に Plan も NextAction も書いていない Issue は、出なくなる。複数の Project のどれか 1 つが当てはまれば出す。0 件のときは、わけを出す。日付を読み込めなかったときは、絞らずに全部を出す。Plan の日付は、NextAction と同じ 1 回の呼び出しで読む)
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
