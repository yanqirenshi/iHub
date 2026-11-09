import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useConfig } from './config.js';
import { authStarted, oauthConfigured, authSucceeded, authFailed } from './redux/slices/githubAuthSlice.js';

import sogh from './manegers/sogh.js';

// 接続に使うトークンを決める。
// OAuth で得たトークン (API サーバーがメモリに持つ) を先に使い、無ければ個人用アクセストークン (設定の github.token) を使う。
// API サーバーに OAuth App が設定されていない (configured: false) ときは、個人用アクセストークンだけで接続する。
async function chooseToken (dispatch, pat) {
    try {
        const res = await fetch('/api/github/token');

        if (res.ok) {
            const { configured, token } = await res.json();

            dispatch(oauthConfigured(configured));

            if (token)
                return { token, source: 'oauth' };
        }
    } catch (e) {
        // API サーバーが動いていないときは、個人用アクセストークンだけで試す。
    }

    return pat ? { token: pat, source: 'pat' } : null;
}

export default function Github (props) {
    const dispatch = useDispatch();
    const { github } = useConfig();
    const auth = useSelector(s=> s.githubAuth.value);

    React.useEffect(()=> {
        if (null!==auth) return;

        dispatch(authStarted());

        chooseToken(dispatch, github.token).then(chosen=> {
            if (!chosen) {
                dispatch(authFailed());
                return;
            }

            sogh.connect(
                chosen.token,
                (viewer)=> dispatch(authSucceeded({ avatarUrl: viewer.avatarUrl(), login: viewer.login(), source: chosen.source })),
                (error)=> dispatch(authFailed()),
            );
        });
    }, [auth, github, dispatch]); // TODO: setAuthed これ入れたないなぁ。。。


    return null;
}
