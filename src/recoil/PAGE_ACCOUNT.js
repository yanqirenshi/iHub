import * as recoil from 'recoil';

export const PAGE_ACCOUNT_TABS = recoil.atom({
    key: "PAGE_ACCOUNT_TABS",
    default: {
        selected: 'menus',
        list: [
            { code: 'menus',     label: 'Menus' },
            { code: 'operators', label: 'Operators' },
            { code: 'pages',     label: 'Pages' },
        ],
    },
});
