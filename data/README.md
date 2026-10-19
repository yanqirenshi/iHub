## data/

画面から編集するデータを置く場所です。
データは JSON で、ドメインのフォルダの下に、コレクションごとのファイルを置きます。(例: er/entities.json)
フォーマットは server/schemas/ の JSON Schema で決めています。

画面からの編集は、API サーバー (server/) を通して保存します。
手で編集したときは、npm run test:data でフォーマットに合っているかを確かめられます。

local/ には、個人の設定 (サイドメニューの on/off など) を置きます。
local/ は git で共有しません。(.gitignore の対象です)
