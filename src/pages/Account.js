import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/PAGE_ACCOUNT.js';

import Frame from '../assemblies/frames/FrameTabs.js';

import Menus from '../panels/account/Menus.js';
import Operators from '../panels/account/Operators.js';
import Pages from '../panels/account/Pages.js';

export default function Account () {
    const [tabs, setTabs] = useRecoilState(atoms.PAGE_ACCOUNT_TABS);

    const changeTabs = (new_tabs)=> setTabs(new_tabs);

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'menus'     === tab && <Menus/>}
          {'operators' === tab && <Operators/>}
          {'pages'     === tab && <Pages/>}
        </Frame>
    );
}
