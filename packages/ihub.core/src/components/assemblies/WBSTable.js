"use client";

import WbsTable, { Supporter } from '@yanqirenshi/table.wbs';

import Link from '../assemblies/Link.js';
import { useWbs } from '../../manegers/wbs.js';

// WBS の表 (@yanqirenshi/table.wbs) に、iHub の WBS のデータ (manegers/wbs.js) を渡す。
// 表の見た目は bulma (IHub.js で読み込む) に任せる。
//
//   start_id: この id のノードから下だけを出す。(無ければプロジェクト全体)
//   columns:  列の定義。(無ければ Code・Name・Description)

// 列のセルの定型。Code は /wbs/{id} へのリンクにする。
const supporter = new Supporter({
    defaultPath: 'wbs',
    link: (to, label)=> <Link href={to}>{label}</Link>,
});

export default function WBSTable (props) {
    const start_id = props.start_id || null;
    const columns = props.columns || defaultColumns();

    const wbs = useWbs();

    if (!wbs)
        return null;

    const wbs_source = {
        projects:     wbs.data().projects.list,
        wbs:          wbs.data().wbs.list,
        workpackages: wbs.data().wp.list,
        edges:        wbs.data().edges.list,
    };

    const options = {}; // or null
    const style_table = { fontSize: '16px' }; // or null

    // 表はデータが変わっても作り直さないので、WBS が変わったら表ごと作り直す。
    return (
        <WbsTable key={wbs.version}
                  source={wbs_source}
                  columns={columns}
                  options={options}
                  style={style_table}
                  start_id={start_id}/>
    );
}

function defaultColumns () {
    return [
        {
            label: 'Code',
            required: true,
            value: (d)=> d._id,
            contents: supporter.cellID,
        },
        {
            label: 'Name',
            leveling: true,
            required: true,
            value: (d)=> d.label,
            contents: supporter.cellLabel,
        },
        {
            label: 'Description',
            value: (d)=> d.description,
            contents: supporter.cellDescription,
        },
    ];
}
