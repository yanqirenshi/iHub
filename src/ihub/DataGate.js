import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import S from '@mui/material/Typography';

import Loading from './components/panels/Loading.js';
import { useGetDataQuery } from './redux/api/dataApi.js';
import { menuPagesChanged } from './redux/slices/accountMenuSlice.js';
import { setWbsData } from './manegers/wbs.js';
import { makePages } from '../config/ACCOUNT_MENUS.js';

// API サーバーからデータを読み込んでから、画面を表示する。
export default function DataGate (props) {
    const { data, error } = useGetDataQuery();
    const dispatch = useDispatch();

    const actives = data?.collections['local/account_menus'];

    // サイドメニューに、個人の設定 (on/off) を反映する。
    useEffect(()=> {
        if (actives)
            dispatch(menuPagesChanged(makePages(actives)));
    }, [actives, dispatch]);

    if (error)
        return <LoadError error={error}/>;

    if (!data)
        return <Loading/>;

    // WBS のマネージャは描画の中でそのまま使われるので、描画の前に作り直す。(同じデータなら何もしない)
    setWbsData(data.collections);

    return props.children;
}

function LoadError (props) {
    const error = props.error;

    return (
        <Box sx={{ p: 6 }}>
          <S variant="h5">データを読み込めませんでした。</S>

          <S sx={{ mt: 2 }}>
            API サーバーが起動しているか、確かめてください。(npm start で、画面と一緒に起動します)
          </S>

          <S sx={{ mt: 2, color: '#888', whiteSpace: 'pre-wrap' }}>
            {error.data?.message || `${error.status} ${error.error || ''}`}
          </S>
        </Box>
    );
}
