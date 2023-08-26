import * as recoil from 'recoil';

import sogh from '../manegers/sogh.js';

export const PAGE_SCRUM = recoil.atom({
    key: "PAGE_SCRUM",
    default: {
        tabs: {
            selected: 'repositories',
            list: [
                { code: 'repositories', label: 'Repositories' },
                { code: 'projects',     label: 'Projects' },
                { code: 'account',      label: 'Account' },
                { code: 'help',         label: 'Help' },
            ],
        },
    },
});

export const FETCH_REPOSITORIES = recoil.atom({
    key: "FETCH_REPOSITORIES",
    default: null, // null, Date, true, error
});

export const REPOSITORIES = recoil.selectorFamily({
  key: 'UserName',
    get: authed => async () => {

        if (authed!==true)
            return [];

        return await sogh.asyncFetchRepositoriesByViewer();

        // return [1,2];

        // const response = await myDBQuery({userID});

        // if (response.error) {
        //   throw response.error;
        // }
        //   return response.name;
  },
});
