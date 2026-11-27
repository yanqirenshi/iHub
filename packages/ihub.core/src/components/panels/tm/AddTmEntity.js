import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import D3Ter, { Rectum } from '@yanqirenshi/d3.ter';
import { ENTITY_TYPES } from '@yanqirenshi/model.tm';

import { errorMessage, useAddRecordMutation, useCollections } from '../../../redux/api/dataApi.js';
import {
    ENTITY_FORM_FIELDS, ENTITY_FORM_TABS, buildEntityRecord, firstTabWithError, initialEntityForm, masterItems, pickerLists,
    isPreviewNameEmpty, previewEntityData, selectMaster, unselectMaster, validateEntityForm,
} from '../../../manegers/tmEntityForm.js';
import { TM_TABLE_COLLECTIONS } from '../../../manegers/tmTables.js';

import { TM_DIALOG_MENU_Z_INDEX, TM_DIALOG_Z_INDEX } from './tmDialog.js';

// ビジネスのページの Entities のタブの「Entity の追加」。(0.12.0 から。叩き台)
// ボタンを押すと、モーダル (MUI の Dialog) のフォームを出し、POST /api/tm/entities で、エンティティを 1 件足す。(id は API サーバーが振る)
//
// モーダルの形 (#232 のコメントの、ユーザーの図):
//   左: エンティティのイメージ。入力から作るレコードを、d3.ter で描く。(EntityImage。見るだけ)
//   右: タブ「基本」「Identifiers」「Attributes」と、その中身。
//       Identifiers・Attributes の中は、左「選択した一覧」(選んだ順)・右上「検索」・右下「全ての一覧」(選んだものは出さない)。(MastersPicker)
//   下: 「キャンセル」「作成」。
//
// タブと項目は、manegers/tmEntityForm.js の ENTITY_FORM_TABS・ENTITY_FORM_FIELDS が決める。(この部品は、項目の input の種類ごとに、入力の部品を出すだけ)
// 保存するレコードの形 (名前・行の id・位置) も、manegers/tmEntityForm.js の buildEntityRecord が作る。
//
// タブを切り替えても、入力と選択は消えない。「作成」を押したときに誤りがあれば、誤りのあるタブに切り替えて、誤りを出す。
// 「キャンセル」・モーダルの外のクリック・Esc で、何も保存せずに閉じる。開き直したときは、入力を初めの値に戻す。
// 保存できなかったとき (API サーバーの検査の誤りなど) は、閉じずに、誤りの文を出す。保存の間は、「作成」を押せない。
export default function AddTmEntity () {
    const [open, setOpen] = React.useState(false);

    return (
        <>
          {/* MUI のボタンは、既定で英字を大文字にする。ラベルのとおり「Entity の追加」と出す */}
          <Button variant="contained" size="small" onClick={()=> setOpen(true)} sx={{ textTransform: 'none' }}>
            Entity の追加
          </Button>

          {/* 閉じたら、フォームを外す。(開き直したときに、入力が初めの値に戻る) */}
          {open && <EntityDialog onClose={()=> setOpen(false)}/>}
        </>
    );
}

// 左右の枠の高さ。(右の枠は、中身が長いときは、枠の中でスクロールする)
// 画面が低くて、枠と題とボタンが収まらないときは、MUI の Dialog の既定 (scroll="paper") のとおり、
// 題と「キャンセル」「作成」は出したまま、その間 (枠) を、モーダルの中でスクロールする。
// 高さ 1080px の画面 (1920x1080) では、スクロールが出ないように、枠の下の余白を詰めている。(PANE_BOTTOM_SPACE。#240)
const PANE_HEIGHT = 888;

// 枠の下の余白。(MUI の DialogContent の既定は 20px。これだと、高さ 1080px の画面で、8px のスクロールが出る)
const PANE_BOTTOM_SPACE = 8;

