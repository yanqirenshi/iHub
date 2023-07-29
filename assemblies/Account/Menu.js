'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';

export default function Menu (props) {
    const menu = props.menu || [];

    return (
        <Box sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#fff',
            height: '100vh',
            zIndex: 8888887,
            display: 'flex',
            flexDirection: 'column',
        }}>

          <Box sx={{
              height:50,
              borderBottom: '1px solid #bbb',
              padding: '11px 22px'}}>
          </Box>

          <Box sx={{
              mt: 3,
              padding: '11px 22px',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
          }}>
            {menu.map(item=> {
                return (
                    <Box key={item.url} sx={{mt:2}}>
                      <Link href={item.url}>
                        {item.label}
                      </Link>
                    </Box>
                );
            })}
          </Box>

          <Box sx={{
              borderTop: '1px solid #bbb',
              padding: '11px 22px',
          }}>
            <p>Sign Out</p>
          </Box>
        </Box>
    );
}
