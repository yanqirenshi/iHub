import * as recoil from 'recoil';

import sogh from '../manegers/sogh.js';

export const ISSUES = recoil.selectorFamily({
    key: 'ISSUES',
    get: authed => async () => {
        if (authed!==true)
            return [];

        return await sogh.asyncFetchIssueByViewer();
    },
});
