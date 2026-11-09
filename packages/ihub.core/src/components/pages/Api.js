import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_API が重なる)
const PANELS = {
    wbs: Wbs,
    help: HelpEmpty,
};

export default function Api () {
    return <TabbedPage pageId="PAGE_API" panels={PANELS}/>;
}
