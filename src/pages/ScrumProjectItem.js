import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { useRecoilValue } from "recoil";
// import { GITHUB_AUTH } from '../recoil/GITHUB.js';
import * as atoms from '../recoil/PAGE_SCRUM_PROJECT_ITEM.js';

import Tabs from './ScrumProjectItem/Tabs.js';

import sogh from '../manegers/sogh.js';

import Loading from '../panels/Loading.js';
import Frame from '../assemblies/frames/Frame.js';

import {
    ProjectV2Item, PanelIssue, PanelIssueComments
} from 'sogh';

export default function ScrumProjectItem (props) {
    // let {login, number, id} = useParams();
    let {id} = useParams();

    return (
        <Frame>
          <Box sx={{height:'100%', overflow:'auto'}}>
            <Container sx={{mb:22}}>
              <Suspense fallback={<Loading/>}>
                <Item item_id={id}/>
              </Suspense>
            </Container>
          </Box>
        </Frame>
    );
}

function Item (props) {
    const item_id = props.item_id;

    const [tabs, setTabs] = React.useState({
        selected: 'content',
        list: [
            { code: 'content',   label: 'Content' },
            { code: 'points',    label: 'Points' },
        ],
    });

    // const authed = useRecoilValue(GITHUB_AUTH);
    // const project_item = useRecoilValue(atoms.PROJECTV2_ITEM({
    //     authed: authed,
    //     id: item_id,
    // }));

    const item = sogh.projectV2Item(item_id);

    const typename = item.contentTypename();

    return (
        <>
          {/* Item */}
          <Box>
            <ProjectV2Item item={item}/>
          </Box>

          <Box sx={{mt:3}}>
            <Tabs tabs={tabs}
                  onChange={new_tabs=> setTabs(new_tabs)}/>
          </Box>

          {/* Item Contents*/}
          {'content'===tabs.selected &&
           <Box>
             {'Issue'===typename &&
              <Suspense fallback={<Loading/>}>
                <IssueContent issue_id={item.content().id}/>
              </Suspense>}

             {'DraftIssue'===typename &&
              <div>DraftIssue</div>}
           </Box>}

          {'points'===tabs.selected &&
           <Box>Points</Box>}
        </>
    );
}

function IssueContent (props) {
    const id = props.issue_id;

    const issue_id = useRecoilValue(atoms.ISSUE({id: id}));

    const issue = sogh.issue(issue_id);

    const list = useRecoilValue(atoms.ISSUE_COMMENTS({id: id}));

    const comments = list.map(id=> sogh.issueComment(id));

    return (
        <>
          <PanelIssue data={issue}/>
          <PanelIssueComments comments={comments}/>
        </>
    );
}
