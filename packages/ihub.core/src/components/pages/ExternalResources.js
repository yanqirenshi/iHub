import React from 'react';

import { usePageTabs } from '../../hooks/usePageTabs.js';

import Frame from '../assemblies/frames/FrameTabs.js';

import Wbs from '../panels/Wbs.js';

export default function ExternalResources () {
    const [tabs, changeTabs] = usePageTabs('PAGE_EXTERNAL_RESOURCES');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>
          {'wbs' === tab && <Wbs start_id={1}/>}
        </Frame>
    );
}
