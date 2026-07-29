import { createSlice } from '@reduxjs/toolkit';

import DATA_ACCOUNT_MENUS from '../../../data/ACCOUNT_MENUS.js';

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

function pagePath () {
    const root_path = window.location.pathname.split('/')[1] || null;

    return root_path ? '/'+root_path : '/';
}

function selectedItem (pages) {
    const page_path = pagePath();

    for (const page of pages) {
        const item = page.items.find(i=>i.url===page_path);

        if (item)
            return item.code;
    }

    return 'cockpit';
}

// NOTE: selectedItem(PAGES) reads window.location.pathname eagerly, at the
// moment this module is first evaluated (same timing as the original recoil
// atom's default value) — this only reflects the correct initial route
// because it runs once, at app startup, before any navigation happens.
const accountMenuSlice = createSlice({
    name: 'accountMenu',
    initialState: {
        menu: {
            avater: { enterd: false, clicked: true },
            menu: { enterd: false },
            current_page: 'iHub',
            pages: PAGES,
        },
        selectedItem: selectedItem(PAGES),
        isOpend: false,
    },
    reducers: {
        menuChanged (state, action) {
            state.menu = action.payload;
        },
        menuOpened (state) {
            state.isOpend = true;
        },
        menuClosed (state) {
            state.isOpend = false;
        },
        menuItemSelected (state, action) {
            state.selectedItem = action.payload;
        },
    },
});

export const { menuChanged, menuOpened, menuClosed, menuItemSelected } = accountMenuSlice.actions;
export default accountMenuSlice.reducer;
