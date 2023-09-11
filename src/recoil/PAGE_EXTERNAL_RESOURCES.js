import * as recoil from 'recoil';

export const PAGE_EXTERNAL_RESOURCES_TABS = recoil.atom({
    key: "PAGE_EXTERNAL_RESOURCES_TABS",
    default: {
        selected: 'wbs',
        list: [
            { code: 'wbs', label: 'Wbs' },
        ],
    },
});
