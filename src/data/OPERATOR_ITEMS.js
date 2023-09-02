const border_width = 3;

const ROOTS = [
    {
        code: 'a',
        label: {
            type: 'text',
            val: 'X',
        },
        reaf: {},
    },
    {
        code: 'b',
        label: {
            type: 'text',
            val: 'Y',
        },
        reaf: {},
    },
    {
        code: 'c',
        label: {
            type: 'text',
            val: 'Z',
        },
        reaf: {},
    },
].map(d=> {
    d.size = { w: 55, h: 55 };
    d.position = { x: null, y: null };
    d.border = { w: border_width };
    d.branch = {};

    return d;
}).reduce((ht, item)=> {
    if (ht[item.code])
        throw new Error('Dupulicate code. code='+item.code);

    ht[item.code] = item;

    return ht;
}, {});

export default ROOTS;
