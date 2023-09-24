import React from 'react';

import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LinkGithub (props) {
    const [hovered, setHovered] = React.useState(false);

    const href = props.href;

    return (
        <Link href={href}>
          <GitHubIcon style={hovered ? null : {color: '#eee'}}
                      onMouseEnter={()=>setHovered(true)}
                      onMouseLeave={()=>setHovered(false)}/>
        </Link>
    );
}
