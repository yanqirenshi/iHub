import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import Frame from '../frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import SystemConfigurationDiagram from '../panels/scd/SystemConfigurationDiagram.js';

export default function SystemEnvironment () {
    const [page_data, setPageData] = useRecoilState(atoms.PAGE_SYSTEMS);

    const changeTabs = (tabs)=> {
        const new_page_data = {...page_data};
        new_page_data.tabs = tabs;
        setPageData(new_page_data);
    };

    const tabs = page_data.tabs;
    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          {'system-configuration-diagram'===tab && <SystemConfigurationDiagram/>}
          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <div>Help....</div>}
        </Frame>
    );
}
