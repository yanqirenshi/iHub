import * as recoil from 'recoil';

const PAGE_DESIGN = recoil.atom({
    key: "PAGE_DESIGN",
    default: {
        tabs: {
            selected: 'ui-parts',
            list: [
                { code: 'ui-panels',     label: 'パネル' },
                { code: 'ui-assemblies', label: '中間組立品' },
                { code: 'ui-parts',      label: '部品' },
                { code: 'ui-events',     label: 'UI イベント' },
                { code: 'wbs',           label: 'WBS' },
                { code: 'help',          label: 'Help' },
            ],
        },
    },
});

export default PAGE_DESIGN;
