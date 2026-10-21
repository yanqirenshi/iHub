import React from 'react';
import Box from '@mui/material/Box';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { operatorsChanged } from '../../../redux/slices/operatorsSlice.js';
import { menuChanged, menuOpened, menuClosed, menuItemSelected } from '../../../redux/slices/accountMenuSlice.js';

import MenuBook from '@yanqirenshi/menubook';
import Manipulater from '@yanqirenshi/manipulater';

import OperatorsLeafs from '../../../../operators/Operators.js';
import { withIcons, withoutIcons } from '../../../../operators/labels.js';
import ACCOUNT_MENU_COLORS from '../../../../config/ACCOUNT_MENU_COLORS.js';

const sx = {
    maxWidth: '100vw',
    height: '100vh',
};

// サイドメニューの背景の色。(src/config/ACCOUNT_MENU_COLORS.js の background)
// null のときは、menubook の既定の色になる。
const menu_theme_color = ACCOUNT_MENU_COLORS.background;

// サイドメニューの文字の色。(src/config/ACCOUNT_MENU_COLORS.js の text)
// menubook は文字の色を #ffffff に固定し、アイコンを反転して白くしているため、決めてあるときは上書きする。
const menu_sx = ACCOUNT_MENU_COLORS.text ? {
    '& *': { color: `${ACCOUNT_MENU_COLORS.text} !important` },
    '& img': { filter: 'none !important' },
} : {};

export default function Frame (props) {
    const children = props.children;

    const dispatch = useDispatch();
    const window_size = useSelector(s=> s.window.value);
    const operators = useSelector(s=> s.operators);
    const menu = useSelector(s=> s.accountMenu.menu);
    const menu_is_opend = useSelector(s=> s.accountMenu.isOpend);
    const menu_selected_item = useSelector(s=> s.accountMenu.selectedItem);
    const github_avatar_url = useSelector(s=> s.githubAuth.avatarUrl);

    const nav = useNavigate();

    // Manipulater の useEffect が operators の変化で再実行されるため、参照を固定する。
    const operators_with_icons = React.useMemo(()=> withIcons(operators), [operators]);

    const actions = {
        menu: {
            change: (new_menu)=> dispatch(menuChanged(new_menu)),
            item: {
                click: (item)=> {
                    nav(item.url);

                    dispatch(menuItemSelected(item.code));
                },
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
                       actions={actions}
                       leafs={root=> <OperatorsLeafs root={root}/>}/>

          {children}
        </Box>
    );
}
