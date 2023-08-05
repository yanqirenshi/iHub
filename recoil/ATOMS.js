'use client';

import * as recoil from 'recoil';

import DATA_ACCOUNT_MENU from '@/data/ACCOUNT_MENU.js';
import DATA_OPERATORS from '@/data/OPERATORS.js';

function atom (key, val) {
    return recoil.atom({ key: key, default: val });
}

export const ACCOUNT_MENU = atom("ACCOUNT_MENU", DATA_ACCOUNT_MENU);
export const OPERATORS = atom("OPERATORS", DATA_OPERATORS);

export const WINDOW = atom("WINDOW", null); // {w: num, h: num}


export const PAGE_SCRUM = atom("PAGE_SCRUM", {
    bounds: {height:0},
    tabs: {
        selected: '1',
        list: [
            { code: '1', label: 'a' },
            { code: '2', label: 'b' },
        ],
    },
});
