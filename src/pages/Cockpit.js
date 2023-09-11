import React from 'react';

import Frame from '../assemblies/frames/Frame.js';
import { Monitor, Card } from '../panels/cockpit/index.js';

import { useRecoilValue } from "recoil";
import * as atom from '../recoil/ATOMS.js';
import { GITHUB_AUTH } from '../recoil/GITHUB.js';
import { ISSUES } from '../recoil/PAGE_COCKPIT.js';

import sogh from '../manegers/sogh.js';

export default function Cockpit () {
    const window_size = useRecoilValue(atom.WINDOW);

    const authed = useRecoilValue(GITHUB_AUTH);
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
    return issues.reduce((list,issue_id)=> {
        const issue = sogh.issue(issue_id);

        if (issue.assignees().find(ass=>ass.login==="yanqirenshi"))
            list.push({
                type: 'GITHUB ISSUE',
                id: issue_id,
                data: issue,
            });

        return list;
    }, []);
}
