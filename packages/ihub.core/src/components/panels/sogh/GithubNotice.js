import Box from '@mui/material/Box';

import Link from '../../assemblies/Link.js';

// GitHub から読み込めないときに、出す知らせか。
//   authed: GitHub の接続の状態 (githubAuth.value)。false は、未接続
//   status: 読み込みの状態。'failed' は、失敗
export function hasGithubNotice (authed, status) {
    return authed===false || (authed===true && status==='failed');
}

// GitHub からの読み込みの、失敗と、未接続の知らせ。(Repositories・Projects・艦橋の Cockpit タブが使う)
// 接続は、Scrum のページの Account タブでする。(参照アプリの URL の /scrum?tab=account へ案内する)
//   authed: GitHub の接続の状態 (githubAuth.value)
//   status: 読み込みの状態
//   error:  失敗の文章 (読み込みの thunk の error)
//   name:   読み込むものの名前 (Repositories など)
// 知らせることが無いとき (hasGithubNotice が false) は、何も出さない。
export default function GithubNotice ({ authed, status, error, name }) {
    if (!hasGithubNotice(authed, status))
        return null;

    return (
        <Box role="status" sx={{ p: 2, color: 'rgba(0,0,0,0.6)' }}>
          {authed===false
           ? <>GitHub に接続していません。<Link href="/scrum?tab=account">Account タブ</Link>から、GitHub に接続してください。</>
           : <>{name} を GitHub から読み込めませんでした。{error ? `(${error})` : ''} 接続の状態は、<Link href="/scrum?tab=account">Account タブ</Link>で確かめられます。</>}
        </Box>
    );
}
