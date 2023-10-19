import * as recoil from 'recoil';

import sogh from '../manegers/sogh.js';

export const TABS = recoil.atom({
    key: "PAGE_SCRUM_PROJECT_TABS",
    default: {
        tabs: {
            selected: 'list',
            list: [
                { code: 'metrix',      label: 'Metrix' },
                { code: 'list',        label: 'List' },
                { code: 'gantt-chart', label: 'Gantt Chart' },
                { code: 'part-graph',  label: 'Part Graph' },
                { code: 'points',      label: 'Points' },
                { code: 'description', label: 'Description' },
            ],
        },
    },
});

export const PROJECTV2 = recoil.selectorFamily({
    key: 'PAGE_SCRUM_PROJECT_PROJECTV2',
    get: ({authed, login, number})=> async () => {
        if (!authed)
            return null;

        return await sogh.asyncFetchProjectV2ByUserLoginProjectV2Number(login, number);
    },
});

export const PROJECTV2_ITEMS = recoil.selectorFamily({
    key: 'PAGE_SCRUM_PROJECT_PROJECTV2_ITEMS',
    get: ({authed, login, number})=> async () => {
        if (!authed)
            return null;

        return await sogh.asyncFetchProjectV2ItemsByUserLoginProjectV2Number(login, number);
    },
});
