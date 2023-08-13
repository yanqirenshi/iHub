import * as recoil from 'recoil';

const PAGE_SYSTEMS = recoil.atom({
    key: "PAGE_SYSTEMS",
    default: {
        tabs: {
            selected: 'system-configuration-diagram',
            list: [
                { code: 'system-configuration-diagram', label: 'システム構成図' },
                { code: 'wbs',                          label: 'WBS' },
                { code: 'help',                         label: 'Help' },
            ],
        },
    },
});

export default PAGE_SYSTEMS;
