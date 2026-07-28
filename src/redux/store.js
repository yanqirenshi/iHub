import { configureStore } from '@reduxjs/toolkit';

import windowReducer from './slices/windowSlice.js';
import operatorsReducer from './slices/operatorsSlice.js';

export const store = configureStore({
    reducer: {
        window: windowReducer,
        operators: operatorsReducer,
    },
});
