import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from "recoil";

import Box from '@mui/material/Box';

import Account from './assemblies/Account.js';
import Operators from './assemblies/Operators.js';
import Router from './Router.js';
import Github from './Github.js';

import * as page from './pages/index.js';

import * as atoms from './recoil/ATOMS.js';

export default function App () {
    const [window_size, setWindowSize] = useRecoilState(atoms.WINDOW);
    const [account_menu, setAccountMenu] = useRecoilState(atoms.ACCOUNT_MENU);

    const operators = useRecoilValue(atoms.OPERATORS);

    const actions = {
        menu: {
            change: (new_menu)=> setAccountMenu(new_menu),
        },
    };

    React.useEffect(()=> {
        const handleResize = ()=> setWindowSize({w: window.innerWidth, h: window.innerHeight});
        handleResize();

        window.addEventListener("resize", handleResize);
    }, [setWindowSize]); // TODO: これなぁ。。。

    return (
        <Box className="theme-color5">
          <Github/>

          <Account menu={account_menu} actions={actions}/>
          <Operators operators={operators} window_size={window_size}/>

          <Router/>
        </Box>
    );
}
