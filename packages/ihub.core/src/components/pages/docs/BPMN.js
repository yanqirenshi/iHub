import React from 'react';

import TabbedPage from '../../assemblies/TabbedPage.js';
import Overview from '../../panels/bpmn/Overview.js';
import Palettes from '../../panels/bpmn/Palettes.js';
import Methods from '../../panels/bpmn/Methods.js';
import Styles from '../../panels/bpmn/Styles.js';

// タブの code → パネルの部品。(設定の panels.PAGE_BPMN が重なる)
const PANELS = {
    palettes: Palettes,
    methods: Methods,
    styles: Styles,
    overview: Overview,
};

export default function BPMN () {
    return <TabbedPage pageId="PAGE_BPMN" panels={PANELS}/>;
}
