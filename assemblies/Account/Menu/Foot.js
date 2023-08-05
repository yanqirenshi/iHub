import Box from '@mui/material/Box';

export default function Foot (props) {
    const menu = props.menu || [];

    return (
        <Box sx={{
            borderTop: '1px solid #bbb',
            padding: '11px 22px',
        }}>
          <p>Sign Out</p>
        </Box>
    );
}
