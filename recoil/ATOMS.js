'use client';

import { atom } from 'recoil';

import DATA_ACCOUNT_MENU from '@/data/ACCOUNT_MENU.js';
import DATA_OPERATORS from '@/data/OPERATORS.js';

export const ACCOUNT_MENU = atom({
    key: "ACCOUNT_MENU",
    default: DATA_ACCOUNT_MENU,
});

export const OPERATORS = atom({
    key: "OPERATORS",
    default: DATA_OPERATORS,
});
