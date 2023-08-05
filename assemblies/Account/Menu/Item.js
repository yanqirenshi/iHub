import Link from 'next/link';
import Box from '@mui/material/Box';

export default function Item (props) {
    const item = props.data;

    return (
        <Box key={item.url} sx={{mt:2}}>
          <Link href={item.url}>
            {item.label}
          </Link>
        </Box>
    );
}
