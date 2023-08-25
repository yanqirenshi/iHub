import * as recoil from 'recoil';

export const PAGE_SCRUM = recoil.atom({
    key: "PAGE_SCRUM",
    default: {
        tabs: {
            selected: 'projects',
            list: [
                { code: 'projects', label: 'Projects' },
                { code: 'account',  label: 'Account' },
                { code: 'help',     label: 'Help' },
            ],
        },
    },
});

export const FETCH_REPOSITORIES = recoil.atom({
    key: "FETCH_REPOSITORIES",
    default: null, // null, Date, true, error
});
