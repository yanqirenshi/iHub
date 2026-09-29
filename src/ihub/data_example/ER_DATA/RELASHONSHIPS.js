const SEEDS = [
    { from_id: 30, from_class: 'PORT-ER-OUT',     to_id: 32, to_class: 'PORT-ER-IN',      data_type: 'FK',          hide: false },
    { from_id: 28, from_class: 'COLUMN-INSTANCE', to_id: 32, to_class: 'PORT-ER-IN',      data_type: 'HAVE',        hide: false },
    { from_id: 10, from_class: 'COLUMN-INSTANCE', to_id: 30, to_class: 'PORT-ER-OUT',     data_type: 'HAVE',        hide: false },
    { from_id:  3, from_class: 'TABLE',           to_id: 28, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  3, from_class: 'TABLE',           to_id: 15, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  3, from_class: 'TABLE',           to_id: 14, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  3, from_class: 'TABLE',           to_id: 13, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  2, from_class: 'TABLE',           to_id: 12, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  2, from_class: 'TABLE',           to_id: 11, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  2, from_class: 'TABLE',           to_id: 10, to_class: 'COLUMN-INSTANCE', data_type: 'HAVE',        hide: false },
    { from_id:  9, from_class: 'COLUMN',          to_id: 15, to_class: 'COLUMN-INSTANCE', data_type: 'INSTANCE-OF', hide: false },
    { from_id:  8, from_class: 'COLUMN',          to_id: 14, to_class: 'COLUMN-INSTANCE', data_type: 'INSTANCE-OF', hide: false },
    { from_id:  5, from_class: 'COLUMN',          to_id: 13, to_class: 'COLUMN-INSTANCE', data_type: 'INSTANCE-OF', hide: false },
    { from_id:  7, from_class: 'COLUMN',          to_id: 12, to_class: 'COLUMN-INSTANCE', data_type: 'INSTANCE-OF', hide: false },
    { from_id:  6, from_class: 'COLUMN',          to_id: 11, to_class: 'COLUMN-INSTANCE', data_type: 'INSTANCE-OF', hide: false },
    { from_id:  4, from_class: 'COLUMN',          to_id: 10, to_class: 'COLUMN-INSTANCE', data_type: 'INSTANCE-OF', hide: false },
];

class Builder {
    build (seeds) {
        let i = 10000000;
        return seeds.map((seed) => {
            let obj = {...seed};

            obj._id = i++;
            obj._class = 'EDGE-ER';

            return obj;
        });
    }
};

const RELASHONSHIPS = new Builder().build(SEEDS);

export default RELASHONSHIPS;
