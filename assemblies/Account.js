import * as React from 'react';
import Avatar from './Account/Avater.js';
import Menu from './Account/Menu.js';

export default function Account (props) {
    const menu = props.menu || [];
    const actions = props.actions;

    return (
        <>
          <Avatar/>
          <Menu menu={menu} actions={actions}/>
        </>
    );
}
