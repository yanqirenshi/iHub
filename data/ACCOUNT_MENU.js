const ACCOUNT_MENU = {
    current_page: 0,
    pages: [
        {
            label: '1',
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
            label: '2',
            items: [
                { url: '/next.js',                   label: 'Next.js' },
                { url: '/bpmn',                      label: 'BPMN' },
                { url: '/ddd',                       label: 'DDD' },
                { url: '/screen-transition-diagram', label: '画面遷移' },
                { url: '/tm',                        label: 'TM' },
                { url: '/er',                        label: 'ER図' },
                { url: '/uml',                       label: 'UML' },
                { url: '/systemic-design',           label: 'Systemic Design' },
                { url: '/system-dynamics',           label: 'System Dynamics' },
            ],
        },
        {
            label: '3',
            items: [
                { url: '/account',                   label: 'アカウント' },
                { url: '/auth',                      label: '認証' },
            ],
        },
    ],
};

export default ACCOUNT_MENU;
