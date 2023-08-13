const ACCOUNT_MENU = {
    open: false,
    current_page: 'iHub',
    pages: [
        {
            label: 'iHub',
            items: [
                { url: '/',                          label: 'コックピット' },
                { url: '/markets',                   label: '市場' },
                { url: '/business',                  label: 'ビジネス' },
                { url: '/design',                    label: 'デザイン' },
                { url: '/screens',                   label: '画面' },
                { url: '/batchs',                    label: 'バッチ' },
                { url: '/data',                      label: 'データ' },
                { url: '/classes',                   label: 'クラス' },
                { url: '/system-environment',        label: 'システム構成' },
                { url: '/message',                   label: 'メッセージ' },
                { url: '/devops',                    label: 'DevOps' },
                { url: '/scrum',                     label: 'Scrum' },
            ],
        },
        {
            label: 'Docs',
            items: [
                // ux
                { url: '/user-scenario',             label: 'ユーザーシナリオ' },
                { url: '/customer-journey-map',      label: 'カスタマージャーニーマップ' },
                { url: '/use-case',                  label: 'ユースケース' },
                { url: '/systemic-design',           label: 'Systemic Design' },
                { url: '/bpmn',                      label: 'BPMN' },
                // ui
                { url: '/ui-design',                 label: 'UI Design' },
                { url: '/screen-transition-diagram', label: '画面遷移図' },
                // Application
                { url: '/classes',                   label: 'Class図' },
                { url: '/procedures',                label: '機能一覧' },
                // Model
                { url: '/tm',                        label: 'TM' },
                { url: '/er',                        label: 'ER図' },
                { url: '/uml',                       label: 'UML' },
            ],
        },
        {
            label: 'Etc',
            items: [
                { url: '/system-dynamics',           label: 'System Dynamics' },
                { url: '/ddd',                       label: 'DDD' },
                { url: '/wbs',                       label: 'WBS' },
                { url: '/account',                   label: 'アカウント' },
                { url: '/auth',                      label: '認証' },
                { url: '/next.js',                   label: 'Next.js' },
            ],
        },
    ],
};

export default ACCOUNT_MENU;
