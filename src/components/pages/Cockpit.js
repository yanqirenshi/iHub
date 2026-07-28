import React from 'react';

import Frame from '../assemblies/frames/Frame.js';
import { Monitor, Card } from '../panels/cockpit/index.js';

import { useSelector } from 'react-redux';
import { useRecoilValue } from "recoil";
import { ISSUES } from '../../recoil/PAGE_COCKPIT.js';

import sogh from '../../manegers/sogh.js';

export default function Cockpit () {
    const window_size = useSelector(s=> s.window.value);

    const authed = useSelector(s=> s.githubAuth.value);
    const issues = useRecoilValue(ISSUES(authed));

    const cards = [
        ...issues2cards(issues)
    ];

    return (
        <Frame>
          <Monitor window_size={window_size}>
            {cards.map(card=> {
                return <Card key={card.id} data={card}/>;
            })}
          </Monitor>
        </Frame>
    );
}

function issues2cards (issues) {
    if (!Array.isArray(issues))
        return [];

    const viewer = sogh.viewer();
    const viewer_login = viewer ? viewer.login() : null;

    return issues.reduce((list,issue_id)=> {
        const issue = sogh.issue(issue_id);

        if (viewer_login && issue.assignees().find(ass=>ass.login===viewer_login))
            list.push({
                type: 'GITHUB ISSUE',
                id: issue_id,
                data: issue,
            });

        return list;
    }, []);
}
