import * as recoil from 'recoil';

import DATA_OPERATORS from '../data/OPERATORS.js';

const OPERATORS = recoil.atom({
    key: "OPERATORS",
    default: DATA_OPERATORS,
});

export default OPERATORS;
