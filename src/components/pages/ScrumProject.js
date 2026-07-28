import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';

import { useSelector } from 'react-redux';
import { useRecoilValue } from "recoil";
import * as atoms from '../../recoil/PAGE_SCRUM_PROJECT.js';

import Loading from '../panels/Loading.js';
import Frame from '../assemblies/frames/Frame.js';

import {ProjectV2Contents, ProjectV2Details} from 'sogh';

import sogh from '../../manegers/sogh.js';

export default function ScrumProject (props) {
    return (
        <Suspense fallback={<Loading/>}>
          <Project/>
        </Suspense>
    );
}

function Project () {
    let {login, number} = useParams();

    const authed = useSelector(s=> s.githubAuth.value);
    const project = useRecoilValue(atoms.PROJECTV2({
        authed: authed ,
        login: login,
        number: number,
    }));
    const project_items = useRecoilValue(atoms.PROJECTV2_ITEMS({
        authed: authed ,
        login: login,
        number: number,
    }));

    return (
        <Frame>
          <Box sx={{width:'100%', height:'100%', overflow: 'auto'}}>
            <ProjectV2Contents project={sogh.projectV2(project)}/>
            <ProjectV2Details project={sogh.projectV2(project)}
                              items={project_items.map(id=> sogh.projectV2Item(id))}/>
          </Box>
        </Frame>
    );
}
