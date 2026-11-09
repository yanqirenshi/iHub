import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';
import Model from '../panels/messages/Model.js';

// タブの code → パネルの部品。(設定の panels.PAGE_MESSAGES が重なる)
const PANELS = {
    model: Model,
    wbs: Wbs,
    help: HelpEmpty,
};

export default function Messages () {
    return <TabbedPage pageId="PAGE_MESSAGES" panels={PANELS}/>;
}
