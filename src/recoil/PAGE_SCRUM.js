import * as recoil from 'recoil';

const PAGE_SCRUM = recoil.atom({
    key: "PAGE_SCRUM",
    default: {
        tabs: {
            selected: 'projects',
            list: [
                { code: 'projects', label: 'Projects' },
                { code: 'account',  label: 'Account' },
                { code: 'help',     label: 'Help' },
            ],
        },
    },
});

export default PAGE_SCRUM;
