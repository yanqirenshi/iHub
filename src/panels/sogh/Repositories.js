import Box from '@mui/material/Box';

import { useRecoilValue } from "recoil";
import { GITHUB_AUTH } from '../../recoil/GITHUB.js';
import * as atoms from '../../recoil/PAGE_SCRUM.js';

import sogh from '../../manegers/sogh.js';

export default function Repositories () {
    const authed = useRecoilValue(GITHUB_AUTH);

    const repositories = useRecoilValue(atoms.REPOSITORIES(authed));

    return (
        <Box>Repositories</Box>
    );
}
