import { configureStore } from '@reduxjs/toolkit';

import windowReducer from './slices/windowSlice.js';
import operatorsReducer, { initialOperators } from './slices/operatorsSlice.js';
import githubAuthReducer from './slices/githubAuthSlice.js';
import accountMenuReducer, { initialAccountMenu } from './slices/accountMenuSlice.js';
import cockpitReducer from './slices/cockpitSlice.js';
import scrumReducer from './slices/scrumSlice.js';
import scrumProjectReducer from './slices/scrumProjectSlice.js';
import scrumProjectItemReducer from './slices/scrumProjectItemSlice.js';
import { dataApi } from './api/dataApi.js';

// 設定 (resolveConfig を通したもの) からストアを作る。
// サイドメニューとドックの初期の状態は設定から決め、設定そのものは、dataApi が使えるように thunk の extra に渡す。
export function createStore (config) {
    return configureStore({
        reducer: {
            window: windowReducer,
            operators: operatorsReducer,
            githubAuth: githubAuthReducer,
            accountMenu: accountMenuReducer,
            cockpit: cockpitReducer,
            scrum: scrumReducer,
            scrumProject: scrumProjectReducer,
            scrumProjectItem: scrumProjectItemReducer,
            [dataApi.reducerPath]: dataApi.reducer,
        },
        preloadedState: {
            operators: initialOperators(config.operators.items),
            accountMenu: initialAccountMenu(config.menus.pages),
        },
        middleware: (getDefaultMiddleware)=> getDefaultMiddleware({
            thunk: { extraArgument: { config } },
        }).concat(dataApi.middleware),
    });
}
