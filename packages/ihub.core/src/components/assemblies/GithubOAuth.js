import React from 'react';

import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';

const SOURCE_LABEL = {
    oauth: 'OAuth で得たトークン',
    pat:   '個人用アクセストークン',
};

// GitHub の OAuth の状態と、認証・切断のボタン。
// 認証は API サーバー (@yanqirenshi/ihub.srv の github.mjs) が行い、終わるとこの画面 (今の URL。?tab= などのクエリも含む) に戻る。
export default function GithubOAuth () {
    const location = useLocation();
    const { value, avatarUrl, login, source, configured } = useSelector(s=> s.githubAuth);
    const [error, setError] = React.useState(null);

    const authorize = ()=> {
        window.location.href = `/api/github/oauth/login?return_to=${encodeURIComponent(location.pathname + location.search)}`;
    };

    // OAuth のトークンを捨てて、読み込み直す。(個人用アクセストークンがあれば、そちらでつなぎ直す)
    const disconnect = async ()=> {
        try {
            const res = await fetch('/api/github/token', { method: 'DELETE' });

            if (!res.ok)
                throw new Error(`${res.status}`);

            window.location.reload();
        } catch (e) {
            setError(`接続を切れませんでした。(${e.message})`);
        }
    };

    const connecting = value===null || value==='STARTED';

    return (
        <Box sx={{ my: 1, p: 2, border: '1px solid #eae5e3', borderRadius: 1, background: '#ffffff',
                   display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {value===true
             ? <Avatar src={avatarUrl || undefined} alt={login || ''} sx={{ width: 40, height: 40 }}/>
             : <Avatar sx={{ width: 40, height: 40 }}><GitHubIcon/></Avatar>}

            <Box>
              {connecting && <Typography>接続しています…</Typography>}
              {value===true && (
                  <>
                    <Typography>{login} で接続しています。</Typography>
                    <Typography variant="body2" color="text.secondary">{SOURCE_LABEL[source] || source}</Typography>
                  </>
              )}
              {value===false && <Typography>GitHub に接続していません。</Typography>}
            </Box>
          </Box>

          {configured===false && (
              <Typography variant="body2" color="text.secondary">
                API サーバーに OAuth App が設定されていないので、認証できません。
                環境変数 GITHUB_OAUTH_CLIENT_ID と GITHUB_OAUTH_CLIENT_SECRET (.env.local など) を設定して、API サーバーを起動し直してください。
              </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<GitHubIcon/>}
                    disabled={configured!==true || connecting}
                    onClick={authorize}>
              {source==='oauth' ? 'GitHub で認証し直す' : 'GitHub で認証する'}
            </Button>

            {source==='oauth' && (
                <Button variant="outlined" onClick={disconnect}>
                  接続を切る
                </Button>
            )}
          </Box>

          {error && <Typography variant="body2" color="error">{error}</Typography>}
        </Box>
    );
}
