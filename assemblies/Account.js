'use client';
import * as React from 'react';
import Avatar from './Account/Avater.js';
import Menu from './Account/Menu.js';

export default function Account (props) {
    const menu = props.menu || [];

    return (
        <>
          <Avatar/>
          <Menu menu={menu}/>
        </>
    );
}
