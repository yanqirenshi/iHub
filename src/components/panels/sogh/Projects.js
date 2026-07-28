import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import {ProjectsV2} from 'sogh';

import { useRecoilValue } from "recoil";
import { GITHUB_AUTH } from '../../../recoil/GITHUB.js';
import * as atoms from '../../../recoil/PAGE_SCRUM.js';

import sogh from '../../../manegers/sogh.js';
import ErrorBoundary from '../../parts/ErrorBoundary.js';

export default function Projects () {
    const authed = useRecoilValue(GITHUB_AUTH);

    const project_ids = useRecoilValue(atoms.PROJECTSV2(authed));

    const projects = Array.isArray(project_ids)
          ? project_ids.map(id=> sogh.projectV2(id)).filter(Boolean)
          : [];

    return (
        <Box sx={{ p:2, overflow: 'auto', height: '100%' }}>
          <Container maxWidth="lg">
            <ErrorBoundary fallback="Projects の取得・表示でエラーが発生しました。">
              <ProjectsV2 data={projects} sogh={sogh}/>
            </ErrorBoundary>
          </Container>
        </Box>
    );
}
