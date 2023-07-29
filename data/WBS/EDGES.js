let i = 1000000000;

export const EDGES = [
    {
        _id: i++,
        from_id: 1,
        from_class: 'PROJECT',
        to_id: 10,
        to_class: 'WBS',
    },
    {
        _id: i++,
        from_id: 10,
        from_class: 'WBS',
        to_id: 100,
        to_class: 'WORKPACKAGE',
    },
];
