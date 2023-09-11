import Box from '@mui/material/Box';

import Link from '../../../assemblies/Link.js';

export default function Item (props) {
    const item = props.data;

    return (
        <Box key={item.url} sx={{mt:1, mb: 1}}>
          <Link href={item.url}>
            {item.label}
          </Link>
        </Box>
    );
}
