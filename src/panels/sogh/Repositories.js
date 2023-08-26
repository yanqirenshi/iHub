import Box from '@mui/material/Box';

import { Repositories as SoghRepositories } from 'sogh';

import { useRecoilValue } from "recoil";
import { GITHUB_AUTH } from '../../recoil/GITHUB.js';
import * as atoms from '../../recoil/PAGE_SCRUM.js';

import sogh from '../../manegers/sogh.js';

export default function Repositories () {
    const authed = useRecoilValue(GITHUB_AUTH);

    const repositories = useRecoilValue(atoms.REPOSITORIES(authed));

    return (
        <Box sx={{ p:2, overflow: 'auto', height: '100%' }}>
          <Box sx={{ width: 666, ml:'auto', mr: 'auto', pb: 22 }}>
            <SoghRepositories data={repositories} sogh={sogh}/>
          </Box>
        </Box>
    );
}
