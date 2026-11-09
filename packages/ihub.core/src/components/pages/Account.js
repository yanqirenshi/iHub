import React from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import Menus from '../panels/account/Menus.js';
import Operators from '../panels/account/Operators.js';
import Pages from '../panels/account/Pages.js';

// タブの code → パネルの部品。(設定の panels.PAGE_ACCOUNT が重なる)
const PANELS = {
    menus: Menus,
    operators: Operators,
    pages: Pages,
};

export default function Account () {
    return <TabbedPage pageId="PAGE_ACCOUNT" panels={PANELS}/>;
}
