# SystemDynamics

システムダイナミクスの図を出すためのパネルです。
今は中身がまだ無く、「SystemDynamics」の文字を出すだけです。

iHub の中では、ビジネス (`/business`) の「Systemic Design」タブ (code は `systemic-design`) のパネルにしています。

- ソース: `packages/ihub.core/src/components/panels/SystemDynamics.js`

## import のしかた

```jsx
import { panels } from '@yanqirenshi/ihub.core';
```

## props

props はありません。

## 使い方の例

```jsx
<panels.SystemDynamics/>
```

ビジネスの「Systemic Design」タブに、アプリの部品を出すときは、設定の `panels` で差し替えます。
([カスタマイズ](#/customize) の「ページのタブとパネルを足す」)

```jsx
panels: { PAGE_BUSINESS: { 'systemic-design': MySystemicDesign } }
```

## 注意

- タブの名前は「Systemic Design」ですが、出すのはこのパネル (SystemDynamics) です。
Systemic Design のツールキットのカードは、別のページ (`pages.SystemicDesign`。URL は `/systemic-design`) です。
- `pages.SystemDynamics` (`/system-dynamics`) は、別の部品です。(同じく、「SystemDynamics」の文字を出すだけのページです)
