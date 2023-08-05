import Link from 'next/link';

import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';

export default function Tabs (props) {
    const menu = props.menu;

    const tabs = menu.pages.map(d=>d.label);

    return (
        <Box>
          <MuiTabs value={0}
                   onChange={()=>null}>
            {tabs.map(tab=> {
                return (
                    <MuiTab key={tab}
                            label={tab}
                            sx={{minWidth: '55px'}}
                            centered/>
                );
            })}
          </MuiTabs>
        </Box>
    );
}
