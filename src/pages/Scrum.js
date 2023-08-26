import React, {Suspense} from 'react';

import { useRecoilState, useRecoilValue } from "recoil";
import * as atoms from '../recoil/PAGE_SCRUM.js';

import * as u from '../libs/yutils/index.js';

import sogh from '../manegers/sogh.js';

import Frame from '../frames/FrameTabs.js';
import * as panel from '../panels/sogh/index.js';

export default function Scrum () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);

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

          <Suspense fallback={<div>サスペンドしたらこれが表示される</div>}>
            {'repositories'===tab && <panel.Repositories/>}
            {'projects'===tab && <panel.Projects/>}
            {'account'===tab && <panel.Account/>}
            {'help'===tab && <panel.Help/>}
          </Suspense>
        </Frame>
    );
}
