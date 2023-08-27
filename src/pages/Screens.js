import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import Frame from '../frames/FrameTabs.js';
import Wbs from '../panels/Wbs.js';
import ScreenTransitionDiagram from '../panels/std/ScreenTransitionDiagram.js';

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
          {'wbs'===tab                       && <Wbs/>}
          {'help'===tab                      && <div>Help.....</div>}
        </Frame>
    );
}
