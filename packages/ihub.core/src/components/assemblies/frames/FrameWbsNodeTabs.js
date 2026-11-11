import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';
import HeadWbsPage from '../../parts/HeadWbsPage.js';
import WBSTable from '../../assemblies/WBSTable.js';
import TabsSearchParam from '../../assemblies/TabsSearchParam.js';

import { useWbs } from '../../../manegers/wbs.js';

export default function FrameWbsNodeTabs (props) {
    const tabs = props.tabs;
    const tab  = props.tab;
    const onChangeTab = props.onChangeTab;

    const children = props.children;
    const maxWidth = props.maxWidth || "lg";

    const wbs = useWbs();

    if (!props.wbs_node) return null;

    // ノードのページ (pages.WbsNode) が渡す wbs_node は、データのレコードそのままで、_id と _class が無い。
    // WBS (manegers/wbs.js) から、id で引き直す。(_id を持つノードを渡されたときも、同じ id で引ける。引けないときは、渡されたものを使う)
    const wbs_node = wbs.get(props.wbs_node._id ?? props.wbs_node.id) || props.wbs_node;

    return (
        <Frame>
          <Box sx={{height:'100%', overflow:'auto'}}>
            <HeadWbsPage value={wbs_node}/>

            <Container maxWidth={maxWidth}>
              <TabsSearchParam tabs={tabs} value={tab} onChange={onChangeTab}/>
            </Container>

            {children}

            <Container maxWidth={maxWidth} sx={{pt:11, mb:33}}>
              <Box>
                <WBSTable start_id={wbs_node._id ?? wbs_node.id}/>
              </Box>
            </Container>
          </Box>
        </Frame>
    );
}
