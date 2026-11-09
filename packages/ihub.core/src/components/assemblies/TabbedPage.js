import React from 'react';

import { useConfig } from '../../config.js';
import { usePageTabs } from '../../hooks/usePageTabs.js';

import Frame from './frames/FrameTabs.js';

// タブのあるページ。
// pageId のタブ (usePageTabs) を出し、選んだタブの code のパネルを描く。
//
//   pageId … ページの id (PAGE_DATA など)。タブは usePageTabs(pageId) で決まる
//   panels … 既定の、タブの code → パネルの部品の表。設定の panels[pageId] を重ねる (同じ code は上書き)
//
// パネルの部品は ({ tab })=> 部品。tab は、選んだタブ ({ code, label })。
// 表に無い code のタブを選んだときは、何も出さない。
// 部品は、描画のたびに作り直さない。(モジュールの中で 1 つだけ作る)
export default function TabbedPage ({ pageId, panels }) {
    const { panels: panels_config } = useConfig();
    const [tabs, changeTabs] = usePageTabs(pageId);

    const tab = tabs.list.find(t=> t.code===tabs.selected);
    const Panel = { ...panels, ...panels_config[pageId] }[tabs.selected];

    return (
        <Frame tabs={tabs}
               onChangeTabs={changeTabs}>
          {Panel && <Panel tab={tab}/>}
        </Frame>
    );
}