function EntityDialog ({ onClose }) {
    const collections = useCollections();
    const [addRecord, { isLoading }] = useAddRecordMutation();

    const [values, setValues] = React.useState(initialEntityForm);
    const [errors, setErrors] = React.useState({});
    const [failure, setFailure] = React.useState(null);
    const [tab, setTab] = React.useState(ENTITY_FORM_TABS[0].code);

    // Identifiers・Attributes のタブの、検索の文字。(項目の鍵 → 文字。タブを切り替えても残す)
    const [queries, setQueries] = React.useState({});

    // 選んでいるタブの項目。(マスタを選ぶ項目だけのタブは、中身を枠の高さいっぱいに出す。左右の一覧が、それぞれの中でスクロールするように)
    const fields = ENTITY_FORM_FIELDS.filter(f=> f.tab===tab);
    const fill = fields.length===1 && fields[0].input==='masters';

    const change = (key, value)=> setValues(v=> ({ ...v, [key]: value }));

    const close = ()=> {
        if (!isLoading)
            onClose();
    };

    const submit = async (e)=> {
        e.preventDefault();

        const found = validateEntityForm(values);

        setErrors(found);
        setFailure(null);

        const errorTab = firstTabWithError(found);

        if (errorTab) {
            setTab(errorTab);
            return;
        }

        try {
            await addRecord({ name: TM_TABLE_COLLECTIONS.entities, record: buildEntityRecord(values, collections) }).unwrap();
            onClose();
        } catch (error) {
            setFailure(errorMessage(error, 'エンティティを追加できません。'));
        }
    };

    return (
        // サイドメニューも、モーダルの背景の下にする (TM_DIALOG_Z_INDEX) ので、モーダルは、画面の中央に置く。(#240)
        <Dialog open onClose={close} fullWidth maxWidth="lg" sx={{ zIndex: TM_DIALOG_Z_INDEX }}
                slotProps={{ paper: { component: 'form', onSubmit: submit, noValidate: true } }}>
          <DialogTitle>Entity の追加</DialogTitle>

          <DialogContent sx={{ pb: `${PANE_BOTTOM_SPACE}px` }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              {/* 左: エンティティのイメージ */}
              <Paper variant="outlined" sx={{ flex: '0 0 40%', height: PANE_HEIGHT, overflow: 'hidden' }}>
                <EntityImage values={values} collections={collections}/>
              </Paper>

              {/* 右: タブと、その中身 */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: PANE_HEIGHT }}>
                <Tabs value={tab} onChange={(_e, v)=> setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  {ENTITY_FORM_TABS.map(t=> (
                      <Tab key={t.code} value={t.code} label={t.label} sx={{ textTransform: 'none' }}/>
                  ))}
                </Tabs>

                <Box sx={{ flex: 1, minHeight: 0, overflow: fill ? 'hidden' : 'auto', pt: 2 }}>
                  <Stack spacing={2} sx={fill ? { height: '100%' } : undefined}>
                    {fields.map(field=> (
                        <Field key={field.key}
                               field={field}
                               value={values[field.key]}
                               error={errors[field.key]}
                               collections={collections}
                               query={queries[field.key] ?? ''}
                               onQuery={(q)=> setQueries(v=> ({ ...v, [field.key]: q }))}
                               onChange={(value)=> change(field.key, value)}/>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>

            {failure && <Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{failure}</Alert>}
          </DialogContent>

          <DialogActions>
            <Button onClick={close} disabled={isLoading}>キャンセル</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>作成</Button>
          </DialogActions>
        </Dialog>
    );
}

// 1 つの項目。field.input の種類ごとに、入力の部品を出す。
function Field ({ field, value, error, collections, query, onQuery, onChange }) {
    const common = {
        label: field.label,
        required: !!field.required,
        error: !!error,
        helperText: error || ' ',
        fullWidth: true,
        size: 'small',
    };

    if (field.input==='entityType')
        return (
            // 選択肢 (Menu) は、モーダルより手前に出す。(#240)
            <TextField select {...common} value={value} onChange={e=> onChange(e.target.value)}
                       slotProps={{ select: { MenuProps: { sx: { zIndex: TM_DIALOG_MENU_Z_INDEX } } } }}>
              {ENTITY_TYPES.map(t=> <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
        );

    if (field.input==='textarea')
        return <TextField multiline minRows={3} {...common} value={value} onChange={e=> onChange(e.target.value)}/>;

    if (field.input==='masters')
        return <MastersPicker field={field} value={value} collections={collections} query={query} onQuery={onQuery} onChange={onChange}/>;

    return <TextField {...common} value={value} onChange={e=> onChange(e.target.value)}/>;
}

// マスタ (識別子・属性) を選ぶ。(#232 のユーザーの図)
//   左: 選択した一覧。選んだ順。行の「×」で外す。(外したものは、右の一覧の、ファイルの順の位置に戻る)
//   右の上: 検索。論理名・物理名・ID・説明のどれかに含むもので、右の一覧を絞り込む。(大文字と小文字は区別しない。左は絞り込まない)
//   右の下: 全ての一覧。ファイルの順。選んだものは出さない。行を押すと、左の末尾に入る。
// 値は、選んだマスタの id の配列。(選んだ順。保存する identifiers[]・attributes[] も、この順)
// 並びと絞り込みの決まりは、manegers/tmEntityForm.js の masterItems・pickerLists・selectMaster・unselectMaster。
// マスタが 1 件も無い (選んだものも無い) ときは、知らせだけを出す。
function MastersPicker ({ field, value, collections, query, onQuery, onChange }) {
    const items = React.useMemo(()=> masterItems(collections, field.master), [collections, field.master]);
    const { selected, available } = React.useMemo(()=> pickerLists(items, value, query), [items, value, query]);

    if (items.length===0 && value.length===0)
        return (
            <Alert severity="info">
              {field.label}のマスタがありません。<code>data/tm/{field.master}.json</code> に書くと、ここで選べます。
            </Alert>
        );

    // 右の一覧が空のときの知らせ。
    const rest = items.filter(d=> !value.includes(d.id)).length;
    const nothing = rest===0 ? `${field.label}は、全部を選びました。` : '検索に合うものがありません。';

    return (
        <Box sx={{ display: 'flex', gap: 2, height: '100%', minHeight: 0 }}>
          {/* 左: 選択した一覧 */}
          <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              選択した{field.label} ({selected.length})
            </Typography>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {selected.length===0
               ? <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>まだ選んでいません。右の一覧から選びます。</Typography>
               : (
                   <List dense disablePadding aria-label={`選択した${field.label}`}>
                     {selected.map((d, i)=> (
                         <ListItem key={`${i}:${d.id}`} divider
                                   secondaryAction={
                                       <IconButton edge="end" size="small" aria-label={`${itemLabel(d)} を外す`}
                                                   onClick={()=> onChange(unselectMaster(value, d.id))}>
                                         <CloseIcon fontSize="small"/>
                                       </IconButton>
                                   }>
                           <ListItemText primary={itemLabel(d)} secondary={itemDetail(d)} slotProps={{ primary: { sx: { wordBreak: 'break-all' } } }}/>
                         </ListItem>
                     ))}
                   </List>
               )}
            </Box>
          </Paper>

          {/* 右: 検索と、全ての一覧 */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField size="small" fullWidth
                       label="検索"
                       placeholder="論理名・物理名・ID・説明"
                       value={query}
                       onChange={e=> onQuery(e.target.value)}/>

            <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                全ての{field.label} ({available.length})
              </Typography>

              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {available.length===0
                 ? <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>{nothing}</Typography>
                 : (
                     <List dense disablePadding aria-label={`全ての${field.label}`}>
                       {available.map(d=> (
                           <ListItemButton key={String(d.id)} divider
                                           aria-label={`${itemLabel(d)} を選ぶ`}
                                           onClick={()=> onChange(selectMaster(value, d.id))}>
                             <ListItemText primary={itemLabel(d)} secondary={itemDetail(d)} slotProps={{ primary: { sx: { wordBreak: 'break-all' } } }}/>
                             <AddIcon fontSize="small" color="action"/>
                           </ListItemButton>
                       ))}
                     </List>
                 )}
              </Box>
            </Paper>
          </Box>
        </Box>
    );
}

// 一覧の 1 行の、上の段。(論理名。無ければ物理名。どちらも無ければ id。マスタから消えたものは、そのことを出す)
function itemLabel (d) {
    if (d.missing)
        return `(マスタに無い id: ${d.id})`;

    return d.logical || d.physical || String(d.id);
}

// 一覧の 1 行の、下の段。(物理名と ID。説明は、幅が狭いので出さない。検索には使う)
function itemDetail (d) {
    return [d.logical && d.physical ? d.physical : null, `ID ${d.id}`].filter(Boolean).join(' ・ ');
}

// エンティティのイメージ。入力から作るレコード 1 件を、d3.ter で描く。(TM のタブの図と同じ描き方)
// 入力が変わるたびに、描き直す。見るだけ。(枠の上の操作は、pointer-events: none で止める)
// 描いたあとの大きさを測って、エンティティが枠の真ん中に収まるように、カメラを合わせる。(大きくはしない。Classes.js の fit と同じ考え方)
function EntityImage ({ values, collections }) {
    const box = React.useRef(null);

    // 入力のうち、描くものが変わったときだけ、描き直す。
    const data = React.useMemo(()=> previewEntityData(values, collections), [values, collections]);

    // D3Ter (assh0le) は、初めに描いた SVG にだけ Rectum をつなぐので、Rectum を作り直すたびに、部品ごと作り直す。(key)
    const drawn = React.useRef(0);

    const rectum = React.useMemo(()=> {
        drawn.current++;

        const r = new Rectum({
            transform: { k: 1, x: 0, y: 0 },
            grid: { draw: false },
            svg: { style: { background: '#fff' } },
        });

        r.data(data);

        return r;
    }, [data]);

    React.useEffect(()=> {
        let frame = null;
        let tries = 0;

        // 描き終わる (大きさが付く) まで、次の描画のたびに測る。(1 秒ほどで、あきらめる)
        const fit = ()=> {
            const svg = box.current?.querySelector('svg');
            const layer = svg?.querySelector('g.layer.foreground');
            const bbox = layer?.getBBox?.();
            const width = svg?.clientWidth || 0;
            const height = svg?.clientHeight || 0;

            if (!bbox || bbox.width===0 || width===0 || height===0) {
                if (tries++ < 60)
                    frame = requestAnimationFrame(fit);

                return;
            }

            const margin = 24;
            const k = Math.max(0.1, Math.min(1, (width - margin * 2) / bbox.width, (height - margin * 2) / bbox.height));

            // d3.ter (d3.svg) の view は、画面の位置 = 図の位置 × k + { x, y }
            rectum.view({
                k,
                x: (width - bbox.width * k) / 2 - bbox.x * k,
                y: (height - bbox.height * k) / 2 - bbox.y * k,
            });
        };

        frame = requestAnimationFrame(fit);

        return ()=> cancelAnimationFrame(frame);
    }, [rectum]);

    // 論理名が空のあいだは、名前 (「(論理名)」。previewEntityData) を薄い色で出す。
    // (d3.ter の名前の文字は、text.entity-title。同じ class の rect (見出しの当たり判定) には、かけない。#240)
    const unnamed = isPreviewNameEmpty(values);

    return (
        <Box ref={box} aria-label="エンティティのイメージ"
             sx={{
                 width: '100%', height: '100%', pointerEvents: 'none',
                 ...(unnamed ? { '& text.entity-title': { fillOpacity: 0.6, fontStyle: 'italic' } } : {}),
             }}>
          <D3Ter key={drawn.current} id="tm-entity-preview" rectum={rectum}/>
        </Box>
    );
}
