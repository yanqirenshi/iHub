import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import Wbs from '../panels/Wbs.js';


// WBS は、start_id={1} で出す。(部品は、描画のたびに作り直さないよう、ここで 1 つだけ作る)
const WbsFromRoot = ()=> <Wbs start_id={1}/>;

// タブの code → パネルの部品。(設定の panels.PAGE_EXTERNAL_RESOURCES が重なる)
const PANELS = {
    wbs: WbsFromRoot,
};

export default function ExternalResources () {
    return <TabbedPage pageId="PAGE_EXTERNAL_RESOURCES" panels={PANELS}/>;
}
