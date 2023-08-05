"use client";

import { useRecoilState } from "recoil";
import * as atoms from '@/recoil/ATOMS.js';

import Box from '@mui/material/Box';
import Frame from '@/frames/FrameTabs.js';

import Account from '@/panels/sogh/Account.js';
import Help from '@/panels/sogh/Help.js';
import Projects from '@/panels/sogh/Projects.js';

export default function Scrum () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);

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

          {'projects'===tab && <Projects/>}
          {'account'===tab && <Account/>}
          {'help'===tab && <Help/>}
        </Frame>
    );
}
