import Box from '@mui/material/Box';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { operatorsChanged } from '../../../redux/slices/operatorsSlice.js';
import { menuChanged, menuOpened, menuClosed, menuItemSelected } from '../../../redux/slices/accountMenuSlice.js';

import MenuBook from '@yanqirenshi/menubook';
import Manipulater from '@yanqirenshi/manipulater';

import OperatorsLeafs from '../../../../operators/Operators.js';

const sx = {
    maxWidth: '100vw',
    height: '100vh',
};

export default function Frame (props) {
    const children = props.children;

    const dispatch = useDispatch();
    const window_size = useSelector(s=> s.window.value);
    const operators = useSelector(s=> s.operators);
    const menu = useSelector(s=> s.accountMenu.menu);
    const menu_is_opend = useSelector(s=> s.accountMenu.isOpend);
    const menu_selected_item = useSelector(s=> s.accountMenu.selectedItem);

    const nav = useNavigate();

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
            change: (new_operators)=> dispatch(operatorsChanged(new_operators)),
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
