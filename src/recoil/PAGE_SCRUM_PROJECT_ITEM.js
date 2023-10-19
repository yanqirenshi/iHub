import * as recoil from 'recoil';

import sogh from '../manegers/sogh.js';

export const TABS = recoil.atom({
    key: "PAGE_SCRUM_PROJECT_ITEM_TABS",
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
    key: 'PAGE_SCRUM_PROJECT_ITEM_PROJECTV2',
    get: ({authed, login, number})=> async () => {
        if (!authed)
            return null;

        return await sogh.asyncFetchProjectV2ByUserLoginProjectV2Number(login, number);
    },
});

export const PROJECTV2_ITEMS = recoil.selectorFamily({
    key: 'PAGE_SCRUM_PROJECT_ITEM_PROJECTV2_ITEMS',
    get: ({authed, login, number})=> async () => {
        if (!authed)
            return null;

        return await sogh.asyncFetchProjectV2ItemsByUserLoginProjectV2Number(login, number);
    },
});

export const PROJECTV2_ITEM = recoil.selectorFamily({
    key: 'PAGE_SCRUM_PROJECT_ITEM_PROJECTV2_ITEM',
    get: ({authed, id})=> async () => {
        if (!authed)
            return null;

        return await sogh.asyncFetchProjectV2ItemByID(id);
    },
});

export const ISSUE = recoil.selectorFamily({
    key: 'PAGE_SCRUM_PROJECT_ITEM_ISSUE',
    get: ({id})=> async () => {
        return await sogh.asyncFetchIssueByID(id);
    },
});

export const ISSUE_COMMENTS = recoil.selectorFamily({
    key: 'PAGE_SCRUM_PROJECT_ITEM_ISSUE_COMMENTS',
    get: ({id})=> async () => {
        return await sogh.asyncFetchIssueCommentsByID(id);
    },
});
