import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import {Leaf} from '@yanqirenshi/manipulater';

import ACCOUNT_MENU_ITEMS, { ACCOUNT_MENU_PAGES } from '../data/ACCOUNT_MENUS.js';
import { requestReopen } from '../ihub/redux/slices/operatorsSlice.js';

// 吹き出しの大きさ
const LEAF_W = 444;
const LEAF_H = 666;
// ボタンと吹き出しの間隔
const BRANCH_H = 33;
// 画面の端からの余白
const MARGIN = 8;

// src/setupProxy.js (開発サーバー) が ACCOUNT_MENUS.js を書き換える。
const API_ACCOUNT_MENU_ACTIVE = '/__ihub/account-menu-pages/active';

function leafPosition (root) {
    const w_center = root.position.x + (root.size.w / 2);

    const x = Math.min(Math.max(MARGIN, w_center - (LEAF_W / 2)),
                       Math.max(MARGIN, window.innerWidth - LEAF_W - MARGIN * 3));
    const y = Math.max(MARGIN, root.position.y - BRANCH_H - LEAF_H);

    return { x, y };
}

// 選んでいるタブ (ページの label) を sessionStorage に記録するキー。
// 保存すると画面が再読み込みされるので、再読み込みの後も同じタブを開くために使う。
const TAB_KEY = 'ihub.account-menu-settings.tab';

function loadTab () {
    try {
        return window.sessionStorage.getItem(TAB_KEY) || ACCOUNT_MENU_PAGES[0].label;
    } catch (e) {
        return ACCOUNT_MENU_PAGES[0].label;
    }
}

function saveTab (label) {
    try {
        window.sessionStorage.setItem(TAB_KEY, label);
    } catch (e) {
        // sessionStorage が使えない場合は、記録しないだけにする。
    }
}

function itemKey (page, code) {
    return `${page}/${code}`;
}

function initialActives () {
    return ACCOUNT_MENU_PAGES.reduce((ht, page)=> {
        page.items.forEach(item=> ht[itemKey(page.label, item.code)] = item.active===true);
        return ht;
    }, {});
}

async function saveActive (page, code, active) {
    const response = await fetch(API_ACCOUNT_MENU_ACTIVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, code, active }),
    });

    if (response.status===404 || response.status===405)
        throw new Error('保存できません。(on/off の保存は、開発サーバー (npm start) でのみ使えます)');

    const json = await response.json().catch(()=> null);

    if (!response.ok)
        throw new Error(json?.message || `HTTP ${response.status}`);

    return json;
}

// サイドメニューの項目の active (表示/非表示) を切り替える。
// 切り替えた結果は ACCOUNT_MENUS.js に保存され、ファイルが変わると画面が再読み込みされる。
export default function AccountMenuSettings (props) {
    const root = props.root;

    const [actives, setActives] = useState(initialActives);
    const [saving, setSaving] = useState(null);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState(loadTab);

    const page = ACCOUNT_MENU_PAGES.find(p=> p.label===tab) || ACCOUNT_MENU_PAGES[0];

    const selectTab = (label)=> {
        setTab(label);
        saveTab(label);
    };

    const toggle = async (page, code)=> {
        const key = itemKey(page, code);
        const active = !actives[key];

        setSaving(key);
        setError(null);
        setActives({ ...actives, [key]: active });

        // 保存すると画面が再読み込みされるので、再読み込みの後もこの吹き出しを開いておく。
        requestReopen(root.code);

        try {
            await saveActive(page, code, active);
        } catch (e) {
            requestReopen(null);
            setActives(prev=> ({ ...prev, [key]: !active }));
            setError(e.message);
        } finally {
            setSaving(null);
        }
    };

    const { x, y } = leafPosition(root);

    return (
        <Leaf x={x} y={y} w={LEAF_W} h={LEAF_H}>
          <Box sx={{ height: '100%', boxSizing: 'border-box', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6">サイドメニューの項目</Typography>

            <Tabs value={page.label}
                  onChange={(e, v)=> selectTab(v)}
                  variant="scrollable"
                  sx={{ borderBottom: '1px solid #ddd', minHeight: 40 }}>
              {ACCOUNT_MENU_PAGES.map(p=> (
                  <Tab key={p.label} label={p.label} value={p.label} sx={{ minHeight: 40, textTransform: 'none' }}/>
              ))}
            </Tabs>

            {error && <Typography color="error" sx={{ whiteSpace: 'pre-wrap' }}>{error}</Typography>}

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {page.items.map(item=> {
                  const menu = ACCOUNT_MENU_ITEMS[item.code];
                  const key = itemKey(page.label, item.code);

                  return (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch size="small"
                                checked={!!actives[key]}
                                disabled={saving!==null}
                                onChange={()=> toggle(page.label, item.code)}
                                slotProps={{ input: { 'aria-label': `${page.label} ${item.code}` } }}/>

                        {menu && <img src={menu.icon} alt="" width={22} height={22}/>}

                        <Typography sx={{ flex: 1 }}>
                          {menu ? menu.label : item.code}
                        </Typography>

                        <Typography sx={{ color: '#888', fontSize: 12 }}>
                          {item.code}
                        </Typography>
                      </Box>
                  );
              })}
            </Box>
          </Box>
        </Leaf>
    );
}
