import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function DevOps () {
    const [page_data, setPageData] = useRecoilState(atoms.PAGE_DEVOPS);

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

          {'bpmn'===tab && <div/>}
          {'wbs'===tab && <Wbs/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}
