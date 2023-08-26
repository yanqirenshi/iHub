import * as recoil from 'recoil';

import sogh from '../manegers/sogh.js';

export const PAGE_SCRUM = recoil.atom({
    key: "PAGE_SCRUM",
    default: {
        tabs: {
            selected: 'projects',
            list: [
                { code: 'timeline',      label: 'Timeline' },
                { code: 'gantt-chart',   label: 'Gantt Chart' },
                { code: 'issues',        label: 'Issues' },
                { code: 'pull-requests', label: 'Pull Requests' },
                { code: 'repositories',  label: 'Repositories' },
                { code: 'projects',      label: 'Projects' },
                { code: 'account',       label: 'Account' },
                { code: 'help',          label: 'Help' },
            ],
        },
    },
});

export const FETCH_REPOSITORIES = recoil.atom({
    key: "FETCH_REPOSITORIES",
    default: null, // null, Date, true, error
});

export const REPOSITORIES = recoil.selectorFamily({
    key: 'REPOSITORIES',
    get: authed => async () => {

        if (authed!==true)
            return [];

        return await sogh.asyncFetchRepositoriesByViewer();
    },
});

export const PROJECTSV2 = recoil.selectorFamily({
    key: 'PROJECTSV2',
    get: authed => async () => {

        if (authed!==true)
            return [];

        return await sogh.asyncFetchProjectsV2ByViewer();
    },
});
