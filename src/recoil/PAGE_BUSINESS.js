import * as recoil from 'recoil';

const PAGE_BUSINESS = recoil.atom({
    key: "PAGE_BUSINESS",
    default: {
        tabs: {
            selected: 'tm',
            list: [
                { code: 'systemic-design', label: 'Systemic Design' },
                { code: 'tm',              label: 'TM' },
                { code: 'procedures',      label: '機能一覧' },
                { code: 'wbs',             label: 'WBS' },
                { code: 'help',            label: 'Help' },
            ],
        },
    },
});

export default PAGE_BUSINESS;
