const WBS = [
    {
        id: 1000,
        parent:    1,
        name: 'ビジネス',
    },
    {
        id: 1001,
        parent:    1,
        name: 'デザイン',
    },
    {
        id: 1002,
        parent:    1,
        name: '画面',
    },
    {
        id: 1003,
        parent:    1,
        name: 'データ',
    },
    {
        id: 1004,
        parent:    1,
        name: 'クラス',
    },
    {
        id: 1005,
        parent:    1,
        name: 'システム構成',
    },
    {
        id: 1006,
        parent:    1,
        name: 'メッセージ',
    },
    {
        id: 1007,
        parent: 1001,
        name: 'パネル',
    },
    {
        id: 1008,
        parent: 1001,
        name: '中間組立品',
    },
    {
        id: 1009,
        parent: 1001,
        name: '部品',
    },
    {
        id: 1010,
        parent: 1001,
        name: 'UIイベント',
    },
    {
        id: 1011,
        parent: 1007,
        name: 'account',
    },
    {
        id: 1012,
        parent: 1007,
        name: 'bpmn',
    },
    {
        id: 1013,
        parent: 1007,
        name: 'cockpit',
    },
    {
        id: 1014,
        parent: 1007,
        name: 'ddd',
    },
    {
        id: 1015,
        parent: 1007,
        name: 'design',
    },
    {
        id: 1016,
        parent: 1007,
        name: 'messages',
    },
    {
        id: 1017,
        parent: 1007,
        name: 'scd',
    },
    {
        id: 1018,
        parent: 1007,
        name: 'sogh',
    },
    {
        id: 1019,
        parent: 1007,
        name: 'std',
    },
    {
        id: 1020,
        parent: 1007,
        name: 'systemic_design',
    },
    {
        id: 1021,
        parent: 1002,
        name: 'iHub',
    },
    {
        id: 1022,
        parent: 1002,
        name: 'Docs',
    },
    {
        id: 1023,
        parent: 1002,
        name: 'Etc',
    },
    {
        id: 1024,
        parent: 1023,
        name: 'WBS Nodes',
        description: '/wbs/:id の画面',
    },
    {
        id: 1025,
        parent: 1008,
        name: 'Frames',
        description: 'Panel() のルートコンポーネント',
    },
    {
        id: 1027,
        parent:    1,
        name: '外部リソース',
    },
    {
        id: 1028,
        parent: 1027,
        name: 'npm',
    },
    {
        id: 1029,
        parent: 1,
        name: '思考/指向',
        description: 'business model navigator'
    },
    {
        id: 1030,
        parent: 1029,
        name: 'サービス・ドミナント・ロジック',
        description: 'Service-Dominant Logic, SDL'
    },
    {
        id: 1031,
        parent: 1029,
        name: 'システミック・デザイン',
        description: 'Systemic Design'
    },
    {
        id: 1032,
        parent: 1029,
        name: 'ビジネスモデル・ナビゲーター',
        description: 'business model navigator'
    },
    {
        id: 1033,
        parent: 1029,
        name: 'TM',
        description: ''
    },
];

export default WBS;
