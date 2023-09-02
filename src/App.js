import React from 'react';
import { useRecoilState } from "recoil";

import Box from '@mui/material/Box';

import Account from './assemblies/Account.js';
import Operators from './assemblies/Operators.js';
import * as atoms from './recoil/ATOMS.js';

import Router from './Router.js';
import Github from './Github.js';

export default function App () {
    const [window_size, setWindowSize] = useRecoilState(atoms.WINDOW);
    const [account_menu, setAccountMenu] = useRecoilState(atoms.ACCOUNT_MENU);
    const [operators, setOperators] = useRecoilState(atoms.OPERATORS);

    const actions = {
        menu: {
            change: (new_menu)=> setAccountMenu(new_menu),
        },
        operator: {
            change: (new_operators)=> setOperators(new_operators),
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

          <Account menu={account_menu}
                   actions={actions}/>

          <Operators operators={operators}
                     window_size={window_size}
                     actions={actions}>
            {'a'===operators.active && <div/>}
            {'b'===operators.active && <div/>}
            {'c'===operators.active && <div/>}
          </Operators>

          <Router/>
        </Box>
    );
}
