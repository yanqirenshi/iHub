# Monitor

カードを、石積み (masonry) のレイアウトで並べます。
列の数は、親の幅から決めます。
カードの列は、真ん中に寄せます。

- ソース: `packages/ihub.core/src/components/panels/cockpit/components/Cockpit.js`

コックピット (`/`) の「Cockpit」タブで、自分が担当している GitHub の Issue のカード ([Card](#/components/panels/cockpit/Card)) を並べるのに使っています。
Issue を読み込むのはページ (`pages/Cockpit.js`) で、この部品は並べるだけです。

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.cockpit.Monitor>...</panels.cockpit.Monitor>
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `children` | node | - | 並べるカード |

## 使い方の例

```jsx
import { panels } from '@yanqirenshi/ihub.core';

const cards = [
    { id: 1, type: 'MEMO' },
    { id: 2, type: 'TODO' },
];

<panels.cockpit.Monitor>
  {cards.map(card=> <panels.cockpit.Card key={card.id} data={card}/>)}
</panels.cockpit.Monitor>
```

## 注意

- 高さは親の高さ一杯 (`height: 100%`) で、はみ出した分はスクロールします。
  親に高さを付けてください。(タブのあるページのパネルとして使うときは、枠が高さを決めます)
- 左右に `111px`、下に余白を空けます。
  サイドメニューとドックに、カードが隠れないようにするためです。
- 並べるのは `@yanqirenshi/react-masonry-component` です。
  カードは、幅をそろえると、きれいに並びます。([Card](#/components/panels/cockpit/Card) の幅は `222px` です)
