import * as React from 'react';
import Box from '@mui/material/Box';
import AvatarIcon from '@mui/material/Avatar';

export default function Avater (props) {
    const menu = props.menu;
    const actions = props.actions;

    const click = ()=> {
        const new_menu = {...menu};

        new_menu.open = !new_menu.open;

        actions.menu.change(new_menu);
    };

    return (
        <Box sx={sx()}>
          <AvatarIcon sx={{ width: 55, height: 55 }}
                      alt="Yanqirenshi"
                      src="https://avatars.githubusercontent.com/u/346975?s=400&u=9689e695c587cadccb01c45a8d5df58d4d61cf1e&v=4"
                      onClick={click}/>
        </Box>

    );
}

function sx () {
    return {
        position: 'fixed',
        top: 18,
        left: 22,
        padding: 0.5,
        background: '#fff',
        borderRadius: 55,
        zIndex: 8888888,
        border: '1px solid #bbb',
    };
}
