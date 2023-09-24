import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import BodyHtml from '../common/BodyHtml.js';
import IssueTitle from '../common/IssueTitle.js';

import Attributes from './inspector/Attributes.js';
import Points from './inspector/Points.js';
import Dependencies from './inspector/Dependencies.js';

const style ={
    height: '100%',
    background: '#fff',
    borderLeft: '1px solid #cccccc',
    tabs: {
        borderBottom: 1,
        borderColor: 'divider',
    },
};

export default function Inspector (props) {
    const [menu, setMenu] = React.useState({
        selected: '1',
        list: [
            { code: '1', label: 'Description', description: 'First comment' },
            { code: '2', label: 'Attrs', description: 'Attributes' },
            { code: '3', label: 'Points', description: 'Points of Plan and Result' },
            { code: '4', label: 'Depends', description: 'Dependencies' },
        ],
    });

    const issue = props.data;
    const item = props.item;

    const handleChange = (event, new_value) => {
        const new_menu = {...menu} ;
        new_menu.selected = new_value;
        setMenu(new_menu);
    };

    return (
        <Box sx={style}>
          <div style={{paddingLeft: 22,paddingRight: 22, paddingTop:11}}>
            <IssueTitle data={issue}/>
          </div>

          <TabContext value={menu.selected}>

            <Box sx={style.tabs}>
              <TabList onChange={handleChange}
                       aria-label="lab API tabs example" centered>
                {menu.list.map(d=> {
                    return (
                        <Tab key={d.code}
                             label={d.label}
                             value={d.code}
                             title={d.description}/>
                    );
                })}
              </TabList>
            </Box>

            <TabPanel value="1">
              <BodyHtml data={issue.bodyHTML()}/>
            </TabPanel>

            <TabPanel value="2">
              <Attributes issue={issue} item={item}/>
            </TabPanel>

            <TabPanel value="3">
              <Points issue={issue} item={item}/>
            </TabPanel>

            <TabPanel value="4">
              <Dependencies issue={issue} item={item}/>
            </TabPanel>

          </TabContext>
        </Box>
    );
}
