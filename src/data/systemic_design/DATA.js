const DATA = [
    {
        label: 'システミックデザイン',
        cards: [
            {
                code: null,
                label: 'デザインジャーニー'
            },
            {
                code: null,
                label: 'システミックデザイン・ツールキット'
            },
        ],
    },
    {
        label: 'システムのフレーミングを行う',
        cards: [
            {
                code: 'ITERATIVE_INQUIRY',
                label: 'イテレーティブ・インクワイアリー',
                imgs: [
                    'ITERATIVE-INQUIRY@02_Framing-the-System.svg',
                ],
            },
            {
                code: 'ACTORS_MAP',
                label: 'アクターズ・マップ',
                imgs: [
                    'ACTORSーMAP@01_Framing_the_System.svg',
                ],
            },
            {
                code: 'RICH_CONTEXT',
                label: 'リッチ コンテクスト',
                imgs: [
                    'RICH-CONTEXT@04_Framing-the-System.svg',
                ],
            },
            {
                code: 'NICHE_DISCOVERY',
                label: 'ニッチ・ディスカバリー',
                imgs: [
                    'NICHE-DISCOVERY@03_Framing-the-System.svg',
                ],
            },
        ],
    },
    {
        label: 'システムの声を聴く',
        cards: [
            {
                code: 'STAKEHOLDER_DIMENSIONS',
                label: 'ステーク ホルダー・ディスカバリー',
                imgs: [
                    'STAKEHOLDER-DIMENSIONS@09_Listening-to-the-System.svg',
                ]
            },
            {
                code: 'RESEARCH_QUESTIONS',
                label: 'リサーチクエスチョン',
                imgs: [
                    'RESEARCH-QUESTIONS@08_Listening-to-the-System.svg',
                ],
            },
            {
                code: 'CONTEXTUAL_INTERVIEW',
                label: 'コンテクスチュアル・インタビュー',
                imgs: [
                    'CONTEXTUAL-INTERVIEW@07_Listening-to-the-system.svg',
                ],
            },
            {
                code: 'ACTANTS_MAP',
                label: 'アクタンツ・マップ',
                imgs: [
                    'ACTANTS-MAP-1@05_Listening-to-the-System.svg',
                    'ACTANTS-MAP-2@06_Listening-to-the-System.svg',
                ],
            },
        ],
    },
    {
        label: 'システムを理解する',
        cards: [
            {
                code: 'SOCIAL_ECOSYSTEM',
                label: 'ソーシャルエコシステム・マップ',
                imgs: [
                    'SOCIAL-ECOSYSTEM-1@20_Understanding-the-System.svg',
                    'SOCIAL-ECOSYSTEM-2@21_Understanding-the-System.svg',
                ],
            },
            {
                code: 'MULTICAPITALS_SYSTEMS_MAP',
                label: 'マルチキャピタルズ・モデル',
                imgs: [
                    'MULTICAPITALS-SYSTEMS-MAP@23_Understanding-the-System.svg',
                ],
            },
            {
                code: 'INFLUENCE_MAP',
                label: 'インフルエンス・マップ',
                imgs: [
                    'INFLUENCE-MAP@25_Understanding-the-System.svg',
                ],
            },
            {
                code: 'STORY_LOOP_DIAGRAM',
                label: 'ストーリー ループ・ダイヤグラム',
                imgs: [
                    'STORY-LOOP-DIAGRAM@22_Understanding-the-System.svg',
                ],
            },
            {
                code: 'SYSTEMS_MAP',
                label: 'システムアーキタイプ',
                imgs: [
                    'SYSTEMS-MAP@24_Understanding-the-System.svg',
                ],
            },
        ],
    },
    {
        label: '望ましい未来を思い描く',
        cards: [
            {
                code: 'VALUE_PROPOSITION',
                label: 'システム バリュー・プロポジション',
                imgs: [
                    'VALUE-PROPOSITION@27_Envisioning-Desired-Futures.svg',
                ],
            },
            {
                code: 'THREE_HORIZONS',
                label: 'スリーホライズン',
                imgs: [
                    'THREE-HORIZONS@26_Envisioning-Desired-Futures.svg',
                ],
            },
            {
                code: null,
                label: 'パラドキシング',
                imgs: [
                    'paradox_card.png',
                ],
            },
            {
                code: null,
                label: 'シンセシス・マップ',
                imgs: [
                    'synthesis_map.png',
                ],
            },
        ],
    },
    {
        label: '可能性の空間を探索する',
        cards: [
            {
                code: 'FUTURE_STATE_SCENARIOS',
                label: 'フューチャーステート・シナリオ',
                imgs: [
                    'FUTURE-STATE-SCENARIOS-1@29_Exploring-the-Possibility-Space.svg',
                    'FUTURE-STATE-SCENARIOS-2@30_Exploring-the-Possibility-Space.svg',
                ],
            },
            {
                code: 'INTERVENTION_STRATEGY',
                label: 'インターベンション・ストラテジー',
                imgs: [
                    'INTERVENTION-STRATEGY-1@32_Exploring-the-Possibility-Space.svg',
                    'INTERVENTION-STRATEGY-2@33_Exploring-the-Possibility-Space.svg',
                ],
            },
            {
                code: null,
                label: 'インターベンション・モデル',
                imgs: [
                    'CONNECTOR@31_Designing-the-intervention-model.svg',
                ],
            },
            {
                code: 'CONTEXTUAL_VARIATIONS',
                label: 'コンテクスチュアル(スペイシャル)・バリエーション',
                imgs: [
                    'CONTEXTUAL-VARIATIONS@28_Exploring-the-Possibility-Space.svg',
                ],
            },
            {
                code: null,
                label: 'アウトカム・マップ',
                imgs: [
                    'outcome_map.png',
                ],
            },
        ],
    },
    {
        label: '変革のプロセスをプランニングする',
        cards: [
            {
                code: 'THEORY_OF_SYSTEMS_CHANGE_AND_ACTION',
                label: 'セオリー・オブ・システムチェンジ・アンド・アクション',
                imgs: [
                    'THEORY-OF-SYSTEMS-CHANGE-AND-ACTION@37_Planning-the-Change-Process.svg',
                ],
            },
            {
                code: 'PROCESS_ENNEAGRAM',
                label: 'プロセス・エニアグラム',
                imgs: [
                    'PROCESS-ENNEAGRAM@36_Planning-the-Change-Process.svg',
                ],
            },
            {
                code: 'CHANGE_READINESS',
                label: 'チェンジ・レディネス・アセスメント',
                imgs: [
                    'CHANGE-READINESS@34_Planning-the-Change-Process.svg',
                ],
            },
            {
                code: 'ECOSYSTEM_GOVERNANCE',
                label: 'エコシステム・ガバナンス',
                imgs: [
                    'ECOSYSTEM-GOVERNANCE@35_Planning-the-Change-Process.svg',
                ],
            },
        ],
    },
    {
        label: '移行を促進する',
        cards: [
            {
                code: 'STAKEHOLDER_MOBILISATION',
                label: 'ステークホルダー・モビライゼーション',
                imgs: [
                    'STAKEHOLDER-MOBILISATION@40_Fostering-the-Transition.svg',
                ],
            },
            {
                code: 'ROADMAP_FOR_TRANSITION_BY_DESIGN',
                label: 'トランジション・バイ・デザイン',
                imgs: [
                    'ROADMAP-FOR-TRANSITION-BY-DESIGN@41_Fostering-the-Transition.svg',
                ],
            },
            {
                code: 'COLLABORATION_MODEL',
                label: 'コラボレーション・モデル',
                imgs: [
                    'COLLABORATION-MODEL@39_Planning-the-Change-Process.svg',
                ],
            },
            {
                code: 'ADAPTIVE_CYCLE_STRATEGY',
                label: 'アダプティブサイクル',
                imgs: [
                    'ADAPTIVE-CYCLE-STRATEGY@38_Fostering-the-Transition.svg',
                ],
            },
        ],
    },
    {
        label: '帰郷：リフレクション',
        cards: [
            {
                code: null,
                label: 'システム指向デザイン(SOD)'
            },
            {
                code: null,
                label: 'ギガマッピングとシンセシスマッピング'
            },
            {
                code: null,
                label: 'システムズダイアログと参加型デザイン'
            },
            {
                code: null,
                label: 'システム変革とトランスフォーメーションデザイン'
            },
            {
                code: null,
                label: '社会生態システム'
            },
            {
                code: null,
                label: '社会システムと組織的ネットワーク'
            },
            {
                code: null,
                label: '社会技術的サービスデザイン'
            },
        ],
    },
];

export default DATA;
