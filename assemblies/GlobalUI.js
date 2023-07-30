"use client";

import { useRecoilValue } from "recoil";

import * as atoms from '../recoil/ATOMS.js';

import Account from '@/assemblies/Account.js';
import Operators from '@/assemblies/Operators.js';

export default function GlobalUI (props) {
    const account_menu = useRecoilValue(atoms.ACCOUNT_MENU);
    const operators = useRecoilValue(atoms.OPERATORS);

    return (
        <>
          <Account menu={account_menu}/>
          <Operators operators={operators}/>
        </>
    );
}
