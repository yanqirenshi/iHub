// WBS の表 (@yanqirenshi/table.wbs) の見た目。index.css より先に読み、iHub 側で上書きできるようにする
import 'bulma/css/bulma.min.css';
import './index.css';

import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';

import { ConfigProvider, resolveConfig } from './config.js';
import { createStore } from './redux/store.js';
import { globalStyles, makeTheme } from './manegers/colors.js';
import { windowResized } from './redux/slices/windowSlice.js';
import DataGate from './DataGate.js';
import Github from './Github.js';

// 窓の大きさを、ストアに知らせ続ける。
function useWindowSize () {
    const dispatch = useDispatch();

    React.useEffect(()=> {
        const handleResize = ()=> dispatch(windowResized({
            w: window.innerWidth,
            h: window.innerHeight
        }));

        handleResize();

        window.addEventListener('resize', handleResize);

        return ()=> window.removeEventListener('resize', handleResize);
    }, [dispatch]);
}

function Body ({ children }) {
    useWindowSize();

    return (
        <Box className="theme-color5">
          <Github/>

          {children}
        </Box>
    );
}

// iHub の画面全体。
// テーマ・全体のスタイル・Redux のストア・ルーター・データの読み込み・GitHub の接続・窓の大きさの監視をまとめ、
// children (アプリの Router など) を描く。
//
//   <IHub config={config}>
//     <Router/>
//   </IHub>
//
// config は、config.js の形。モジュールの中で 1 つだけ作って渡す。(作り直すと、ストアも作り直される)
export default function IHub ({ config, children }) {
    const resolved = React.useMemo(()=> resolveConfig(config), [config]);
    const store = React.useMemo(()=> createStore(resolved), [resolved]);
    const theme = React.useMemo(()=> makeTheme(resolved.colors), [resolved]);
    const styles = React.useMemo(()=> globalStyles(resolved.colors), [resolved]);

    return (
        <ConfigProvider config={resolved}>
          <ThemeProvider theme={theme}>
            <GlobalStyles styles={styles}/>
            <Provider store={store}>
              <BrowserRouter>
                <DataGate>
                  <Body>{children}</Body>
                </DataGate>
              </BrowserRouter>
            </Provider>
          </ThemeProvider>
        </ConfigProvider>
    );
}

export { IHub };
