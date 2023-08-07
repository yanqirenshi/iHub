'use client';

import * as recoil from 'recoil';

import DATA_ACCOUNT_MENU from '@/data/ACCOUNT_MENU.js';
import DATA_OPERATORS from '@/data/OPERATORS.js';

import sogh from '@/manegers/Sogh.js';

function atom (key, val) {
    return recoil.atom({ key: key, default: val });
}

export const ACCOUNT_MENU = atom("ACCOUNT_MENU", DATA_ACCOUNT_MENU);
export const OPERATORS = atom("OPERATORS", DATA_OPERATORS);

export const WINDOW = atom("WINDOW", null); // {w: num, h: num}

export const PAGE_SCRUM = atom("PAGE_SCRUM", {
    tabs: {
        selected: 'projects',
        list: [
            { code: 'projects', label: 'Projects' },
            { code: 'account',  label: 'Account' },
            { code: 'help',     label: 'Help' },
        ],
    },
});

export const PAGE_BPMN = atom("PAGE_BPMN", {
    tabs: {
        selected: 'palettes',
        list: [
            { code: 'palettes', label: 'Palettes' },
            { code: 'styles',   label: 'Styles' },
            { code: 'overview', label: 'Overview' },
        ],
    },
});

export const PAGE_DDD = atom("PAGE_DDD", {
    tabs: {
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
});
