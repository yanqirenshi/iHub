import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import ScreenTransitionDiagram from '../panels/std/ScreenTransitionDiagram.js';
import Wbs from '../panels/Wbs.js';
import HelpEmpty from '../panels/HelpEmpty.js';

export default function Screens () {
    const [page_data, setPageData] = useRecoilState(atoms.PAGE_SCREENS);

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

          {'screen-transition-diagram'===tab && <ScreenTransitionDiagram/>}
          {'wbs'===tab && <Wbs start_id="1002"/>}
          {'help'===tab && <HelpEmpty/>}
        </Frame>
    );
}
