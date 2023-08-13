import * as recoil from 'recoil';

const PAGE_BATCHS = recoil.atom({
    key: "PAGE_BATCHS",
    default: {
        tabs: {
            selected: 'wbs',
            list: [
                { code: 'wbs',           label: 'WBS' },
                { code: 'help',          label: 'Help' },
            ],
        },
    },
});

export default PAGE_BATCHS;
