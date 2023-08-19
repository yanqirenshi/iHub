## Directories

### React Components

| Name       | Description                    |
|------------|--------------------------------|
| frames     | Page の枠、Panel を表示する。  |
| panels     | Frame の Contents で表示する。 |
| assemblies | intermediate assembly (中間品) |
| parts      | 部品                           |

### Javascript

| Name     | Description                      |
|----------|----------------------------------|
| manegers | データモデルのマネージャ         |
| models   | データモデル                     |
| libs     | 外部ライブラリに切り出したいもの |

## Page の構成

Page の内容は以下の構成がある。

- Tabs + Contents
- Contents

上記の種類のコンポーネントを Frame とする。

Frameを基本とすることで、ユーザーが構成を自由に設定できるようにする。

Content のコンポーネントを Panel とする。
