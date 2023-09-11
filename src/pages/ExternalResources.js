import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/PAGE_EXTERNAL_RESOURCES.js';

import Frame from '../assemblies/frames/FrameTabs.js';

import Wbs from '../panels/Wbs.js';

export default function ExternalResources () {
    const [tabs, setTabs] = useRecoilState(atoms.PAGE_EXTERNAL_RESOURCES_TABS);

    const changeTabs = (new_tabs)=> setTabs(new_tabs);

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>
          {'wbs' === tab && <Wbs start_id={1027}/>}
        </Frame>
    );
}
