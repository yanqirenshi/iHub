import * as recoil from 'recoil';

const PAGE_API = recoil.atom({
    key: "PAGE_API",
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

export default PAGE_API;
