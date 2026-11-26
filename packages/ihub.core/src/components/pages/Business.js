import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import SystemDynamics from '../panels/SystemDynamics.js';
import TM from '../panels/TM.js';
import { TmAttributes, TmEntities, TmIdentifiers, TmRelationships } from '../panels/tm/TmTables.js';
import Procedures from '../panels/Procedures.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

// タブの code → パネルの部品。(設定の panels.PAGE_BUSINESS が重なる)
const PANELS = {
    'systemic-design': SystemDynamics,
    tm: TM,
    // TM のデータの表 (0.12.0 から。見るだけ)
    entities: TmEntities,
    identifiers: TmIdentifiers,
    attributes: TmAttributes,
    relationships: TmRelationships,
    procedures: Procedures,
    wbs: Wbs,
    help: HelpEmpty,
};

export default function Business () {
    return <TabbedPage pageId="PAGE_BUSINESS" panels={PANELS}/>;
}
