const MAIN = [
    { code: 'cockpit',               url: '/',                      label: 'コックピット' },
    { code: 'markets',               url: '/markets',               label: '市場' },
    { code: 'business',              url: '/business',              label: 'ビジネス' },
    { code: 'design',                url: '/design',                label: 'デザイン' },
    { code: 'screens',               url: '/screens',               label: '画面' },
    { code: 'batchs',                url: '/batchs',                label: 'バッチ' },
    { code: 'data',                  url: '/data',                  label: 'データ' },
    { code: 'classes',               url: '/classes',               label: 'クラス' },
    { code: 'external-resources',    url: '/external-resources',    label: '外部リソース' },
    { code: 'system-environment',    url: '/system-environment',    label: 'システム構成' },
    { code: 'message',               url: '/message',               label: 'メッセージ' },
    { code: 'devops',                url: '/devops',                label: 'DevOps' },
    { code: 'scrum',                 url: '/scrum',                 label: 'Scrum' },
];

const UX = [
    { code: 'docs.user-scenario',        url: '/user-scenario',        label: 'ユーザーシナリオ' },
    { code: 'docs.customer-journey-map', url: '/customer-journey-map', label: 'カスタマージャーニーマップ' },
    { code: 'docs.use-case',             url: '/use-case',             label: 'ユースケース' },
    { code: 'docs.systemic-design',      url: '/systemic-design',      label: 'Systemic Design' },
    { code: 'docs.bpmn',                 url: '/bpmn',                 label: 'BPMN' },
];

const UI = [
    { code: 'docs.ui-design',                 url: '/ui-design',                 label: 'UI Design' },
    { code: 'docs.screen-transition-diagram', url: '/screen-transition-diagram', label: '画面遷移図' },
];

const APP = [
    { code: 'docs.classes',    url: '/classes',    label: 'Class図' },
    { code: 'docs.procedures', url: '/procedures', label: '機能一覧' },
];

const MODEL = [
    { code: 'docs.tm',  url: '/tm',  label: 'TM' },
    { code: 'docs.er',  url: '/er',  label: 'ER図' },
    { code: 'docs.uml', url: '/uml', label: 'UML' },
    { code: 'docs.pad', url: '/pad', label: 'PAD' },
];

const Etc = [
    { code: 'system-dynamics', url: '/system-dynamics', label: 'System Dynamics' },
    { code: 'ddd',             url: '/ddd',             label: 'DDD' },
    { code: 'wbs',             url: '/wbs',             label: 'WBS' },
    { code: 'account',         url: '/account',         label: 'アカウント' },
    { code: 'auth',            url: '/auth',            label: '認証' },
    { code: 'next.js',         url: '/next.js',         label: 'Next.js' },
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

export default ACCOUNT_MENU_ITEMS;
