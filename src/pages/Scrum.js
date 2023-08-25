import React from 'react';

import { useRecoilState, useRecoilValue } from "recoil";
import {GITHUB_AUTH} from '../recoil/GITHUB.js';
import * as atoms from '../recoil/PAGE_SCRUM.js';

import * as u from '../libs/yutils/index.js';

import sogh from '../manegers/sogh.js';

import Frame from '../frames/FrameTabs.js';
import Account from '../panels/sogh/Account.js';
import Help from '../panels/sogh/Help.js';
import Projects from '../panels/sogh/Projects.js';

export default function Scrum () {
    const authed = useRecoilValue(GITHUB_AUTH);
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);
    const [fetch_repositories, setFetchRepositories] = useRecoilState(atoms.FETCH_REPOSITORIES);
    // const [fetch_projectsV2, setFetchProjectsV2] = useRecoilState(atoms.FETCH_PROJECTSV2);

    React.useEffect(()=> {
        if (authed!==true || null!==fetch_repositories) return;

        setFetchRepositories(new Date());

        sogh.fetchRepositoriesByViewer(
            ()=>      setFetchRepositories(true),
            (error)=> setFetchRepositories(error));
    }, [fetch_repositories]);

    // React.useEffect(()=> {
    //     if (null!==fetch_repositories) return;

    //     setFetchRepositories(new Date());

    //     sogh.fetchRepositoriesByViewer(
    //         ()=>      setFetchRepositories(true),
    //         (error)=> setFetchRepositories(error));
    // }, [fetch_repositories]);

    if (authed!==true)
        return null;

    // console.log(sogh.repositories().length);

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
