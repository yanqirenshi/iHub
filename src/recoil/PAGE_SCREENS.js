import * as recoil from 'recoil';

const PAGE_SCREENS = recoil.atom({
    key: "PAGE_SCREENS",
    default: {
        tabs: {
            selected: 'screen-transition-diagram',
            list: [
                { code: 'screen-transition-diagram', label: '画面遷移図' },
                { code: 'screens',                   label: '画面' },
                { code: 'wbs',                       label: 'WBS' },
                { code: 'help',                      label: 'Help' },
            ],
        },
    },
});

export default PAGE_SCREENS;
