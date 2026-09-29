import { createSlice } from '@reduxjs/toolkit';

const githubAuthSlice = createSlice({
    name: 'githubAuth',
    initialState: { value: null }, // null | 'STARTED' | true | false
    reducers: {
        authStarted (state) {
            state.value = 'STARTED';
        },
        authSucceeded (state) {
            state.value = true;
        },
        authFailed (state) {
            state.value = false;
        },
    },
});

export const { authStarted, authSucceeded, authFailed } = githubAuthSlice.actions;
export default githubAuthSlice.reducer;
