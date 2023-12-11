import * as recoil from 'recoil';

export const WINDOW = recoil.atom({
    key: "WINDOW",
    default: null,  // {w: num, h: num}
});
