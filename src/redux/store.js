import { configureStore } from '@reduxjs/toolkit';

import windowReducer from './slices/windowSlice.js';
import operatorsReducer from './slices/operatorsSlice.js';
import githubAuthReducer from './slices/githubAuthSlice.js';
import accountMenuReducer from './slices/accountMenuSlice.js';

export const store = configureStore({
    reducer: {
        window: windowReducer,
        operators: operatorsReducer,
        githubAuth: githubAuthReducer,
        accountMenu: accountMenuReducer,
    },
});
