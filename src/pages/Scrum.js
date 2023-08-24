import React from 'react';

import { useRecoilState, useRecoilValue } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import {GITHUB_AUTH, GITHUB_REPOSITORIES} from '../recoil/GITHUB.js';

import * as u from '../libs/yutils/index.js';

import sogh from '../manegers/sogh.js';

import Frame from '../frames/FrameTabs.js';
import Account from '../panels/sogh/Account.js';
import Help from '../panels/sogh/Help.js';
import Projects from '../panels/sogh/Projects.js';

export default function Scrum () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);
    const authed = useRecoilValue(GITHUB_AUTH);
    // const repositories = useRecoilValue(GITHUB_REPOSITORIES);

    console.log(authed);

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

          {'projects'===tab && <Projects/>}
          {'account'===tab && <Account/>}
          {'help'===tab && <Help/>}
        </Frame>
    );
}
