import React, { useEffect } from 'react';

import TabbedPage from '../assemblies/TabbedPage.js';
import { Monitor, Card, Overview, Schedule } from '../panels/bridge/index.js';
import Loading from '../panels/Loading.js';
import GithubNotice, { hasGithubNotice } from '../panels/sogh/GithubNotice.js';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../redux/slices/bridgeSlice.js';

import sogh from '../../manegers/sogh.js';
import { orderByNextAction } from '../../manegers/nextAction.js';

// タブの code → パネルの部品。(設定の panels.PAGE_BRIDGE が重なる。古い名前の panels.PAGE_COCKPIT も効く。config.js)
// CockpitCards は、下にある。(関数の宣言は先に使える)
const PANELS = {
    cockpit: CockpitCards,
    overview: Overview,
    schedule: Schedule,
};

// 艦橋のページ。(古い名前は pages.Cockpit。pages/index.js)
export default function Bridge () {
    return <TabbedPage pageId="PAGE_BRIDGE" panels={PANELS}/>;
}

// Cockpit タブ: 自分が担当している Github のイシューをカードで並べる。
// 並びは、Project の NextAction.Date の近い (早い) 順。日付の無いイシューは、最後で、その中は読み込んだ順。
// カードには、NextAction の日付を出す。(過ぎた日付は、色を変える)
function CockpitCards () {
    const dispatch = useDispatch();

    const authed = useSelector(s=> s.githubAuth.value);
    const { status, issueIds, error, nextActions, nextActionsError } = useSelector(s=> s.bridge);

    useEffect(()=> {
        if (authed===true && status==='idle')
            dispatch(fetchIssues());
    }, [authed, status, dispatch]);

    if (authed===true && (status==='idle' || status==='loading'))
        return <Loading width="100%" height="100%"/>;

    // 未接続・読み込みの失敗は、空のカードではなく、知らせを出す。
    if (hasGithubNotice(authed, status))
        return <GithubNotice authed={authed} status={status} error={error} name="Issue"/>;

    const cards = orderByNextAction(issues2cards(issueIds, nextActions), nextActions);

    // 日付を読み込めなかったときも、カードは、読み込んだ順で出す。
    const notice = nextActionsError
          ? (
              <Box sx={{ mx: 'auto', mb: 1, maxWidth: 666 }}>
                <Typography variant="body2" color="text.secondary">
                  NextAction の日付を読み込めなかったので、カードは、読み込んだ順に並べています。({nextActionsError})
                </Typography>
              </Box>
          )
          : null;

    return (
        <Monitor notice={notice}>
          {cards.map(card=> {
              return <Card key={card.id} data={card}/>;
          })}
        </Monitor>
    );
}

function issues2cards (issues, next_actions = {}) {
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
                next_action: next_actions[issue_id] || null,
            });

        return list;
    }, []);
}
