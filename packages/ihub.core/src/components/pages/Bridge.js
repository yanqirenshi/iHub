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
import { filterForCockpit } from '../../manegers/cockpitFilter.js';

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

// 画面の隅に出す、小さな知らせ。(絞り込みができなかったときなど)
function QuietNotice ({ children }) {
    return (
        <Box sx={{ mx: 'auto', mb: 1, maxWidth: 666 }}>
          <Typography variant="body2" color="text.secondary">
            {children}
          </Typography>
        </Box>
    );
}

// Cockpit タブ: 自分が担当している Github のイシューのうち、次のどちらかのものだけを、カードで並べる。
//   1. 今日が、Project の Plan の期間 (Plan.Start〜Plan.End・Plan.From〜Plan.To) に入っている。(当日を含む)
//   2. NextAction. で始まる日付 (NextAction.Date など) が入っている。(過ぎていても、先でもよい)
// 並びは、Project の NextAction.Date の近い (早い) 順。日付の無いイシューは、最後で、その中は読み込んだ順。
// カードには、NextAction の日付を出す。(過ぎた日付は、色を変える)
// 日付を読み込めなかったときは、絞らずに、担当のイシューを全部、読み込んだ順に出す。
function CockpitCards () {
    const dispatch = useDispatch();

    const authed = useSelector(s=> s.githubAuth.value);
    const { status, issueIds, error, nextActions, plans, datesError } = useSelector(s=> s.bridge);

    useEffect(()=> {
        if (authed===true && status==='idle')
            dispatch(fetchIssues());
    }, [authed, status, dispatch]);

    if (authed===true && (status==='idle' || status==='loading'))
        return <Loading width="100%" height="100%"/>;

    // 未接続・読み込みの失敗は、空のカードではなく、知らせを出す。
    if (hasGithubNotice(authed, status))
        return <GithubNotice authed={authed} status={status} error={error} name="Issue"/>;

    const assigned = issues2cards(issueIds, nextActions);

    // 日付が読めたときだけ、絞って、近い順に並べる。読めなかったときは、絞らず、読み込んだ順。
    const cards = datesError
          ? assigned
          : orderByNextAction(filterForCockpit(assigned, { plans, next_actions: nextActions }), nextActions);

    if (datesError)
        return (
            <Monitor notice={<QuietNotice>日付を読み込めなかったので、Issue を絞らずに、読み込んだ順に出しています。({datesError})</QuietNotice>}>
              {cards.map(card=> <Card key={card.id} data={card}/>)}
            </Monitor>
        );

    // 担当の Issue はあるのに、絞った結果が 0 件のときは、空の画面ではなく、わけを出す。
    if (assigned.length > 0 && cards.length === 0)
        return (
            <Box sx={{ pt: 3, px: '111px' }}>
              <Typography variant="body1" color="text.secondary" align="center">
                今日が Plan の期間に入っている Issue と、NextAction.Date が入っている Issue がありません。
              </Typography>
            </Box>
        );

    return (
        <Monitor>
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
