import * as recoil from 'recoil';

import DATA_ACCOUNT_MENUS from '../data/ACCOUNT_MENUS.js';

function makeItems (list) {
    return list.map(code=> {
        return DATA_ACCOUNT_MENUS[code];
    });
}

const PAGES = [
    {
        label: 'iHub',
        items: makeItems([
            'cockpit',
            'markets',
            'business',
            'design',
            'screens',
            'api',
            'batchs',
            'data',
            'classes',
            'external-resources',
            'system-environment',
            'message',
            'devops',
            'scrum',
            'organizations',
            'wbs',
            'help',
        ]),
    },
    {
        label: 'Docs',
        items: makeItems([
            // ux
            'docs.user-scenario',
            'docs.customer-journey-map',
            'docs.use-case',
            'docs.systemic-design',
            'docs.bpmn',
            // ui
            'docs.ui-design',
            'docs.screen-transition-diagram',
            // Application
            'docs.classes',
            'docs.procedures',
            // Model
            'docs.tm',
            'docs.er',
            'docs.uml',
            'docs.pad',
        ]),
    },
    {
        label: 'Etc',
        items: makeItems([
            'system-dynamics',
            'ddd',
            'wbs',
            'account',
            'auth',
            'next.js',
        ]),
    },
];


export const ACCOUNT_MENU = recoil.atom({
    key: "ACCOUNT_MENU",
    default: {
        avater: {
            enterd: false,
            clicked: true,
        },
        menu: {
            enterd: false,
        },
        current_page: 'iHub',
        pages: PAGES,
    },
});


function selectedItem (menu) {
    const page_path = pagePath();

    for (const page of menu) {
        const item = page.items.find(i=>i.url===page_path);

        if (item)
            return item.code;
    }

    return 'cockpit';
}

function pagePath () {
    const root_path = window.location.pathname.split('/')[1] || null;

    return root_path ? '/'+root_path : '/';
}

export const ACCOUNT_MENU_SELECTED_ITEM = recoil.atom({
    key: "ACCOUNT_MENU_SELECTED_ITEM",
    default: selectedItem(PAGES),
});
