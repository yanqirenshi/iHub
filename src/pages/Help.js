import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

import Frame from '../assemblies/frames/Frame.js';

export default function Help () {
    return (
        <Frame>
          <Container maxWidth="lg">
            <Box>
              <S variant="h5">???</S>
              <pre>{graph1.join('\n')}</pre>
            </Box>

            <Box sx={{mt:6}}>
              <S variant="h5">???</S>
              <pre>{text1.join('\n')}</pre>
            </Box>

            <Box sx={{mt:6}}>
              <S variant="h5">???</S>
              <pre>{graph2.join('\n')}</pre>
            </Box>
          </Container>
        </Frame>
    );
}

const graph1 = [
    '   document ≒ wbs',
    '',
    '    - 100% roule',
    '    - MECE',
    '',
    '   document',
    '      |',
    '   +---------+---------+',
    '   |         |         |',
    ' request  requirement  |',
    '                       |',
    '                   +---+---+-----+',
    '                   |       |     |',
    '                 model    spec   |',
    '                                 |',
    '                             +---+---+--------+',
    '                             |       |        |',
    '                           code     test   release',
];

const text1 = [
    'メニューのパーソナライズ',
    'オペレータのパーソナライズ',
    '',
    'iHub は箱である。',
    '汎用的な箱である。',
];

const graph2 = [
    '    +--------+    +----------------+    +----------+',
    '    | iHub   |<---| Plug in        |<-->| External |',
    '    |        |    |                |    |          |',
    '    |        |    | +------------+ |    | API      |',
    '    |        |    | | components | |    |          |',
    '    |        |    | +------------+ |    |          |',
    '    |        |    | +------------+ |    |          |',
    '    |        |    | | procedures | |    |          |',
    '    |        |    | +------------+ |    |          |',
    '    +--------+    +----------------+    +----------+',
    '',
    '                    iHub の Frame を利用する必要がある。',
    '                    Plug IN のリンク先をコントロール出来るようにする必要がある。',
];
