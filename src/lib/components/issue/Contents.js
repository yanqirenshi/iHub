import React from 'react';

import Box from '@mui/material/Box';

import Comments from './contents/Comments.js';
import Milestone from './contents/Milestone.js';
import PertGraph from './contents/PertGraph.js';
import Project from './contents/Project.js';

const style ={
    background: 'rgba(254, 244, 244, 1.0)',
    width: '100%',
    height: '100%',
};

export default function Contents (props) {
    // const comments = props.comments;
    const view = props.view;

    return (
        <Box sx={style}>
          {'comments'===view && <Comments />}
          {'part'===view && <Milestone />}
          {'project'===view && <PertGraph />}
          {'milestone'===view && <Project />}
        </Box>
    );
}
