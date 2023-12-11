import Box from '@mui/material/Box';

import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import * as menu from '../../recoil/ACCOUNT_MENU.js';
import OPERATORS from '../../recoil/OPERATORS.js';
import {WINDOW} from '../../recoil/WINDOW.js';

import MenuBook from '@yanqirenshi/menubook';
import Manipulater from '@yanqirenshi/manipulater';

import OperatorsLeafs from '../../Operators.js';

const sx = {
    maxWidth: '100vw',
    height: '100vh',
};

export default function Frame (props) {
    const children = props.children;

    const [window_size, setWindowSize] = useRecoilState(WINDOW);
    const [account_menu, setAccountMenu] = useRecoilState(menu.ACCOUNT_MENU);
    const [account_menu_selected_item, setAccountMenuSelectedItem] = useRecoilState(menu.ACCOUNT_MENU_SELECTED_ITEM);
    const [operators, setOperators] = useRecoilState(OPERATORS);

    const nav = useNavigate();

    const actions = {
        menu: {
            change: (new_menu)=> setAccountMenu(new_menu),
            item: {
                click: (item)=> {
                    nav(item.url);

                    setAccountMenuSelectedItem(item.code);
                },
            }
        },
        operator: {
            change: (new_operators)=> setOperators(new_operators),
        },
    };

    return (
        <Box sx={sx}>
          <MenuBook menu={account_menu}
                    selected_item={account_menu_selected_item}
                    actions={actions}/>

          <Manipulater operators={operators}
                       window_size={window_size}
                       actions={actions}
                       leafs={root=> <OperatorsLeafs root={root}/>}/>

          {children}
        </Box>
    );
}
