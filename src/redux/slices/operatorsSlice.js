import { createSlice } from '@reduxjs/toolkit';

import ROOTS from '../../data/OPERATOR_ITEMS.js';

const border_width = 3;

function buildInitial () {
    return {
        initialized: false,
        active: null,
        // ROOTS['a'|'b'|'c'] is shared singleton data (also still read directly by the
        // not-yet-migrated src/recoil/OPERATORS.js during the transition) — clone rather
        // than mutate in place, otherwise Immer's freeze of this slice's state collides
        // with the other consumer's own in-place mutation of the same objects.
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
