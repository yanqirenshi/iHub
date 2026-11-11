# TableTMRelationships

TM (T 字形 ER) の、関係の種類と、その形 (パターン) の早見表を描きます。
表の中身は部品の中に書いてあり、変えられません。

- ソース: `packages/ihub.core/src/components/assemblies/TableTMRelationships.js`

描く表の中身は、次のとおりです。
(画面では、1 つの関係を 1 行にして、パターンをセルの中に縦に並べます)

| 関係 | パターン |
|---|---|
| E-R | E ← R |
| E-E | E +→ E |
| E-E | E >-対応表- E |
| R-R | R -対照表- R |
| 再帰 | 再帰 |
| セット(集合) | サブセット |
| 多値 | MO |
| 多値 | HDR-DTL |

E はイベント、R はリソースです。
見出しは、画面では「関係」と「Patterns」です。

## import のしかた

```jsx
import { TableTMRelationships } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

```jsx
<TableTMRelationships/>
```

## 注意

- 表の幅は、333px までです。
