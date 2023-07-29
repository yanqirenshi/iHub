const OPERATORS = [
    {
        code: 'a',
        label: { type: 'text', val: 'X' },
        position: { x: null, y: null },
    },
    {
        code: 'b',
        label: { type: 'text', val: 'Y' },
        position: { x: null, y: null },
    },
    {
        code: 'c',
        label: { type: 'text', val: 'Z' },
        position: { x: null, y: null },
    },
].map(d=> {
    // size use default
    d.size = { w: 66, h: 66 };

    return d;
});

export default OPERATORS;
