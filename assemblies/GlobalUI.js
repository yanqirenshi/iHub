"use client";
import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from "recoil";

import * as atoms from '@/recoil/ATOMS.js';

import Account from '@/assemblies/Account.js';
import Operators from '@/assemblies/Operators.js';

export default function GlobalUI (props) {
    const [window_size, setWindowSize] = useRecoilState(atoms.WINDOW);
    const [account_menu, setAccountMenu] = useRecoilState(atoms.ACCOUNT_MENU);

    const operators = useRecoilValue(atoms.OPERATORS);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = ()=> setWindowSize({w: window.innerWidth, h: window.innerHeight});
            window.addEventListener("resize", handleResize);

            handleResize();

            return () => window.removeEventListener("resize", handleResize);
        } else {
            return null;
        }
    }, []);

    const actions = {
        menu: {
            change: (new_menu)=> setAccountMenu(new_menu),
        },
    };

    return (
        <>
          <Account menu={account_menu} actions={actions}/>
          <Operators operators={operators} window_size={window_size}/>
        </>
    );
}
