import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { authStarted, authSucceeded, authFailed } from './redux/slices/githubAuthSlice.js';

import { useConfig } from './config.js';
import sogh from './manegers/sogh.js';

export default function Github (props) {
    const { github } = useConfig();
    const dispatch = useDispatch();
    const auth = useSelector(s=> s.githubAuth.value);

    React.useEffect(()=> {
        if (null!==auth) return;

        dispatch(authStarted());

        sogh.connect(
            github.token,
            (viewer)=> dispatch(authSucceeded({ avatarUrl: viewer.avatarUrl() })),
            (error)=> dispatch(authFailed()),
        );
    }, [auth, github, dispatch]); // TODO: setAuthed これ入れたないなぁ。。。


    return null;
}
