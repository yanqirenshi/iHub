import Box from '@mui/material/Box';

import {ProjectsV2} from 'sogh';

import { useRecoilValue } from "recoil";
import { GITHUB_AUTH } from '../../recoil/GITHUB.js';
import * as atoms from '../../recoil/PAGE_SCRUM.js';

import sogh from '../../manegers/sogh.js';

export default function Projects () {
    const authed = useRecoilValue(GITHUB_AUTH);

    const projects = useRecoilValue(atoms.PROJECTSV2(authed));

    return (
        <Box sx={{ p:2, overflow: 'auto', height: '100%' }}>
          <Box sx={{ width: 666, ml:'auto', mr: 'auto', pb: 22 }}>
            <ProjectsV2 data={projects} sogh={sogh}/>
          </Box>
        </Box>
    );
}
