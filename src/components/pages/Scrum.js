import React, {Suspense} from 'react';

import { usePageTabs } from '../../redux/slices/tabsSlice.js';

import Frame from '../assemblies/frames/FrameTabs.js';
import * as panel from '../panels/sogh/index.js';
import HelpEmpty from '../panels/HelpEmpty.js';
import Loading from '../panels/Loading.js';

export default function Scrum () {
    const [tabs, changeTabs] = usePageTabs('PAGE_SCRUM');

    const tab = tabs.selected;

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>

          <Suspense fallback={<Loading/>}>
            {'repositories'===tab && <panel.Repositories/>}
            {'projects'===tab && <panel.Projects/>}
            {'account'===tab && <panel.Account/>}
            {'help'===tab && <HelpEmpty/>}
          </Suspense>
        </Frame>
    );
}
