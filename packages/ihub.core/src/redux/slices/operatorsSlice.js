import { createSlice } from '@reduxjs/toolkit';

const border_width = 3;

// ドックの初期の状態。(roots は、設定の operators.items)
export function initialOperators (roots) {
    return {
        initialized: false,
        active: null,
        // roots['a'|'b'|'c'] is shared singleton data — clone rather than mutate in
        // place, since Immer freezes this slice's initial state.
        list: roots ? [
            roots['a'],
            roots['b'],
            roots['c'],
        ].map(d=> ({
            ...d,
            size: { w: 55, h: 55 },
            position: { x: null, y: null },
            border: { w: border_width },
            branch: {},
        })) : [],
    };
}

// 初期の状態は、createStore が設定から渡す。(preloadedState)
const operatorsSlice = createSlice({
    name: 'operators',
    initialState: initialOperators(),
    reducers: {
        operatorsChanged (state, action) {
            return action.payload;
        },
    },
});

export const { operatorsChanged } = operatorsSlice.actions;
export default operatorsSlice.reducer;
