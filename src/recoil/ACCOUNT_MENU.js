import * as recoil from 'recoil';

import DATA_ACCOUNT_MENU from '../data/ACCOUNT_MENU.js';

const ACCOUNT_MENU = recoil.atom({
    key: "ACCOUNT_MENU",
    default: DATA_ACCOUNT_MENU,
});

export default ACCOUNT_MENU;
