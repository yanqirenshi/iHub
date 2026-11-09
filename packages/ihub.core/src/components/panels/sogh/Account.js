import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import GithubOAuth from '../../assemblies/GithubOAuth.js';

// Scrum のページの Account タブ。GitHub との接続 (OAuth の認証・切断) を出す。
export default function Account () {
    return (
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <Container maxWidth="sm" sx={{ pt: 5, pb: 10 }}>
            <GithubOAuth/>
          </Container>
        </Box>
    );
}
