import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import Frame from '../frames/FrameTabs.js';
import Overview from '../panels/bpmn/Overview.js';
import PalettesLev1 from '../panels/bpmn/PalettesLev1.js';
import PalettesLev2 from '../panels/bpmn/PalettesLev2.js';
import MethodsAndStylesLev1 from '../panels/bpmn/MethodsAndStylesLev1.js';
import MethodsAndStylesLev2 from '../panels/bpmn/MethodsAndStylesLev2.js';

export default function BPMN () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_BPMN);

    const changeTabs = (tabs)=> {
        const new_page = {...page};
        new_page.tabs = tabs;
        setPageScrum(new_page);
    };

    const tabs = page.tabs;
    const tab = tabs.selected;

    return (
        <Frame tabs={page.tabs}
               onChangeTabs={changeTabs}>
          {'palettes-lev1'===tab       && <PalettesLev1/>}
          {'palettes-lev2'===tab       && <PalettesLev2/>}
          {'methods-styles-lev1'===tab && <MethodsAndStylesLev1/>}
          {'methods-styles-lev2'===tab && <MethodsAndStylesLev2/>}
          {'overview'===tab            && <Overview/>}
        </Frame>
    );
}
