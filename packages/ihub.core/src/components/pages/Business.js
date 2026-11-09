import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import SystemDynamics from '../panels/SystemDynamics.js';
import TM from '../panels/TM.js';
import Procedures from '../panels/Procedures.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_BUSINESS が重なる)
const PANELS = {
    'systemic-design': SystemDynamics,
    tm: TM,
    procedures: Procedures,
    wbs: Wbs,
    help: HelpEmpty,
};

export default function Business () {
    return <TabbedPage pageId="PAGE_BUSINESS" panels={PANELS}/>;
}
