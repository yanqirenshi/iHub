'use client';

import * as recoil from 'recoil';

import DATA_ACCOUNT_MENU from '@/data/ACCOUNT_MENU.js';
import DATA_OPERATORS from '@/data/OPERATORS.js';

function atom (key, val) {
    return recoil.atom({ key: key, default: val });
}

export const ACCOUNT_MENU = atom( "ACCOUNT_MENU", DATA_ACCOUNT_MENU);
export const OPERATORS = atom("OPERATORS", DATA_OPERATORS);