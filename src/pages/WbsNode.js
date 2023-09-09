import React, { lazy, Suspense } from 'react';

import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import S from '@mui/material/Typography';
import Container from '@mui/material/Container';

import Frame from '../frames/Frame.js';
import Loading from '../panels/Loading.js';

// TODO: あと、ページ無いときの処理とかを入れる。
// https://qiita.com/kakken1988/items/9f14480c8a9f0abf7b3b#chunkloaderror-%E3%81%AE%E5%9B%9E%E9%81%BF%E7%AD%96
export default function WbsNode () {
    const {wbs_id} = useParams();

    const Page = lazy(() => import(`./wbs/P${wbs_id}.js`));

    return (
        <Suspense fallback={<Loading/>}>
          <Page/>
        </Suspense>
    );
}
