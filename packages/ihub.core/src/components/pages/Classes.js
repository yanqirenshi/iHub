import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import ClassesPanel from '../panels/Classes.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_CLASSES が重なる)
const PANELS = {
    'class-diagram': ClassesPanel,
    wbs: Wbs,
    help: HelpEmpty,
};

export default function Classes () {
    return <TabbedPage pageId="PAGE_CLASSES" panels={PANELS}/>;
}
