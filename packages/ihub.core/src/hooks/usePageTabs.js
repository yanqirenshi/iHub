import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { useConfig } from '../config.js';

// Every entry here is normalized to the flat {selected, list} shape.
// `selected` here is only the DEFAULT tab; the current selection lives in
// the URL query parameter `?tab=` (same convention as TabsSearchParam.js).
const TAB_DEFS = {
    PAGE_API: {
        selected: 'wbs',
        list: [
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_BATCHS: {
        selected: 'wbs',
        list: [
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_BPMN: {
        selected: 'palettes',
        list: [
            { code: 'palettes', label: 'Palettes' },
            { code: 'styles',   label: 'Styles' },
            { code: 'methods',  label: 'Methods' },
            { code: 'overview', label: 'Overview' },
        ],
    },
    PAGE_BRIDGE: {
        selected: 'cockpit',
        list: [
            { code: 'cockpit',  label: 'Cockpit' },
            { code: 'overview', label: 'Overview' },
        ],
    },
    PAGE_BUSINESS: {
        selected: 'tm',
        list: [
            { code: 'systemic-design', label: 'Systemic Design' },
            { code: 'tm',              label: 'TM' },
            { code: 'procedures',      label: '機能一覧' },
            { code: 'wbs',             label: 'WBS' },
            { code: 'help',            label: 'Help' },
        ],
    },
    PAGE_CLASSES: {
        selected: 'class-diagram',
        list: [
            { code: 'class-diagram', label: 'クラス図' },
            { code: 'wbs',           label: 'WBS' },
            { code: 'help',          label: 'Help' },
        ],
    },
    PAGE_DATA: {
        selected: 'er-diagram',
        list: [
            { code: 'er-diagram', label: 'ER図' },
            { code: 'wbs',        label: 'WBS' },
            { code: 'help',       label: 'Help' },
        ],
    },
    PAGE_DDD: {
        selected: 'layer-architecture',
        list: [
            { code: 'ubiquitous-language', label: 'ユビキタス言語' },
            { code: 'model-driven-design', label: 'モデル駆動設計' },
            { code: 'hands-on-modeler',    label: '実践的モデラー' },
            { code: 'declarative-design',  label: '宣言的な設計' },
            { code: 'layer-architecture',  label: 'レイヤーアーキテクチャ' },
            { code: 'overview',            label: 'Overview' },
        ],
    },
    PAGE_DESIGN: {
        selected: 'ui-parts',
        list: [
            { code: 'ui-panels',     label: 'パネル' },
            { code: 'ui-assemblies', label: '中間組立品' },
            { code: 'ui-parts',      label: '部品' },
            { code: 'ui-events',     label: 'UI イベント' },
            { code: 'wbs',           label: 'WBS' },
            { code: 'help',          label: 'Help' },
        ],
    },
    PAGE_DEVOPS: {
        selected: 'bpmn',
        list: [
            { code: 'bpmn', label: 'BPMN' },
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_MARKETS: {
        selected: 'user-scenario',
        list: [
            { code: 'user-scenario',        label: 'ユーザーシナリオ' },
            { code: 'customer-journey-map', label: 'カスタマージャーニーマップ' },
            { code: 'use-case',             label: 'ユースケース' },
            { code: 'wbs',                  label: 'WBS' },
            { code: 'help',                 label: 'Help' },
        ],
    },
    PAGE_MESSAGES: {
        selected: 'wbs',
        list: [
            { code: 'model', label: 'Model' },
            { code: 'wbs',   label: 'WBS' },
            { code: 'help',  label: 'Help' },
        ],
    },
    PAGE_ORGANIZATIONS: {
        selected: 'wbs',
        list: [
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_SCREENS: {
        selected: 'screen-transition-diagram',
        list: [
            { code: 'screen-transition-diagram', label: '画面遷移図' },
            { code: 'screens',                   label: '画面' },
            { code: 'wbs',                        label: 'WBS' },
            { code: 'help',                       label: 'Help' },
        ],
    },
    PAGE_SYSTEMS: {
        selected: 'system-configuration-diagram',
        list: [
            { code: 'system-configuration-diagram', label: 'システム構成図' },
            { code: 'wbs',                            label: 'WBS' },
            { code: 'help',                           label: 'Help' },
        ],
    },
    PAGE_ACCOUNT: {
        selected: 'menus',
        list: [
            { code: 'menus',     label: 'Menus' },
            { code: 'operators', label: 'Operators' },
            { code: 'pages',     label: 'Pages' },
        ],
    },
    PAGE_EXTERNAL_RESOURCES: {
        selected: 'wbs',
        list: [
            { code: 'wbs', label: 'Wbs' },
        ],
    },
    PAGE_SCRUM: {
        selected: 'projects',
        list: [
            { code: 'timeline',      label: 'Timeline' },
            { code: 'gantt-chart',   label: 'Gantt Chart' },
            { code: 'issues',        label: 'Issues' },
            { code: 'pull-requests', label: 'Pull Requests' },
            { code: 'repositories',  label: 'Repositories' },
            { code: 'projects',      label: 'Projects' },
            { code: 'account',       label: 'Account' },
            { code: 'help',          label: 'Help' },
        ],
    },
};

// 既定のタブ (def) に、アプリのタブ (override。設定の tabs[pageId]) を重ねる。
//   selected … 上書きする
//   list     … code が同じものは差し替え、無いものは末尾に足す。{ code, hidden: true } は、そのタブを消す
export function mergeTabs (def, override) {
    const base = def || { selected: null, list: [] };

    if (!override)
        return base;

    let list = [...base.list];

    for (const tab of override.list || []) {
        const index = list.findIndex(t=> t.code===tab.code);

        if (tab.hidden) {
            if (index >= 0)
                list.splice(index, 1);
        } else if (index >= 0) {
            list[index] = tab;
        } else {
            list.push(tab);
        }
    }

    const selected = override.selected ?? base.selected;

    return {
        ...base,
        // 既定のタブを消したときは、先頭のタブにする。
        selected: list.some(t=> t.code===selected) ? selected : (list[0]?.code ?? null),
        list,
    };
}

// pageId のページのタブ。(既定は TAB_DEFS。設定の tabs[pageId] で、足す・差し替える・消す)
export function usePageTabs (pageId) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { tabs: tabs_config } = useConfig();

    const def = React.useMemo(()=> mergeTabs(TAB_DEFS[pageId], tabs_config[pageId]),
                              [pageId, tabs_config]);

    const param = searchParams.get('tab');
    const selected = def.list.some(t=> t.code===param) ? param : def.selected;

    const tabs = { ...def, selected };

    const changeTabs = (newTabs)=> {
        searchParams.set('tab', newTabs.selected);
        setSearchParams(searchParams);
    };

    return [tabs, changeTabs];
}
