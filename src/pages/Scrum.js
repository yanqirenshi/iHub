import React, {Suspense} from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/PAGE_SCRUM.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import * as panel from '../panels/sogh/index.js';
import HelpEmpty from '../panels/HelpEmpty.js';
import Loading from '../panels/Loading.js';

export default function Scrum () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM_TABS);

    const tabs = page.tabs;
    const tab = tabs.selected;

    const changeTabs = (tabs)=> {
        const new_page = {...page};
        new_page.tabs = tabs;
        setPageScrum(new_page);
    };

    return (
        <Frame tabs={page.tabs}
               onChangeTabs={changeTabs}>

          <Suspense fallback={<Loading/>}>
            {'repositories'===tab && <panel.Repositories/>}
            {'projects'===tab && <panel.Projects/>}
            {'account'===tab && <panel.Account/>}
            {'help'===tab && <HelpEmpty/>}
          </Suspense>
        </Frame>
    );
}
