import * as recoil from 'recoil';

const PAGE_MARKETS = recoil.atom({
    key: "PAGE_MARKETS",
    default: {
        tabs: {
            selected: 'user-scenario',
            list: [
                { code: 'user-scenario',        label: 'ユーザーシナリオ' },
                { code: 'customer-journey-map', label: 'カスタマージャーニーマップ' },
                { code: 'use-case',             label: 'ユースケース' },
                { code: 'wbs',                  label: 'WBS' },
                { code: 'help',                 label: 'Help' },
            ],
        },
    },
});

export default PAGE_MARKETS;
