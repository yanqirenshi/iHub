## data/

画面から編集するデータを置く場所です。
データは JSON で、ドメインのフォルダの下に、コレクションごとのファイルを置きます。(例: er/entities.json)
フォーマットは server/schemas/ の JSON Schema で決めています。
npm run test:data で、フォーマットに合っているかを確かめられます。

ACCOUNT_MENUS.js は、サイドメニューの項目の定義と on/off をまだ分けていないため、JS のままここに置いています。
