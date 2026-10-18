import { createSlice } from '@reduxjs/toolkit';

import ROOTS from '../../../data/OPERATOR_ITEMS.js';

const border_width = 3;

// 画面の再読み込みの後に開き直すドックのボタン (code) を、sessionStorage に記録するキー。
const REOPEN_KEY = 'ihub.operators.reopen';

// 再読み込みの後に、code のボタンの吹き出しを開き直すように記録する。(null で取り消す)
export function requestReopen (code) {
    try {
        if (code)
            window.sessionStorage.setItem(REOPEN_KEY, code);
        else
            window.sessionStorage.removeItem(REOPEN_KEY);
    } catch (e) {
        // sessionStorage が使えない場合は、開き直さないだけにする。
    }
}

// 記録された code を取り出して消す。(開き直すのは 1 回だけ)
function takeReopen () {
    try {
        const code = window.sessionStorage.getItem(REOPEN_KEY);

        window.sessionStorage.removeItem(REOPEN_KEY);

        return ROOTS[code] ? code : null;
    } catch (e) {
        return null;
    }
}

function buildInitial () {
    return {
        initialized: false,
        active: takeReopen(),
        // ROOTS['a'|'b'|'c'] is shared singleton data — clone rather than mutate in
        // place, since Immer freezes this slice's initial state.
        list: [
            ROOTS['a'],
            ROOTS['b'],
            ROOTS['c'],
        ].map(d=> ({
            ...d,
            size: { w: 55, h: 55 },
            position: { x: null, y: null },
            border: { w: border_width },
            branch: {},
        })),
    };
}

const operatorsSlice = createSlice({
    name: 'operators',
    initialState: buildInitial(),
    reducers: {
        operatorsChanged (state, action) {
            return action.payload;
        },
    },
});

export const { operatorsChanged } = operatorsSlice.actions;
export default operatorsSlice.reducer;
