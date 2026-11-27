import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { errorMessage, useAddRecordMutation } from '../../../../redux/api/dataApi.js';
import {
    OVERVIEW_NODE_FIELDS, buildOverviewNodeRecord, initialOverviewNodeForm, validateOverviewNodeForm,
} from '../../../../manegers/overviewNodeForm.js';

import { DIALOG_Z_INDEX } from '../../dialog.js';

const TITLE = 'ノードの追加';

// 艦橋の Overview のタブの「ノードの追加」のモーダル。(0.12.0 から。yanqirenshi/iHub#242。叩き台)
// ドックの丸 (このタブだけに出る) の吹き出しの「ノードの追加」で開く。
// POST /api/overview/nodes で、最上位のノードを 1 件足す。(id は API サーバーが振る)
// 項目と、保存するレコードの形は、manegers/overviewNodeForm.js が決める。
//   nodes   … いまある最上位のノード。(新しいノードを置く所を決めるのに使う)
//   onSave  … レコードを保存する関数。(record)=> Promise。(図を作り直すため、Overview の側で包む)
//   onClose … 閉じる
export default function AddOverviewNode ({ nodes, onSave, onClose }) {
    const titleId = React.useId();
    const [values, setValues] = React.useState(initialOverviewNodeForm);
    const [errors, setErrors] = React.useState({});
    const [saving, setSaving] = React.useState(false);
    const [failure, setFailure] = React.useState(null);

    const close = ()=> {
        if (!saving)
            onClose();
    };

    const change = (key)=> (e)=> {
        const value = e.target.value;

        setValues(prev=> ({ ...prev, [key]: value }));
        setErrors(prev=> ({ ...prev, [key]: undefined }));
    };

    const submit = async (e)=> {
        e.preventDefault();
        if (saving)
            return;

        const found = validateOverviewNodeForm(values);

        setFailure(null);
        setErrors(found);
        if (Object.keys(found).length > 0)
            return;

        setSaving(true);

        try {
            await onSave(buildOverviewNodeRecord(values, nodes));
            onClose();
        } catch (error) {
            setFailure(errorMessage(error, 'ノードを追加できません。'));
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={close} fullWidth maxWidth="xs" aria-labelledby={titleId} sx={{ zIndex: DIALOG_Z_INDEX }}
                slotProps={{ paper: { component: 'form', onSubmit: submit, noValidate: true } }}>
          <DialogTitle id={titleId}>{TITLE}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {OVERVIEW_NODE_FIELDS.map((f, i)=> (
                  <TextField key={f.key}
                             name={f.key}
                             label={f.label}
                             size="small"
                             required={!!f.required}
                             autoFocus={i===0}
                             type={f.input==='number' ? 'number' : 'text'}
                             slotProps={f.input==='number' ? { htmlInput: { min: 1, step: 1 } } : undefined}
                             value={values[f.key]}
                             error={!!errors[f.key]}
                             helperText={errors[f.key]}
                             onChange={change(f.key)}
                             disabled={saving}/>
              ))}
              {failure && <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>{failure}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close} disabled={saving}>キャンセル</Button>
            <Button type="submit" variant="contained" disabled={saving}>作成</Button>
          </DialogActions>
        </Dialog>
    );
}

// 保存の関数。(Overview の部品で使う)
export function useAddOverviewNode () {
    const [addRecord] = useAddRecordMutation();

    return React.useCallback((record)=> addRecord({ name: 'overview/nodes', record }).unwrap(), [addRecord]);
}
