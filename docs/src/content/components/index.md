# コンポーネントの一覧

`@yanqirenshi/ihub.core` が公開している、画面の部品 (React のコンポーネント) を説明します。
1 つの部品を 1 ページで説明します。
アプリで、ページやパネルを自分で作るときに使います。

## 部品の分け方

部品は、ihub.core の `src/components/` の中で、大きさごとにフォルダを分けています。

| フォルダ | 中身 | import のしかた |
|---|---|---|
| `assemblies` | 中間の部品。画面の枠 (サイドメニューとドック) や、タブ、リンクなど | `import { Frame } from '@yanqirenshi/ihub.core';` |
| `panels` | ページのタブの中に出す、パネル | `import { panels } from '@yanqirenshi/ihub.core';` |
| `parts` | 小さな部品 | `import { LinkWBS } from '@yanqirenshi/ihub.core';` |

- `panels` は、`panels.ER` のように、`panels` を通して使います。
- `panels` の中の `bridge`・`sogh`・`systemic_design` は、もう 1 段深く、`panels.sogh.Repositories` のように使います。
- 部品の多くは、`<IHub>` の中で動かすことを前提にしています。(設定・redux の store・react-router を使うため)

## assemblies

| 部品 | 内容 |
|---|---|
| [Frame](#/components/assemblies/Frame) | iHub の画面の枠を描きます。 |
| [FrameTabs](#/components/assemblies/FrameTabs) | 上にタブの並びがある、画面の枠を描きます。 |
| [FrameWbsNode](#/components/assemblies/FrameWbsNode) | WBS のノードのページ (`/wbs/{id}`) の枠を描きます。 |
| [FrameWbsNodeTabs](#/components/assemblies/FrameWbsNodeTabs) | タブのある、WBS のノードのページの枠を描きます。 |
| [Link](#/components/assemblies/Link) | リンクを描きます。 |
| [TabbedPage](#/components/assemblies/TabbedPage) | タブのあるページを描きます。 |
| [TabsSearchParam](#/components/assemblies/TabsSearchParam) | タブの並びを描きます。 |
| [GithubOAuth](#/components/assemblies/GithubOAuth) | GitHub との接続の状態と、認証と切断のボタンを描きます。 |
| [AddWbsNode](#/components/assemblies/AddWbsNode) | WBS のノード (`parent`) の下に、子のノードを追加するフォームを描きます。 |
| [WBSTable](#/components/assemblies/WBSTable) | WBS の表を描きます。 |
| [TableTMRelationships](#/components/assemblies/TableTMRelationships) | TM (T 字形 ER) の、関係の種類と、その形 (パターン) の早見表を描きます。 |

## panels

| 部品 | 内容 |
|---|---|
| [Loading](#/components/panels/Loading) | 読み込み中であることを示す、「Loading ...」の大きな文字を出します。 |
| [HelpEmpty](#/components/panels/HelpEmpty) | Help のタブに、まだ中身が無いことを示すパネルです。 |
| [ER](#/components/panels/ER) | ER 図を描くパネルです。 |
| [TM](#/components/panels/TM) | TM (T 字形 ER) の図を描くパネルです。 |
| [Wbs](#/components/panels/Wbs) | WBS の表を出すパネルです。 |
| [Procedures](#/components/panels/Procedures) | 機能の一覧を出すためのパネルです。 |
| [SystemDynamics](#/components/panels/SystemDynamics) | システムダイナミクスの図を出すためのパネルです。 |
| [DesignAssemblies](#/components/panels/DesignAssemblies) | 設計 (`/design`) の「中間組立品」タブ (code は `ui-assemblies`) のパネルです。 |
| [DesignPanels](#/components/panels/DesignPanels) | 設計 (`/design`) の「パネル」タブ (code は `ui-panels`) のパネルです。 |
| [DesignParts](#/components/panels/DesignParts) | 設計 (`/design`) の「部品」タブ (code は `ui-parts`) のパネルです。 |
| [DesignEvents](#/components/panels/DesignEvents) | 設計 (`/design`) の「UI イベント」タブ (code は `ui-events`) のパネルです。 |

## panels.bridge

| 部品 | 内容 |
|---|---|
| [Monitor](#/components/panels/bridge/Monitor) | カードを、石積み (masonry) のレイアウトで並べます。 |
| [Overview](#/components/panels/bridge/Overview) | ポンチ絵 (なんでもありの概念図) を、@yanqirenshi/d3.unchi で、パネル一杯に描きます。 |
| [Card](#/components/panels/bridge/Card) | 艦橋の 1 枚のカードを描きます。 |

## panels.sogh

| 部品 | 内容 |
|---|---|
| [Account](#/components/panels/sogh/Account) | GitHub との接続の状態と、OAuth で認証・切断するボタンを出します。 |
| [Repositories](#/components/panels/sogh/Repositories) | GitHub に接続したアカウント (viewer) のリポジトリの一覧を出します。 |
| [Projects](#/components/panels/sogh/Projects) | GitHub に接続したアカウント (viewer) の Projects の一覧を出します。 |
| [Help](#/components/panels/sogh/Help) | 「Help」という文字だけを出す、仮の部品です。 |

## panels.systemic_design

| 部品 | 内容 |
|---|---|
| [ActantsMap](#/components/panels/systemic_design/ActantsMap) | Systemic Design のツール「ActantsMap」の中身を描くための部品です。 |
| [ActorsMap](#/components/panels/systemic_design/ActorsMap) | Systemic Design のツール「ActorsMap」の中身を描くための部品です。 |
| [AdaptiveCycleStrategy](#/components/panels/systemic_design/AdaptiveCycleStrategy) | Systemic Design のツール「AdaptiveCycleStrategy」の中身を描くための部品です。 |
| [ChangeReadiness](#/components/panels/systemic_design/ChangeReadiness) | Systemic Design のツール「ChangeReadiness」の中身を描くための部品です。 |
| [CollaborationModel](#/components/panels/systemic_design/CollaborationModel) | Systemic Design のツール「CollaborationModel」の中身を描くための部品です。 |
| [Connector](#/components/panels/systemic_design/Connector) | Systemic Design のツール「Connector」の中身を描くための部品です。 |
| [ContextualInterview](#/components/panels/systemic_design/ContextualInterview) | Systemic Design のツール「ContextualInterview」の中身を描くための部品です。 |
| [ContextualVariations](#/components/panels/systemic_design/ContextualVariations) | Systemic Design のツール「ContextualVariations」の中身を描くための部品です。 |
| [EcosystemGovernance](#/components/panels/systemic_design/EcosystemGovernance) | Systemic Design のツール「EcosystemGovernance」の中身を描くための部品です。 |
| [FutureStateScenarios](#/components/panels/systemic_design/FutureStateScenarios) | Systemic Design のツール「FutureStateScenarios」の中身を描くための部品です。 |
| [InfluenceMap](#/components/panels/systemic_design/InfluenceMap) | Systemic Design のツール「InfluenceMap」の中身を描くための部品です。 |
| [InterventionStrategy](#/components/panels/systemic_design/InterventionStrategy) | Systemic Design のツール「InterventionStrategy」の中身を描くための部品です。 |
| [IterativeInquiry](#/components/panels/systemic_design/IterativeInquiry) | Systemic Design のツール「IterativeInquiry」の中身を描くための部品です。 |
| [MulticapitalsSystemsMap](#/components/panels/systemic_design/MulticapitalsSystemsMap) | Systemic Design のツール「MulticapitalsSystemsMap」の中身を描くための部品です。 |
| [NicheDiscovery](#/components/panels/systemic_design/NicheDiscovery) | Systemic Design のツール「NicheDiscovery」の中身を描くための部品です。 |
| [ProcessEnneagram](#/components/panels/systemic_design/ProcessEnneagram) | Systemic Design のツール「ProcessEnneagram」の中身を描くための部品です。 |
| [ResearchQuestions](#/components/panels/systemic_design/ResearchQuestions) | Systemic Design のツール「ResearchQuestions」の中身を描くための部品です。 |
| [RichContext](#/components/panels/systemic_design/RichContext) | Systemic Design のツール「RichContext」の中身を描くための部品です。 |
| [RoadmapForTransitionByDesign](#/components/panels/systemic_design/RoadmapForTransitionByDesign) | Systemic Design のツール「RoadmapForTransitionByDesign」の中身を描くための部品です。 |
| [SocialEcosystem](#/components/panels/systemic_design/SocialEcosystem) | Systemic Design のツール「SocialEcosystem」の中身を描くための部品です。 |
| [StakeholderDimensions](#/components/panels/systemic_design/StakeholderDimensions) | Systemic Design のツール「StakeholderDimensions」の中身を描くための部品です。 |
| [StakeholderMobilisation](#/components/panels/systemic_design/StakeholderMobilisation) | Systemic Design のツール「StakeholderMobilisation」の中身を描くための部品です。 |
| [StoryLoopDiagram](#/components/panels/systemic_design/StoryLoopDiagram) | Systemic Design のツール「StoryLoopDiagram」の中身を描くための部品です。 |
| [SystemsMap](#/components/panels/systemic_design/SystemsMap) | Systemic Design のツール「SystemsMap」の中身を描くための部品です。 |
| [TheoryOfSystemsChangeAndAction](#/components/panels/systemic_design/TheoryOfSystemsChangeAndAction) | Systemic Design のツール「TheoryOfSystemsChangeAndAction」の中身を描くための部品です。 |
| [ThreeHorizons](#/components/panels/systemic_design/ThreeHorizons) | Systemic Design のツール「ThreeHorizons」の中身を描くための部品です。 |
| [ValueProposition](#/components/panels/systemic_design/ValueProposition) | Systemic Design のツール「ValueProposition」の中身を描くための部品です。 |

## parts

| 部品 | 内容 |
|---|---|
| [ErrorBoundary](#/components/parts/ErrorBoundary) | 子の部品を描いている途中で起きたエラーを受け止めて、画面全体が消えないようにします。 |
| [LinkInSite](#/components/parts/LinkInSite) | サイトの中のページへのリンクを描きます。 |
| [LinkOutSite](#/components/parts/LinkOutSite) | 外のサイトへのリンクを描きます。 |
| [LinkWBS](#/components/parts/LinkWBS) | WBS のノードのページ (`/wbs/{wbs_id}`) へのリンクを描きます。 |
| [Tabs](#/components/parts/Tabs) | タブの並びを描きます。 |
| [HeadWbsPage](#/components/parts/HeadWbsPage) | WBS のノードのページの、上の見出しを描きます。 |
| [ItemWbsNode](#/components/parts/ItemWbsNode) | WBS のノードを、「名前 (id)」の形で描きます。 |
