import * as React from 'react';
import Avatar from './Account/Avater.js';
import Menu from './Account/Menu.js';

export default function Account (props) {
    const menu = props.menu;
    const actions = props.actions;

    return (
        <>
          <Avatar menu={menu} actions={actions}/>
          {isOpenMenu(menu) &&
           <Menu menu={menu} actions={actions}/>}
        </>
    );
}

function isOpenMenu (menu) {
    return menu.avater.clicked
        || menu.avater.enterd
        || menu.menu.enterd;
}
