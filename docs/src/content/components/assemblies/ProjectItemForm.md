# ProjectItemForm

ドックの GitHub のボタンの吹き出し「Project にイシューを追加」を描きます。(0.5.0 以降)
Project を選んで、そのリポジトリに Issue を作り、Project に追加します。
担当と日付も指定できます。

- ソース: `packages/ihub.core/src/components/assemblies/ProjectItemForm.js`
- GitHub の呼び出し: `packages/ihub.core/src/manegers/githubIssue.js`

吹き出しには、上から次のものを並べます。

| 欄 | 内容 |
|---|---|
| Project | ログイン中のアカウントの、閉じていない Project。横に、作成先のリポジトリ (Project に結び付いた先頭のリポジトリ) を出します |
| タイトル | 必須 |
| 担当 (assignees) | 作成先のリポジトリで担当にできる人から、複数選べます。初めは、ログイン中の自分 (担当にできないリポジトリなら、空) |
| 日付 | 選んだ Project の日付 (`DATE`) の項目のうち、名前が `Plan.` か `NextAction.` で始まるもの。並びは、Project の項目の順 |
| 本文 | Markdown。左で書き、右で見た目を確かめられます (@yanqirenshi/markdown.sitter) |

「追加」を押すと、次の順に GitHub を呼びます。

1. リポジトリに Issue を作ります。(選んだ担当も付けます)
2. Issue を Project に追加します。
3. 入れた日付を、Project の項目に設定します。(空の欄は、設定しません)

作ったあとは、タイトル・本文・日付を空に戻し、担当を初めの選び方に戻します。
使い方は、[GitHub との連携](#/github) の「Issue を作って Project に追加する」にもあります。

## import のしかた

```jsx
import { ProjectItemForm } from '@yanqirenshi/ihub.core';
```

## props

| 名前 | 型 | 必須 | 内容 |
|---|---|---|---|
| `root` | object | 必須 | ドックのボタン (`{ code, position, size }`)。ボタンの上に吹き出しを出すために使います。ドックが `src/operators/Operators.js` に渡すものを、そのまま渡します |

## 使い方の例

雛形の `src/operators/Operators.js` (ドックのボタンの code ごとに、吹き出しの中身を選ぶ) で使っています。

```jsx
import React from 'react';
import { ProjectItemForm } from '@yanqirenshi/ihub.core';

import Other from './Other.js';
import AccountMenuSettings from './AccountMenuSettings.js';

export default function Operators (props) {
    const root = props.root;

    if ('b'===root.code)
        return <ProjectItemForm root={root}/>;

    if ('c'===root.code)
        return <AccountMenuSettings root={root}/>;

    return <Other root={root}/>;
}
```

## 0.4.x までのアプリから移る

0.4.x までの雛形では、この吹き出しは、アプリの `src/operators/ProjectItemForm.js` でした。
**移らなくても、アプリの今のファイルは、そのまま動きます。** (担当と日付の欄は、出ません)
担当と日付を使うときは、次のように移ります。

1. `src/operators/ProjectItemForm.js` を消します。
2. `src/operators/Operators.js` の `import ProjectItemForm from './ProjectItemForm.js'` を、`import { ProjectItemForm } from '@yanqirenshi/ihub.core'` にします。(`<ProjectItemForm root={root}/>` の書き方は、そのままです)
3. `src/operators/dockColor.js` は、ほかの吹き出し (`Other.js`・`AccountMenuSettings.js`・`labels.js`) が使っていれば、残します。
4. `package.json` の `@yanqirenshi/markdown.sitter` は、アプリのほかのところで使っていなければ、消せます。(ihub.core が持っています)

## 注意

- `<IHub>` の中で使ってください。
  次のものを使います。
  1. 設定の `colors` (吹き出しの枠の色。ドックのボタンと同じ、配色の主の色)
  2. redux の store の `githubAuth` (接続の状態) と `scrum.projectsV2` (Project の一覧)
- GitHub に接続している必要があります。([GitHub との連携](#/github))
  接続していないときは、「Github に接続していません。」と出します。
  トークンには、Issue を作り、Project を書き換える権限 (`repo`・`project`) が要ります。
- 実績の日付 (`Result.*`) と、名前が `Plan.`・`NextAction.` で始まらない日付の項目 (`Start date` など) は、欄に出ません。
  当てはまる項目が無い Project では、日付の欄は出ません。
- 失敗したときは、吹き出しの下に、理由を出します。
  1. Issue は作れたが、Project に追加できなかったとき・日付を設定できなかったときは、作った Issue へのリンクも出します。(日付は、1 つが失敗しても、残りを設定します)
  2. 日付の項目や、担当にできる人を読み込めなかったときは、その旨を出します。日付なし・担当なしで作れます。
  3. Project にリポジトリが結び付いていないときは、作れません。
- 吹き出しの大きさは、幅 `1111px`・高さ `888px` に決まっています。
