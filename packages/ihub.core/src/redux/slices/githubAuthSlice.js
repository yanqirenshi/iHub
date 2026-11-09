import { createSlice } from '@reduxjs/toolkit';

const githubAuthSlice = createSlice({
    name: 'githubAuth',
    initialState: {
        value: null, // null | 'STARTED' | true | false
        avatarUrl: null, // ログインした Github アカウントの画像の URL
        login: null, // ログインした Github アカウントの名前
        source: null, // 接続に使ったトークン。null | 'oauth' (OAuth で得たもの) | 'pat' (個人用アクセストークン)
        configured: null, // API サーバーに OAuth App が設定されているか。null (まだ分からない) | true | false
    },
    reducers: {
        authStarted (state) {
            state.value = 'STARTED';
        },
        // OAuth App が設定されているか (API サーバーの /api/github/token の configured)
        oauthConfigured (state, action) {
            state.configured = action.payload;
        },
        authSucceeded (state, action) {
            state.value = true;
            state.avatarUrl = action.payload?.avatarUrl || null;
            state.login = action.payload?.login || null;
            state.source = action.payload?.source || null;
        },
        authFailed (state) {
            state.value = false;
            state.avatarUrl = null;
            state.login = null;
            state.source = null;
        },
    },
});

export const { authStarted, oauthConfigured, authSucceeded, authFailed } = githubAuthSlice.actions;
export default githubAuthSlice.reducer;
