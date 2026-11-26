import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';

import D3Ter, { Rectum } from '@yanqirenshi/d3.ter';
import { ENTITY_TYPES } from '@yanqirenshi/model.tm';

import { errorMessage, useAddRecordMutation, useCollections } from '../../../redux/api/dataApi.js';
import {
    ENTITY_FORM_FIELDS, ENTITY_FORM_TABS, buildEntityRecord, firstTabWithError, initialEntityForm, previewEntityData, validateEntityForm,
} from '../../../manegers/tmEntityForm.js';
import { TM_TABLE_COLLECTIONS, nameParts } from '../../../manegers/tmTables.js';

// ビジネスのページの Entities のタブの「Entity の追加」。(0.12.0 から。叩き台)
// ボタンを押すと、モーダル (MUI の Dialog) のフォームを出し、POST /api/tm/entities で、エンティティを 1 件足す。(id は API サーバーが振る)
//
// モーダルの形 (#232 のコメントの、ユーザーの図):
//   左: エンティティのイメージ。入力から作るレコードを、d3.ter で描く。(EntityImage。見るだけ)
//   右: タブ「基本」「Identifiers」「Attributes」と、その中身。
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
const PANE_HEIGHT = 440;

// モーダルの左の余白。(サイドメニューの、選んでいる項目の札は、長い名前でも約 165px まで伸びる。表の左の余白と同じ)
const SIDE_MENU_WIDTH = 180;

function EntityDialog ({ onClose }) {
    const collections = useCollections();
    const [addRecord, { isLoading }] = useAddRecordMutation();

    const [values, setValues] = React.useState(initialEntityForm);
    const [errors, setErrors] = React.useState({});
    const [failure, setFailure] = React.useState(null);
    const [tab, setTab] = React.useState(ENTITY_FORM_TABS[0].code);

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
        // サイドメニューは、モーダルの背景より手前に出るので、モーダルの左端を、サイドメニュー (選んでいる項目の札を含む) の右から始める。
        <Dialog open onClose={close} fullWidth maxWidth="lg"
                slotProps={{
                    paper: {
                        component: 'form', onSubmit: submit, noValidate: true,
                        sx: { ml: `${SIDE_MENU_WIDTH}px`, mr: 4, width: `calc(100% - ${SIDE_MENU_WIDTH}px - 32px)` },
                    },
                }}>
          <DialogTitle>Entity の追加</DialogTitle>

          <DialogContent>
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

                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pt: 2 }}>
                  <Stack spacing={2}>
                    {ENTITY_FORM_FIELDS.filter(f=> f.tab===tab).map(field=> (
                        <Field key={field.key}
                               field={field}
                               value={values[field.key]}
                               error={errors[field.key]}
                               collections={collections}
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
function Field ({ field, value, error, collections, onChange }) {
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
            <TextField select {...common} value={value} onChange={e=> onChange(e.target.value)}>
              {ENTITY_TYPES.map(t=> <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
        );

    if (field.input==='textarea')
        return <TextField multiline minRows={3} {...common} value={value} onChange={e=> onChange(e.target.value)}/>;

    if (field.input==='masters')
        return <MastersTable field={field} value={value} collections={collections} onChange={onChange}/>;

    return <TextField {...common} value={value} onChange={e=> onChange(e.target.value)}/>;
}

// マスタ (識別子・属性) の一覧の表。行ごとのチェックで、このエンティティに持たせるものを選ぶ。(叩き台)
// 列は、チェック・ID・論理名・物理名・説明。(Identifiers・Attributes のタブの表と同じ出し方) 値は、選んだマスタの id の配列。(選んだ順)
// マスタが 1 件も無いときは、知らせを出す。
function MastersTable ({ field, value, collections, onChange }) {
    const rows = React.useMemo(()=> {
        const list = collections?.[TM_TABLE_COLLECTIONS[field.master]];

        return (Array.isArray(list) ? list : [])
            .filter(Boolean)
            .map(d=> ({ id: d.id, ...nameParts(d.name), description: d.description ?? '' }));
    }, [collections, field.master]);

    if (rows.length===0)
        return (
            <Alert severity="info">
              {field.label}のマスタがありません。<code>data/tm/{field.master}.json</code> に書くと、ここで選べます。
            </Alert>
        );

    const toggle = (id)=> onChange(value.includes(id) ? value.filter(v=> v!==id) : [...value, id]);

    return (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label={field.label}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"/>
                {['ID', '論理名', '物理名', '説明'].map(h=> <TableCell key={h} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i)=> {
                  const checked = value.includes(row.id);

                  return (
                      <TableRow key={`${i}:${row.id}`} hover selected={checked} onClick={()=> toggle(row.id)} sx={{ cursor: 'pointer' }}>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={checked} slotProps={{ input: { 'aria-label': `${row.logical || row.physical || row.id} を選ぶ` } }}/>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{String(row.id)}</TableCell>
                        <TableCell>{row.logical}</TableCell>
                        <TableCell>{row.physical}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{String(row.description)}</TableCell>
                      </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </TableContainer>
    );
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

    return (
        <Box ref={box} aria-label="エンティティのイメージ" sx={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          <D3Ter key={drawn.current} id="tm-entity-preview" rectum={rectum}/>
        </Box>
    );
}
