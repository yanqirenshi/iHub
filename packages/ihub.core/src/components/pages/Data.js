import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import ER from '../panels/ER.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_DATA が重なる)
const PANELS = {
    'er-diagram': ER,
    wbs: Wbs,
    help: HelpEmpty,
};

export default function Data () {
    return <TabbedPage pageId="PAGE_DATA" panels={PANELS}/>;
}
