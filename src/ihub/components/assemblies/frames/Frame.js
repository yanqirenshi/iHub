import React from 'react';
import Box from '@mui/material/Box';

import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from "react-router-dom";
import { operatorsChanged } from '../../../redux/slices/operatorsSlice.js';
import { menuChanged, menuOpened, menuClosed } from '../../../redux/slices/accountMenuSlice.js';

import MenuBook from '@yanqirenshi/menubook';
import Manipulater from '@yanqirenshi/manipulater';

import OperatorsLeafs from '../../../../operators/Operators.js';
import { withIcons, withoutIcons } from '../../../../operators/labels.js';
import ACCOUNT_MENU_COLORS from '../../../../config/ACCOUNT_MENU_COLORS.js';
import { DOCK_COLOR } from '../../../manegers/colors.js';

const sx = {
    maxWidth: '100vw',
    height: '100vh',
};

// サイドメニューの背景の色。(src/config/ACCOUNT_MENU_COLORS.js の background)
// null のときは、配色の主の色 (src/config/COLORS.js の main) にする。
// どちらも null のときは、menubook の既定の色になる。
const menu_theme_color = ACCOUNT_MENU_COLORS.background || DOCK_COLOR || undefined;

// サイドメニューの文字の色。(src/config/ACCOUNT_MENU_COLORS.js の text)
// menubook は文字の色を #ffffff に固定し、アイコンを反転して白くしているため、決めてあるときは上書きする。
// メニューを開いているときのアカウントの円の色。(src/config/ACCOUNT_MENU_COLORS.js の avatar)
// menubook は、円を CSS のクラス pair-color1 で塗っているため、決めてあるときは上書きする。
const menu_sx = {
    ...(ACCOUNT_MENU_COLORS.text && {
        '& *': { color: `${ACCOUNT_MENU_COLORS.text} !important` },
        '& img': { filter: 'none !important' },
    }),
    ...(ACCOUNT_MENU_COLORS.avatar && {
        '& .pair-color1': { background: `${ACCOUNT_MENU_COLORS.avatar} !important` },
    }),
};

// サイドメニューで強調する項目の code を、今の URL から決める。(#6)
// menubook は選択中の項目を自分では決めず、渡した code を強調するだけなので、ここで決める。
// URL の先頭 (/business/xxx なら /business) を、表示している項目の url と突き合わせる。
// 見つからないとき (メニューにないページや、個人の設定で隠した項目のページ) は、先頭の項目にする。
// (menubook は、メニューにない code を渡すと落ちる)
function selectedItemCode (pages, pathname) {
    const root_path = '/' + (pathname.split('/')[1] || '');

    for (const page of pages) {
        const item = page.items.find(i=> i.url===root_path);

        if (item)
            return item.code;
    }

    return pages.flatMap(page=> page.items)[0]?.code;
}

export default function Frame (props) {
    const children = props.children;

    const dispatch = useDispatch();
    const window_size = useSelector(s=> s.window.value);
    const operators = useSelector(s=> s.operators);
    const menu = useSelector(s=> s.accountMenu.menu);
    const menu_is_opend = useSelector(s=> s.accountMenu.isOpend);
    const github_avatar_url = useSelector(s=> s.githubAuth.avatarUrl);

    const nav = useNavigate();
    const location = useLocation();

    // メニューのクリックだけでなく、ブラウザの戻る/進むや画面内のリンクで URL が変わったときも追従する。
    const menu_selected_item = React.useMemo(()=> selectedItemCode(menu.pages, location.pathname),
                                             [menu.pages, location.pathname]);

    // Manipulater の useEffect が operators の変化で再実行されるため、参照を固定する。
    const operators_with_icons = React.useMemo(()=> withIcons(operators), [operators]);

    const actions = {
        menu: {
            change: (new_menu)=> dispatch(menuChanged(new_menu)),
            item: {
                // 強調する項目は URL から決めるので、ここでは移動するだけ。
                click: (item)=> nav(item.url),
            },
            open: ()=> dispatch(menuOpened()),
            close: ()=> dispatch(menuClosed()),
        },
        operator: {
            change: (new_operators)=> dispatch(operatorsChanged(withoutIcons(new_operators))),
        },
    };

    return (
        <Box sx={sx}>
          <Box sx={menu_sx}>
            <MenuBook menu={menu}
                      is_opend={menu_is_opend}
                      selected_item={menu_selected_item}
                      icon={github_avatar_url}
                      theme_color={menu_theme_color}
                      actions={actions}/>
          </Box>

          <Manipulater operators={operators_with_icons}
                       window_size={window_size}
                       theme_color={DOCK_COLOR || undefined}
                       actions={actions}
                       leafs={root=> <OperatorsLeafs root={root}/>}/>

          {children}
        </Box>
    );
}
