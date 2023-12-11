import React from 'react';
import { useRecoilState } from "recoil";

import Box from '@mui/material/Box';

import {WINDOW} from './recoil/WINDOW.js';

import Router from './Router.js';
import Github from './Github.js';

export default function App () {
    const setWindowSize = useRecoilState(WINDOW)[1];

    React.useEffect(()=> {
        const handleResize= ()=> setWindowSize({
            w: window.innerWidth,
            h: window.innerHeight
        });

        handleResize();

        window.addEventListener("resize", handleResize);
    }, [setWindowSize]);

    return (
        <Box className="theme-color5">
          <Github/>

          <Router/>
        </Box>
    );
}
