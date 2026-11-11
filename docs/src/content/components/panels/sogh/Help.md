# Help

「Help」という文字だけを出す、仮の部品です。
説明の中身は、まだありません。

- ソース: `packages/ihub.core/src/components/panels/sogh/Help.js`

Scrum (`/scrum`) の「Help」タブは、この部品ではなく、[HelpEmpty](#/components/panels/HelpEmpty) を使っています。
iHub の中で、この部品を使っているところはありません。

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';

// <panels.sogh.Help/>
```

## props

props はありません。

## 使い方の例

```jsx
<panels.sogh.Help/>
```

## 注意

- 中身の無い Help のタブには、[HelpEmpty](#/components/panels/HelpEmpty) を使ってください。
  Scrum 以外のページの Help のタブも、HelpEmpty を使っています。
