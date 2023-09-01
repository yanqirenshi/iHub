import * as recoil from 'recoil';

const PAGE_MESSAGES = recoil.atom({
    key: "PAGE_MESSAGES",
    default: {
        tabs: {
            selected: 'wbs',
            list: [
                { code: 'model', label: 'Model' },
                { code: 'wbs',   label: 'WBS' },
                { code: 'help',  label: 'Help' },
            ],
        },
    },
});

export default PAGE_MESSAGES;
