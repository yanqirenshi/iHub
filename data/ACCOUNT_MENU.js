const ACCOUNT_MENU = {
    open: false,
    current_page: 'iHub',
    pages: [
        {
            label: 'iHub',
            items: [
                { url: '/',                          label: 'コックピット' },
                { url: '/business',                  label: 'ビジネス' },
                { url: '/design',                    label: 'デザイン' },
                { url: '/screen',                    label: '画面' },
                { url: '/data',                      label: 'データ' },
                { url: '/classes',                   label: 'クラス' },
                { url: '/system-environment',        label: 'システム構成' },
                { url: '/message',                   label: 'メッセージ' },
                { url: '/wbs',                       label: 'WBS' },
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
                { url: '/screens',                   label: 'Screens' },
                { url: '/assemblies',                label: 'Assemblies' },
                { url: '/parts',                     label: 'Parts' },
                { url: '/batchs',                    label: 'バッチ"処理' },
                { url: '/actions',                   label: 'Action' },
                { url: '/screen-transition-diagram', label: '画面遷移' },
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
                { url: '/account',                   label: 'アカウント' },
                { url: '/auth',                      label: '認証' },
                { url: '/next.js',                   label: 'Next.js' },
            ],
        },
    ],
};

export default ACCOUNT_MENU;
