import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import SystemConfigurationDiagram from '../panels/scd/SystemConfigurationDiagram.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_SYSTEMS が重なる)
const PANELS = {
    'system-configuration-diagram': SystemConfigurationDiagram,
    wbs: Wbs,
    help: HelpEmpty,
};

export default function SystemEnvironment () {
    return <TabbedPage pageId="PAGE_SYSTEMS" panels={PANELS}/>;
}
