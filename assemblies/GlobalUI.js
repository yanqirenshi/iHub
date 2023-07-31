"use client";
import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from "recoil";

import * as atoms from '../recoil/ATOMS.js';

import Account from '@/assemblies/Account.js';
import Operators from '@/assemblies/Operators.js';

export default function GlobalUI (props) {
    const [window_size, setWindowSize] = useRecoilState(atoms.WINDOW);

    const account_menu = useRecoilValue(atoms.ACCOUNT_MENU);
    const operators = useRecoilValue(atoms.OPERATORS);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = ()=> {
                setWindowSize({w: window.innerWidth, h: window.innerHeight});
            };

            window.addEventListener("resize", handleResize);

            handleResize();

            return () => window.removeEventListener("resize", handleResize);
        } else {
            return null;
        }
    }, []);

    return (
        <>
          <Account menu={account_menu}/>
          <Operators operators={operators} window_size={window_size}/>
        </>
    );
}
