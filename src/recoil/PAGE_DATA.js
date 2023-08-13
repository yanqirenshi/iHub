import * as recoil from 'recoil';

const PAGE_DATA = recoil.atom({
    key: "PAGE_DATA",
    default: {
        tabs: {
            selected: 'er-diagram',
            list: [
                { code: 'er-diagram', label: 'ER図' },
                { code: 'wbs',        label: 'WBS' },
                { code: 'help',       label: 'Help' },
            ],
        },
    },
});

export default PAGE_DATA;
