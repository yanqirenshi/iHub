import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

import Panels from '../panels/design/Panels.js';
import Assemblies from '../panels/design/Assemblies.js';
import Parts from '../panels/design/Parts.js';
import Events from '../panels/design/Events.js';

// WBS は、start_id="1" で出す。(部品は、描画のたびに作り直さないよう、ここで 1 つだけ作る)
const WbsFromRoot = ()=> <Wbs start_id="1"/>;

// タブの code → パネルの部品。(設定の panels.PAGE_DESIGN が重なる)
const PANELS = {
    'ui-panels': Panels,
    'ui-assemblies': Assemblies,
    'ui-parts': Parts,
    'ui-events': Events,
    wbs: WbsFromRoot,
    help: HelpEmpty,
};

export default function Design () {
    return <TabbedPage pageId="PAGE_DESIGN" panels={PANELS}/>;
}
