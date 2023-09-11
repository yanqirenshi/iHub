import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../../recoil/ATOMS.js';

import Frame from '../../assemblies/frames/FrameTabs.js';
import Overview from '../../panels/bpmn/Overview.js';
import Palettes from '../../panels/bpmn/Palettes.js';
import Methods from '../../panels/bpmn/Methods.js';
import Styles from '../../panels/bpmn/Styles.js';

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
          {'palettes'===tab && <Palettes/>}
          {'methods'===tab  && <Methods/>}
          {'styles'===tab   && <Styles/>}
          {'overview'===tab            && <Overview/>}
        </Frame>
    );
}
