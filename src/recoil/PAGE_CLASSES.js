import * as recoil from 'recoil';

const PAGE_CLASSES = recoil.atom({
    key: "PAGE_CLASSES",
    default: {
        tabs: {
            selected: 'class-diagram',
            list: [
                { code: 'class-diagram', label: 'クラス図' },
                { code: 'wbs',           label: 'WBS' },
                { code: 'help',          label: 'Help' },
            ],
        },
    },
});

export default PAGE_CLASSES;
