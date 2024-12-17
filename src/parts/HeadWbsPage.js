import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {H, S} from 'tion';

export default function HeadWbsPage (props) {
    const wbs_node = props.value;

    return (
        <Box>
          <Container maxWidth="lg" sx={{pt:5}}>
            <H>{wbs_node.name}</H>
            <S>{wbs_node.description}</S>
            <S>{wbs_node._class}</S>
          </Container>
        </Box>
    );
}
