import * as recoil from 'recoil';

import sogh from '../manegers/sogh.js';

export const GITHUB_AUTH = recoil.atom({
    key: "GITHUB_AUTH",
    default: null,
});

export const GITHUB_REPOSITORIES = recoil.selector({
    key: "GITHUB_REPOSITORIES",
    get: async ({get}) => {
        return await sogh.asyncFetchRepositoriesByViewer();
    },
});
