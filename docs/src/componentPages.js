// 「コンポーネント」のセクションのページ。(@yanqirenshi/ihub.core の部品を、1 つ 1 ページで説明する)
// 小見出し (groups) ごとに、部品の名前を並べる。並び順が、サイドメニューと「前へ・次へ」の順になる。
// 本文は src/content/components/{dir}/{部品の名前}.md に書く。
import overview from './content/components/index.md?raw';

const FILES = import.meta.glob('./content/components/**/*.md', { query: '?raw', import: 'default', eager: true });

const GROUPS = [
    {
        label: 'assemblies',
        dir: 'assemblies',
        names: [
            'Frame', 'FrameTabs', 'FrameWbsNode', 'FrameWbsNodeTabs',
            'Link', 'TabbedPage', 'TabsSearchParam',
            'Account', 'GithubOAuth',
            'AddWbsNode', 'WBSTable', 'TableTMRelationships',
        ],
    },
    {
        label: 'panels',
        dir: 'panels',
        names: [
            'Loading', 'HelpEmpty',
            'ER', 'TM', 'Wbs', 'Procedures', 'SystemDynamics',
            'DesignAssemblies', 'DesignPanels', 'DesignParts', 'DesignEvents',
        ],
    },
    {
        label: 'panels.cockpit',
        dir: 'panels/cockpit',
        names: ['Monitor', 'Overview', 'Card'],
    },
    {
        label: 'panels.sogh',
        dir: 'panels/sogh',
        names: ['Account', 'Repositories', 'Projects', 'Help'],
    },
    {
        label: 'panels.systemic_design',
        dir: 'panels/systemic_design',
        names: [
            'ActantsMap', 'ActorsMap', 'AdaptiveCycleStrategy', 'ChangeReadiness',
            'CollaborationModel', 'Connector', 'ContextualInterview', 'ContextualVariations',
            'EcosystemGovernance', 'FutureStateScenarios', 'InfluenceMap', 'InterventionStrategy',
            'IterativeInquiry', 'MulticapitalsSystemsMap', 'NicheDiscovery', 'ProcessEnneagram',
            'ResearchQuestions', 'RichContext', 'RoadmapForTransitionByDesign', 'SocialEcosystem',
            'StakeholderDimensions', 'StakeholderMobilisation', 'StoryLoopDiagram', 'SystemsMap',
            'TheoryOfSystemsChangeAndAction', 'ThreeHorizons', 'ValueProposition',
        ],
    },
    {
        label: 'parts',
        dir: 'parts',
        names: ['ErrorBoundary', 'LinkInSite', 'LinkOutSite', 'LinkWBS', 'Tabs', 'HeadWbsPage', 'ItemWbsNode'],
    },
];

function content (dir, name) {
    const md = FILES[`./content/components/${dir}/${name}.md`];

    // 本文を書き忘れたときは、起動したときに気づけるように落とす。
    if (md===undefined)
        throw new Error(`src/content/components/${dir}/${name}.md がありません`);

    return md;
}

export const COMPONENT_SECTION = {
    label: 'コンポーネント',
    pages: [
        { path: '/components', title: 'コンポーネントの一覧', content: overview },
    ],
    groups: GROUPS.map(group=> ({
        label: group.label,
        pages: group.names.map(name=> ({
            path: `/components/${group.dir}/${name}`,
            title: name,
            content: content(group.dir, name),
        })),
    })),
};
