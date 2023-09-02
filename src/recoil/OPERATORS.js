import * as recoil from 'recoil';

import ROOTS from '../data/OPERATOR_ITEMS.js';

const border_width = 3;

const OPERATORS = recoil.atom({
    key: "OPERATORS",
    default: {
        initialized: false,
        active: null,
        list: [
            ROOTS['a'],
            ROOTS['b'],
            ROOTS['c'],
        ].map(d=> {
            d.size = { w: 55, h: 55 };
            d.position = { x: null, y: null };
            d.border = { w: border_width };
            d.branch = {};

            return d;
        }),
    },
});

export default OPERATORS;
