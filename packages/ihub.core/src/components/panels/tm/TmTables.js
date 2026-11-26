import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useCollections } from '../../../redux/api/dataApi.js';
import { entityRows, masterRows, relationshipRows } from '../../../manegers/tmTables.js';

// ビジネスのページの、TM のデータを表で見るタブ。(0.12.0 から)
//   Entities (entities)・Identifiers (identifiers)・Attributes (attributes)・Relationships (relationships)
//
// 見るだけ。(書き換えは、TM タブのインスペクタか、data/tm/ のファイルで行う)
// 並びは、ファイルの順。(並べ替え・絞り込みは付けない)
// データは、API サーバーから読んだもの (useCollections)。TM タブのインスペクタで書き換えると、表も新しい値になる。
// 行の作り方 (名前の解決・論理名と物理名の分け方) は、manegers/tmTables.js。
// 列の見出しは、TM のインスペクタ (@yanqirenshi/model.tm の fieldsOf のラベル) に合わせる。

// 表。4 つのタブで同じものを使う。
//   columns      … [{ key, label, nowrap? }]。行の値が配列のときは、1 つずつ行を分けて出す。nowrap の列は折り返さない
//   rows         … 行の配列 (manegers/tmTables.js が作る)
//   emptyMessage … 行が無いときに、表の代わりに出す知らせ
// 表がコンテンツエリアより長い・広いときは、表の中でスクロールする。見出しの行は、上に残る。
function TmTable ({ label, columns, rows, emptyMessage }) {
    return (
        // 左は、サイドメニューの、選んでいる項目の札 (「システム構成」のような長い名前でも、約 165px まで伸びる) にかからないようにする。
        // 下は、最後の行がドックに隠れないようにする。
        <Box sx={{ height: '100%', pt: 3, pb: 12, pl: '180px', pr: 3, boxSizing: 'border-box' }}>
          {rows.length===0
           ? <Alert severity="info">{emptyMessage}</Alert>
           : (
               <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '100%' }}>
                 <Table stickyHeader size="small" aria-label={label}>
                   <TableHead>
                     <TableRow>
                       {columns.map(c=> (
                           <TableCell key={c.key} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                             {c.label}
                           </TableCell>
                       ))}
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {rows.map((row, i)=> (
                         // id は重なることがある (ihub-srv check が知らせる誤り) ので、行の順も鍵に入れる
                         <TableRow key={`${i}:${row.id}`} hover>
                           {columns.map(c=> (
                               <TableCell key={c.key} sx={{ verticalAlign: 'top', whiteSpace: c.nowrap ? 'nowrap' : 'pre-wrap' }}>
                                 {Array.isArray(row[c.key])
                                  ? row[c.key].map((v, j)=> <div key={j}>{v}</div>)
                                  : row[c.key]}
                               </TableCell>
                           ))}
                         </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </TableContainer>
           )}
        </Box>
    );
}

const ENTITY_COLUMNS = [
    { key: 'id',          label: 'ID',     nowrap: true },
    { key: 'type',        label: '種別',   nowrap: true },
    { key: 'name',        label: '名称' },
    { key: 'identifiers', label: '識別子' },
    { key: 'attributes',  label: '属性' },
    { key: 'description', label: '説明' },
];

// Identifiers・Attributes。名前は、論理名と物理名の列に分ける。(文字列の名前は、論理名の列。#230)
const MASTER_COLUMNS = [
    { key: 'id',          label: 'ID', nowrap: true },
    { key: 'logical',     label: '論理名' },
    { key: 'physical',    label: '物理名' },
    { key: 'description', label: '説明' },
];

const RELATIONSHIP_COLUMNS = [
    { key: 'id',          label: 'ID',         nowrap: true },
    { key: 'type',        label: '種類',       nowrap: true },
    { key: 'from',        label: '接続元のエンティティ' },
    { key: 'to',          label: '接続先のエンティティ' },
    { key: 'label',       label: 'ラベル' },
    { key: 'subset',      label: 'サブセット (区分・区分コード)' },
    { key: 'description', label: '説明' },
];

const empty = (what, file)=> (
    <>{what}がありません。<code>data/tm/{file}.json</code> に書くと、ここに出ます。(TM タブの図にも出ます)</>
);

// Entities のタブ
export function TmEntities () {
    const collections = useCollections();
    const rows = React.useMemo(()=> entityRows(collections), [collections]);

    return <TmTable label="エンティティ" columns={ENTITY_COLUMNS} rows={rows} emptyMessage={empty('エンティティ', 'entities')}/>;
}

// Identifiers のタブ
export function TmIdentifiers () {
    const collections = useCollections();
    const rows = React.useMemo(()=> masterRows(collections, 'identifiers'), [collections]);

    return <TmTable label="識別子" columns={MASTER_COLUMNS} rows={rows} emptyMessage={empty('識別子', 'identifiers')}/>;
}

// Attributes のタブ
export function TmAttributes () {
    const collections = useCollections();
    const rows = React.useMemo(()=> masterRows(collections, 'attributes'), [collections]);

    return <TmTable label="属性" columns={MASTER_COLUMNS} rows={rows} emptyMessage={empty('属性', 'attributes')}/>;
}

// Relationships のタブ
export function TmRelationships () {
    const collections = useCollections();
    const rows = React.useMemo(()=> relationshipRows(collections), [collections]);

    return <TmTable label="リレーションシップ" columns={RELATIONSHIP_COLUMNS} rows={rows} emptyMessage={empty('リレーションシップ', 'relationships')}/>;
}
