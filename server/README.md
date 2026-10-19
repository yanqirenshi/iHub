## server/

src/data/ を管理するバックエンドを置く場所です。
今は、データのフォーマット (JSON Schema) と検証だけがあります。
API サーバーは、これから追加します。

|   |            |                                                                     |
|---|------------|---------------------------------------------------------------------|
| d | schemas    | コレクションごとの JSON Schema ({domain}/{collection}.schema.json)  |
| d | validation | スキーマと、コレクションをまたぐルール (id の重複・参照の整合性) による検証 |
| d | test       | テスト                                                              |

### データの検証

```
npm run test:data
```

src/data/ と src/ihub/data_example/ が、スキーマとルールに合っているかを確かめます。

### コレクションを追加するとき

1. server/schemas/{domain}/{collection}.schema.json を作ります。
2. src/data/{domain}/{collection}.json と src/ihub/data_example/{domain}/{collection}.json を作ります。
3. コレクションをまたぐ検査が必要なときは、server/validation/rules.mjs に書きます。
