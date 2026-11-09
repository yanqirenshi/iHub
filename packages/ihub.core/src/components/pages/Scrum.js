import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import * as panel from '../panels/sogh/index.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_SCRUM が重なる)
const PANELS = {
    repositories: panel.Repositories,
    projects: panel.Projects,
    account: panel.Account,
    help: HelpEmpty,
};

export default function Scrum () {
    return <TabbedPage pageId="PAGE_SCRUM" panels={PANELS}/>;
}
