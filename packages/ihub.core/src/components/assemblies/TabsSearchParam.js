import React from 'react';
import { useSearchParams } from "react-router-dom";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// URL の ?tab= を使うタブ。選んでいるタブは、親が value で持ち、変わったら onChange で知らせる。
//   tabs:     [{ code, label }]
//   value:    選んでいるタブの code
//   onChange: (code)=> ...
// value が空のときの初めのタブは、URL の ?tab= (tabs にあるもの)。無ければ先頭のタブ。(usePageTabs と同じ)
// 初めのタブは、描画のあとに (useEffect で) onChange に知らせる。(描画の途中で、親の setState を呼ばない)
export default function TabsSearchParam (props) {
    const tabs = props.tabs || [];
    const tab = props.value;
    const onChange = props.onChange;

    const [searchParams, setSearchParams] = useSearchParams();

    const param = searchParams.get('tab');
    const initial = tabs.some(t=> t.code===param) ? param : (tabs[0]?.code ?? null);

    React.useEffect(()=> {
        if (!tab && initial && onChange)
            onChange(initial);
    }, [tab, initial, onChange]);

    if (tabs.length===0) return null;

    const changeTab = (e, new_code) => {
        searchParams.set('tab', new_code);
        setSearchParams(searchParams);

        if (onChange)
            onChange(new_code);
    };

    return (
        <Tabs value={tab || initial} onChange={changeTab}>
          {tabs.map((tab) => (
            <Tab key={tab.code}
                 label={tab.label}
                 value={tab.code} />
          ))}
        </Tabs>
    );
}
