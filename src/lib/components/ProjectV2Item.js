import React from 'react';

import RedactedItem from './RedactedItem.js';
import PullRequest from './PullRequest.js';
import DraftIssue from './DraftIssue.js';
import Issue from './Issue.js';

const style ={
    width: '100%',
    height: '100%',
    overflow: 'hidden',
};

export default function ProjectV2Item (props) {
    const item = props.data;
    // const sogh = props.sogh;
    const issue = props.issue;
    const issue_comments = props.issue_comments;

    return (
        <div style={style}>
          {'DRAFT_ISSUE'===item.type()  && <DraftIssue data={item}/>}
          {'ISSUE'===item.type()        && <Issue data={issue} item={item} comments={issue_comments}/>}
          {'PULL_REQUEST'===item.type() && <PullRequest data={item}/>}
          {'REDACTED'===item.type()     && <RedactedItem data={item}/>}
        </div>
    );
}
