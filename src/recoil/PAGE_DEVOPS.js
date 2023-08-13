import * as recoil from 'recoil';

const PAGE_DEVOPS = recoil.atom({
    key: "PAGE_DEVOPS",
    default: {
        tabs: {
            selected: 'bpmn',
            list: [
                { code: 'bpmn',          label: 'BPMN' },
                { code: 'wbs',           label: 'WBS' },
                { code: 'help',          label: 'Help' },
            ],
        },
    },
});

export default PAGE_DEVOPS;
