import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import Frame from '../assemblies/frames/FrameTabs.js';

import SystemDynamics from '../panels/SystemDynamics.js';
import TM from '../panels/TM.js';
import Procedures from '../panels/Procedures.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Business () {
    const [page_data, setPageData] = useRecoilState(atoms.PAGE_BUSINESS);

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

          {'systemic-design'===tab && <SystemDynamics/>}
          {'tm'===tab              && <TM/>}
          {'procedures'===tab      && <Procedures/>}
          {'wbs'===tab             && <Wbs/>}
          {'help'===tab            && <HelpEmpty/>}
        </Frame>
    );
}
