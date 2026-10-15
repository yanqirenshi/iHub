import ICONS from './ICONS.js';

const MAIN = [
    { code: 'cockpit',               url: '/',                      label: 'コックピット', icon: ICONS.cockpit },
    { code: 'markets',               url: '/markets',               label: '市場',         icon: ICONS.markets },
    { code: 'business',              url: '/business',              label: 'ビジネス',     icon: ICONS.business },
    { code: 'design',                url: '/design',                label: 'デザイン',     icon: ICONS.design },
    { code: 'screens',                url: '/screens',                label: '画面',        icon: ICONS.screens },
    { code: 'api',                   url: '/api',                   label: 'API',          icon: ICONS.api },
    { code: 'batchs',                url: '/batchs',                label: 'バッチ',       icon: ICONS.batchs },
    { code: 'data',                  url: '/data',                  label: 'データ',       icon: ICONS.data },
    { code: 'classes',               url: '/classes',               label: 'クラス',       icon: ICONS.classes },
    { code: 'external-resources',    url: '/external-resources',    label: '外部リソース', icon: ICONS.externalResources },
    { code: 'system-environment',    url: '/system-environment',    label: 'システム構成', icon: ICONS.systemEnvironment },
    { code: 'message',               url: '/message',               label: 'メッセージ',   icon: ICONS.message },
    { code: 'devops',                url: '/devops',                label: '*Ops',         icon: ICONS.devops },
    { code: 'scrum',                 url: '/scrum',                 label: 'Scrum',        icon: ICONS.scrum },
    { code: 'help',                  url: '/help',                  label: 'Help',         icon: ICONS.help },
    { code: 'organizations',         url: '/organizations',         label: '組織',         icon: ICONS.organizations },
];

const UX = [
    { code: 'docs.user-scenario',        url: '/user-scenario',        label: 'ユーザーシナリオ',         icon: ICONS.userScenario },
    { code: 'docs.customer-journey-map', url: '/customer-journey-map', label: 'カスタマージャーニーマップ', icon: ICONS.customerJourneyMap },
    { code: 'docs.use-case',             url: '/use-case',             label: 'ユースケース',             icon: ICONS.useCase },
    { code: 'docs.systemic-design',      url: '/systemic-design',      label: 'Systemic Design',          icon: ICONS.systemicDesign },
    { code: 'docs.bpmn',                 url: '/bpmn',                 label: 'BPMN',                     icon: ICONS.bpmn },
];

const UI = [
    { code: 'docs.ui-design',                 url: '/ui-design',                 label: 'UI Design', icon: ICONS.uiDesign },
    { code: 'docs.screen-transition-diagram', url: '/screen-transition-diagram', label: '画面遷移図', icon: ICONS.screenTransitionDiagram },
];

const APP = [
    { code: 'docs.classes',    url: '/classes',    label: 'Class図',   icon: ICONS.classes },
    { code: 'docs.procedures', url: '/procedures', label: '機能一覧', icon: ICONS.procedures },
];

const MODEL = [
    { code: 'docs.tm',  url: '/tm',  label: 'TM',   icon: ICONS.tm },
    { code: 'docs.er',  url: '/er',  label: 'ER図', icon: ICONS.er },
    { code: 'docs.uml', url: '/uml', label: 'UML',  icon: ICONS.uml },
    { code: 'docs.pad', url: '/pad', label: 'PAD',  icon: ICONS.pad },
];

const Etc = [
    { code: 'system-dynamics', url: '/system-dynamics', label: 'System Dynamics', icon: ICONS.systemDynamics },
    { code: 'ddd',             url: '/ddd',             label: 'DDD',             icon: ICONS.ddd },
    { code: 'wbs',             url: '/wbs',             label: 'WBS',             icon: ICONS.wbs },
    { code: 'account',         url: '/account',         label: 'アカウント',       icon: ICONS.account },
    { code: 'auth',            url: '/auth',            label: '認証',             icon: ICONS.auth },
    { code: 'next.js',         url: '/next.js',         label: 'Next.js',         icon: ICONS.nextJs },
];

const ACCOUNT_MENU_ITEMS = [
    ...MAIN,
    ...UX,
    ...UI,
    ...APP,
    ...MODEL,
    ...Etc,
].reduce((ht, item)=> {
    if (ht[item.code])
        throw new Error('Dupulicate code. code='+item.code);

    ht[item.code] = item;

    return ht;
}, {});

function makeItems (list) {
    return list.map(code=> {
        return ACCOUNT_MENU_ITEMS[code];
    });
}

export const PAGES = [
    {
        label: 'iHub',
        items: makeItems([
            'cockpit',
            'markets',
            'business',
            'design',
            'screens',
            'api',
            'batchs',
            'data',
            'classes',
            'external-resources',
            'system-environment',
            'message',
            'devops',
            'scrum',
            'organizations',
            'wbs',
            'help',
        ]),
    },
    {
        label: 'Docs',
        items: makeItems([
            // ux
            'docs.user-scenario',
            'docs.customer-journey-map',
            'docs.use-case',
            'docs.systemic-design',
            'docs.bpmn',
            // ui
            'docs.ui-design',
            'docs.screen-transition-diagram',
            // Application
            'docs.classes',
            'docs.procedures',
            // Model
            'docs.tm',
            'docs.er',
            'docs.uml',
            'docs.pad',
        ]),
    },
    {
        label: 'Etc',
        items: makeItems([
            'system-dynamics',
            'ddd',
            'wbs',
            'account',
            'auth',
            'next.js',
        ]),
    },
];

export default ACCOUNT_MENU_ITEMS;
