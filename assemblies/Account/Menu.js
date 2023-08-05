import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';

import Head from './Menu/Head.js';
import Foot from './Menu/Foot.js';
import Item from './Menu/Item.js';
import Tabs from './Menu/Tabs.js';

export default function Menu (props) {
    const menu = props.menu || [];

    const sx = {
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#fff',
        height: '100vh',
        zIndex: 8888887,
        display: 'flex',
        flexDirection: 'column',
        body: {
            padding: '11px 22px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
        }
    };

    const tabs = menu.pages.map(d=>d.label);

    return (
        <Box sx={sx}>

          <Head/>

          <Tabs menu={menu}/>

          <Box sx={sx.body}>
            {menu.pages[0].items.map(item=> {
                return <Item data={item}/>;
            })}
          </Box>

          <Foot/>
        </Box>
    );
}
