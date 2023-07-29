'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import AvatarIcon from '@mui/material/Avatar';

export default function Avater (props) {
    return (
        <Box sx={{
            position: 'fixed',
            left: 16,
            top: 16,
            padding: 0.5,
            background: '#fff',
            borderRadius: 55,
            zIndex: 8888888,
            border: '1px solid #bbb',
        }}>
          <AvatarIcon sx={{ width: 55, height: 55 }}
                      alt="Yanqirenshi"
                      src="https://avatars.githubusercontent.com/u/346975?s=400&u=9689e695c587cadccb01c45a8d5df58d4d61cf1e&v=4" />
        </Box>

    );
}
