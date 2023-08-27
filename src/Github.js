import React from 'react';

import { useRecoilState } from 'recoil';

import * as atom from './recoil/GITHUB.js';

import sogh from './manegers/sogh.js';

export default function Github (props) {
    const [auth, setAuthed] = useRecoilState(atom.GITHUB_AUTH);

    React.useEffect(()=> {
        if (null!==auth) return;

        setAuthed('STARTED');

        sogh.connect(
            process.env.REACT_APP_GITHU_PARSONAL_TOKEN,
            (viewer)=> setAuthed(true),
            (error)=> setAuthed(false),
        );
    }, [auth, setAuthed]); // TODO: setAuthed これ入れたないなぁ。。。


    return null;
}
