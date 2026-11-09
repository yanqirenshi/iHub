import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import Overview from '../panels/ddd/Overview.js';
import LayerArchitecture from '../panels/ddd/LayerArchitecture.js';
import UbiquitousLanguage from '../panels/ddd/UbiquitousLanguage.js';
import ModelDrivenDesign from '../panels/ddd/ModelDrivenDesign.js';
import HandsOnModeler from '../panels/ddd/HandsOnModeler.js';
import DeclarativeDesign from '../panels/ddd/DeclarativeDesign.js';

// タブの code → パネルの部品。(設定の panels.PAGE_DDD が重なる)
const PANELS = {
    overview: Overview,
    'layer-architecture': LayerArchitecture,
    'ubiquitous-language': UbiquitousLanguage,
    'model-driven-design': ModelDrivenDesign,
    'hands-on-modeler': HandsOnModeler,
    'declarative-design': DeclarativeDesign,
};

export default function DDD () {
    return <TabbedPage pageId="PAGE_DDD" panels={PANELS}/>;
}
