import React from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { ENTITY_TYPES } from '@yanqirenshi/model.tm';

import { errorMessage, useAddRecordMutation, useCollections } from '../../../redux/api/dataApi.js';
import { ENTITY_FORM_FIELDS, buildEntityRecord, initialEntityForm, validateEntityForm } from '../../../manegers/tmEntityForm.js';
import { TM_TABLE_COLLECTIONS, nameText } from '../../../manegers/tmTables.js';

// ビジネスのページの Entities のタブの「Entity の追加」。(0.12.0 から。叩き台)
// ボタンを押すと、モーダル (MUI の Dialog) のフォームを出し、POST /api/tm/entities で、エンティティを 1 件足す。(id は API サーバーが振る)
//
// フォームの項目は、manegers/tmEntityForm.js の ENTITY_FORM_FIELDS が決める。(この部品は、項目の input の種類ごとに、入力の部品を出すだけ)
// 保存するレコードの形 (名前・行の id・位置) も、manegers/tmEntityForm.js の buildEntityRecord が作る。
//
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

// マスタ (識別子・属性) の選択肢。{ id, label }。名前は Entities の表と同じ出し方 (「論理名 (物理名)」)。名前が無ければ id。
function masterOptions (collections, master) {
    const list = collections?.[TM_TABLE_COLLECTIONS[master]];

    return (Array.isArray(list) ? list : [])
        .filter(Boolean)
        .map(d=> ({ id: d.id, label: nameText(d.name) || String(d.id) }));
}

function EntityDialog ({ onClose }) {
    const collections = useCollections();
    const [addRecord, { isLoading }] = useAddRecordMutation();

    const [values, setValues] = React.useState(initialEntityForm);
    const [errors, setErrors] = React.useState({});
    const [failure, setFailure] = React.useState(null);

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

        if (Object.keys(found).length > 0)
            return;

        try {
            await addRecord({ name: TM_TABLE_COLLECTIONS.entities, record: buildEntityRecord(values, collections) }).unwrap();
            onClose();
        } catch (error) {
            setFailure(errorMessage(error, 'エンティティを追加できません。'));
        }
    };

    return (
        <Dialog open onClose={close} fullWidth maxWidth="sm"
                slotProps={{ paper: { component: 'form', onSubmit: submit, noValidate: true } }}>
          <DialogTitle>Entity の追加</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {ENTITY_FORM_FIELDS.map(field=> (
                  <Field key={field.key}
                         field={field}
                         value={values[field.key]}
                         error={errors[field.key]}
                         collections={collections}
                         onChange={(value)=> change(field.key, value)}/>
              ))}

              {failure && <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>{failure}</Alert>}
            </Stack>
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
        return <MastersField field={field} common={common} value={value} collections={collections} onChange={onChange}/>;

    return <TextField {...common} value={value} onChange={e=> onChange(e.target.value)}/>;
}

// マスタから複数を選ぶ。値は、選んだマスタの id の配列。(選んだ順)
// マスタが 1 件も無いときは、選べるものが無いことを出す。
function MastersField ({ field, common, value, collections, onChange }) {
    const options = React.useMemo(()=> masterOptions(collections, field.master), [collections, field.master]);
    const selected = options.filter(o=> value.includes(o.id));
    const none = options.length===0;

    return (
        <Autocomplete multiple
                      size="small"
                      options={options}
                      value={value.map(id=> selected.find(o=> o.id===id)).filter(Boolean)}
                      getOptionLabel={o=> o.label}
                      isOptionEqualToValue={(o, v)=> o.id===v.id}
                      filterSelectedOptions
                      disabled={none}
                      noOptionsText="選べるものがありません"
                      onChange={(_e, list)=> onChange(list.map(o=> o.id))}
                      renderInput={params=> (
                          <TextField {...params}
                                     label={common.label}
                                     error={common.error}
                                     helperText={none
                                                 ? `${field.label}のマスタ (data/tm/${field.master}.json) がありません。`
                                                 : common.helperText}/>
                      )}/>
    );
}
