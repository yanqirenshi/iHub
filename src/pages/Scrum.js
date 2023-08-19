import React from 'react';

import { useRecoilState } from "recoil";
import * as atoms from '../recoil/ATOMS.js';

import * as u from '../libs/yutils/index.js';

import sogh from '../manegers/sogh.js';

import Frame from '../frames/FrameTabs.js';
import Account from '../panels/sogh/Account.js';
import Help from '../panels/sogh/Help.js';
import Projects from '../panels/sogh/Projects.js';

export default function Scrum () {
    const [page, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);
    const [github_repos, setGithubRepos] = useRecoilState(atoms.GITHUB_REPOSITORIES);

    const changeTabs = (tabs)=> {
        const new_page = {...page};
        new_page.tabs = tabs;
        setPageScrum(new_page);
    };

    const tabs = page.tabs;
    const tab = tabs.selected;

    // TODO: なんか recoils の使いかた、根本的なところを調べる必要がありそう。
    // 非同期処理はこれか。。。
    // https://zenn.dev/kyo9bo/articles/58b0ef35837462
    // https://qiita.com/KokiSakano/items/2bbe936aac990eeb295b
    // if (github_repos.start===null) {
    //     const new_github_repos = util.cp(github_repos);

    //     new_github_repos.start = util.ts();
    //     new_github_repos.end = null;
    //     new_github_repos.error = null;

    //     setGithubRepos(new_github_repos);

    //     sogh.fetchRepositoriesByViewer(
    //         (data)=> {
    //             console.log('1---');
    //             console.log(data);
    //             setGithubRepos(new_github_repos);
    //         },
    //         (data)=> {
    //             console.log('2---');
    //             console.log(data);
    //             new_github_repos.end = util.ts();
    //             setGithubRepos(new_github_repos);
    //         },
    //         (e)=> {
    //             console.log('3---');
    //             console.log(e);
    //             new_github_repos.end = util.ts();
    //             setGithubRepos(new_github_repos);
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
