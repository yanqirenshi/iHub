import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import ScreenTransitionDiagram from '../panels/std/ScreenTransitionDiagram.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';


// WBS は、start_id="1" で出す。(部品は、描画のたびに作り直さないよう、ここで 1 つだけ作る)
const WbsFromRoot = ()=> <Wbs start_id="1"/>;

// タブの code → パネルの部品。(設定の panels.PAGE_SCREENS が重なる)
const PANELS = {
    'screen-transition-diagram': ScreenTransitionDiagram,
    wbs: WbsFromRoot,
    help: HelpEmpty,
};

export default function Screens () {
    return <TabbedPage pageId="PAGE_SCREENS" panels={PANELS}/>;
}
