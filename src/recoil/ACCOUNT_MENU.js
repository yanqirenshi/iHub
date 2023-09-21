import * as recoil from 'recoil';

import DATA_ACCOUNT_MENUS from '../data/ACCOUNT_MENUS.js';

function makeItems (list) {
    return list.map(code=> {
        return DATA_ACCOUNT_MENUS[code];
    });
}

const ACCOUNT_MENU = recoil.atom({
    key: "ACCOUNT_MENU",
    default: {
        avater: {
            enterd: false,
            clicked: false,
        },
        menu: {
            enterd: false,
        },
        current_page: 'iHub',
        pages: [
            {
                label: 'iHub',
                items: makeItems([
                    'cockpit',
                    'markets',
                    'business',
                    'design',
                    'screens',
                    'batchs',
                    'data',
                    'classes',
                    'external-resources',
                    'system-environment',
                    'message',
                    'devops',
                    'scrum',
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
        ],
    },
});

export default ACCOUNT_MENU;
