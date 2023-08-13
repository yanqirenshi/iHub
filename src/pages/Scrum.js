import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

// import * as util from '../tools/utilities.js';

// import sogh from '../manegers/sogh.js';

import Frame from '../frames/FrameTabs.js';
import Account from '../panels/sogh/Account.js';
import Help from '../panels/sogh/Help.js';
import Projects from '../panels/sogh/Projects.js';

export default function Scrum () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);
    // const [github, setGithub] = useRecoilState(atoms.GITHUB);

    const changeTabs = (tabs)=> {
        const new_page = {...page};
        new_page.tabs = tabs;
        setPageScrum(new_page);
    };

    const tabs = page.tabs;
    const tab = tabs.selected;

    // TODO: なんか recoils の使いかた、根本的なところを調べる必要がありそう。
    // if (github.repositories.start===null) {
    //     const new_github = util.cp(github);
    //     new_github.repositories.start = util.ts();

    //     setGithub(new_github);

    //     sogh.fetchRepositoriesByViewer(
    //         (data)=> {
    //         },
    //         (data)=> {
    //         },
    //         (e)=> {
    //         });
    // }

    // console.log(sogh.pool('repository').list());

    return (
        <Frame tabs={page.tabs}
               onChangeTabs={changeTabs}>

          {'projects'===tab && <Projects/>}
          {'account'===tab && <Account/>}
          {'help'===tab && <Help/>}
        </Frame>
    );
}
