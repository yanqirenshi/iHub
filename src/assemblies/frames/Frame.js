import Box from '@mui/material/Box';

import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import * as MENU from '../../recoil/ACCOUNT_MENU.js';
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

    const [window_size] = useRecoilState(WINDOW); // , setWindowSize
    const [menu, setMenu] = useRecoilState(MENU.MENU);
    const [menu_is_opend, setMenuIsOpend] = useRecoilState(MENU.MENU_IS_OPEND);
    const [menu_selected_item, setMenuSelectedItem] = useRecoilState(MENU.MENU_SELECTED_ITEM);
    const [operators, setOperators] = useRecoilState(OPERATORS);

    const nav = useNavigate();

    const actions = {
        menu: {
            change: (new_menu)=> setMenu(new_menu),
            item: {
                click: (item)=> {
                    nav(item.url);

                    setMenuSelectedItem(item.code);
                },
            },
            open: ()=> setMenuIsOpend(true),
            close: ()=> setMenuIsOpend(false),
        },
        operator: {
            change: (new_operators)=> setOperators(new_operators),
        },
    };

    return (
        <Box sx={sx}>
          <MenuBook menu={menu}
                    is_opend={menu_is_opend}
                    selected_item={menu_selected_item}
                    actions={actions}/>

          <Manipulater operators={operators}
                       window_size={window_size}
                       actions={actions}
                       leafs={root=> <OperatorsLeafs root={root}/>}/>

          {children}
        </Box>
    );
}
