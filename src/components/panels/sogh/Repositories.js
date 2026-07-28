import Box from '@mui/material/Box';

import { Repositories as SoghRepositories } from 'sogh';

import { useSelector } from 'react-redux';
import { useRecoilValue } from "recoil";
import * as atoms from '../../../recoil/PAGE_SCRUM.js';

import sogh from '../../../manegers/sogh.js';
import ErrorBoundary from '../../parts/ErrorBoundary.js';

export default function Repositories () {
    const authed = useSelector(s=> s.githubAuth.value);

    const repository_ids = useRecoilValue(atoms.REPOSITORIES(authed));

    const repositories = Array.isArray(repository_ids)
          ? repository_ids.map(id=> sogh.repository(id)).filter(Boolean)
          : [];

    return (
        <Box sx={{ p:2, overflow: 'auto', height: '100%' }}>
          <Box sx={{ width: 666, ml:'auto', mr: 'auto', pb: 22 }}>
            <ErrorBoundary fallback="Repositories の取得・表示でエラーが発生しました。">
              <SoghRepositories data={repositories} sogh={sogh}/>
            </ErrorBoundary>
          </Box>
        </Box>
    );
}
