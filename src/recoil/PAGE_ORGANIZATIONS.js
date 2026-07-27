import * as recoil from 'recoil';

const PAGE_ORGANIZATIONS = recoil.atom({
    key: "PAGE_ORGANIZATIONS",
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

export default PAGE_ORGANIZATIONS;
