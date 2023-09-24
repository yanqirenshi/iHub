import React from 'react';

import SideMenu from './issue/SideMenu.js';
import Inspector from './issue/Inspector.js';
import Contents from './issue/Contents.js';

const style = {
    width: '100%',
    height: '100%',
    display: 'flex',
    side_menu: {
        position: 'absolute',
    },
    contents: {
        flexGrow: 1,
        height: '100%',
    },
    inspector: {
        width: '30%',
        maxWidth: 555,
        height: '100%',
    },
};

export default function Issue (props) {
    const [views, setViews] = React.useState({
        selected: 'comments',
        list: [
            { code: 'comments',  label: 'Comments' },
            { code: 'part',      label: 'PERT' },
            { code: 'project',   label: 'Project' },
            { code: 'milestone', label: 'Milestone' },
        ],
    });

    const issue = props.data;
    const item = props.item;
    const comments = props.comments;

    const clickMenuItem = (code) => {
        const new_view = {...views};
        new_view.selected = code;
        setViews(new_view);
    };

    return (
        <div style={style}>
          <div style={style.side_menu}>
            <SideMenu data={views} onChange={clickMenuItem}/>
          </div>

          <div style={style.contents}>
            <Contents comments={comments} view={views.selected}/>
          </div>

          <div style={style.inspector}>
            {issue &&
             <Inspector data={issue} item={item} />}
          </div>
        </div>
    );
}
