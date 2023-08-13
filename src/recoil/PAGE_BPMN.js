import * as recoil from 'recoil';

const PAGE_BPMN = recoil.atom({
    key: "PAGE_BPMN",
    default: {
        tabs: {
            selected: 'palettes-lev1',
            list: [
                { code: 'palettes-lev1',       label: 'Palettes (Lev1)' },
                { code: 'palettes-lev2',       label: 'Palettes (Lev2)' },
                { code: 'styles',              label: 'Styles' },
                { code: 'methods-styles-lev1', label: 'Methods & Styles (Lev1)' },
                { code: 'methods-styles-lev2', label: 'Methods & Styles (Lev2)' },
                { code: 'overview',            label: 'Overview' },
            ],
        },
    },
});

export default PAGE_BPMN;
