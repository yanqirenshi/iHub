"use client";
import * as React from 'react';
// import { useRecoilState } from "recoil";
import Measure from 'react-measure';
import Box from '@mui/material/Box';
import Frame from '@/frames/Frame.js';
import Tabs from '@/parts/Tabs.js';

// import * as atoms from '@/recoil/ATOMS.js';

export default function Scrum () {
    // const [page_scrum, setPageScrum] = useRecoilState(atoms.PAGE_SCRUM);
    const [bounds, setBounds] = React.useState({height:0});
    const [tabs, setTabs] = React.useState({
        selected: '1',
        list: [
            { code: '1', label: 'a' },
            { code: '2', label: 'b' },
        ],
    });

    return (
        <Frame>
          <Measure
            bounds
            onResize={rect => setBounds(rect.bounds)}>
            {({ measureRef }) => (
                <Box ref={measureRef}>
                  <Tabs data={tabs} onChange={(new_tabs)=>setTabs(new_tabs)}/>
                </Box>
            )}
          </Measure>

          <Box sx={{height: `calc(100% - ${bounds.height}px)`}}>
          </Box>
        </Frame>
    );
}
