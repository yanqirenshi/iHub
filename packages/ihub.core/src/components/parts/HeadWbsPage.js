import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {H, S} from 'tion';

const ALIGNS = ['left', 'center', 'right'];

// 見出しの寄せ (value) を、ALIGNS のどれかにする。ALIGNS に無いとき (省略したときも) は、fallback を返す。
// FrameWbsNode・FrameWbsNodeTabs も、headAlign を決めるのに使う。
export function headAlignOf (value, fallback) {
    return ALIGNS.includes(value) ? value : fallback;
}

// props:
//   value … WBS のノード。(_class・name・description を出す)
//   align … 見出しの寄せ。'left'・'center'・'right' のどれか。(省略したときと、ほかの値のときは 'left')
export default function HeadWbsPage (props) {
    const wbs_node = props.value;
    const align = headAlignOf(props.align, 'left');

    return (
        <Box>
          <Container maxWidth="lg" sx={{pt:5, textAlign: align}}>
            <S>{wbs_node._class}</S>
            <H>{wbs_node.name}</H>
            <S>{wbs_node.description}</S>
          </Container>
        </Box>
    );
}
