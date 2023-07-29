'use client';
import * as React from 'react';
import { RecoilRoot, atom } from 'recoil';

import ACCOUNT_MENU from '@/data/ACCOUNT_MENU.js';
import OPERATORS from '@/data/OPERATORS.js';

// ちょっと良くわかってない。
// これがなせ必要なのか。
// 以下を真似しているかんじ。
// https://qiita.com/KokiSakano/items/834958e4ac3cbacfad3a#app-router%E3%81%A7%E3%81%AErecoil%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9
// 不要なら削除しても良さそう。
export default function Provider(props) {
    const children = props.children;

    React.useEffect(()=> {
        const account_menu = atom({
            key: "ACCOUNT_MENU",
            default: ACCOUNT_MENU,
        });

        const operators = atom({
            key: "OPERATORS",
            default: OPERATORS,
        });
    }, []);

    return (
        <RecoilRoot>
          {children}
        </RecoilRoot>
    );
}
