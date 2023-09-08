import * as recoil from 'recoil';

const PAGE_BPMN = recoil.atom({
    key: "PAGE_BPMN",
    default: {
        tabs: {
            selected: 'palettes',
            list: [
                { code: 'palettes', label: 'Palettes' },
                { code: 'styles',   label: 'Styles' },
                { code: 'methods',  label: 'Methods' },
                { code: 'overview', label: 'Overview' },
            ],
        },
    },
});

export default PAGE_BPMN;
