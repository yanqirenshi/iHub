import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/PAGE_ACCOUNT.js';

import Frame from '../frames/FrameTabs.js';

export default function Account () {
    const [tabs, setTabs] = useRecoilState(atoms.PAGE_ACCOUNT_TABS);

    const changeTabs = (new_tabs)=> setTabs(new_tabs);

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'menus'===tab && <div/>}
          {'operators'===tab && <div/>}
        </Frame>
    );
}
