import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { errorMessage, useAddRecordMutation } from '../../../redux/api/dataApi.js';

export default function AddTmMaster ({ title, collection, label }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
          <Button variant="contained" size="small" onClick={()=> setOpen(true)} sx={{ textTransform: 'none' }}>
            {title}
          </Button>
          {open && <MasterDialog title={title} collection={collection} label={label} onClose={()=> setOpen(false)}/>}
        </>
    );
}

function MasterDialog ({ title, collection, label, onClose }) {
    const titleId = React.useId();
    const [addRecord, { isLoading }] = useAddRecordMutation();
    const [logicalError, setLogicalError] = React.useState(false);
    const [failure, setFailure] = React.useState(null);

    const close = ()=> {
        if (!isLoading)
            onClose();
    };

    const submit = async (e)=> {
        e.preventDefault();
        if (isLoading)
            return;

        const form = new FormData(e.currentTarget);
        const logical = form.get('logical').trim();
        const physical = form.get('physical').trim();
        const description = form.get('description').trim();
        const type = form.get('type').trim();
        const length = form.get('length');
        const scale = form.get('scale');

        setFailure(null);
        setLogicalError(!logical);
        if (!logical)
            return;

        const dataType = {
            ...(type ? { type } : {}),
            ...(length !== '' ? { length: Number(length) } : {}),
            ...(scale !== '' ? { scale: Number(scale) } : {}),
        };
        const record = {
            name: physical ? { logical, physical } : logical,
            ...(description ? { description } : {}),
            ...(Object.keys(dataType).length ? { data_type: dataType } : {}),
        };

        try {
            await addRecord({ name: collection, record }).unwrap();
            onClose();
        } catch (error) {
            setFailure(errorMessage(error, `${label}を追加できません。`));
        }
    };

    return (
        <Dialog open onClose={close} fullWidth maxWidth="sm" aria-labelledby={titleId}
                slotProps={{ paper: { component: 'form', onSubmit: submit } }}>
          <DialogTitle id={titleId}>{title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField name="logical" label="論理名" size="small" required autoFocus
                         error={logicalError} helperText={logicalError ? '論理名を入力してください。' : undefined}
                         onChange={()=> setLogicalError(false)} disabled={isLoading}/>
              <TextField name="physical" label="物理名" size="small" disabled={isLoading}/>
              <TextField name="type" label="データ型" size="small" disabled={isLoading}/>
              <Stack direction="row" spacing={2}>
                <TextField name="length" label="長さ" type="number" size="small" fullWidth
                           slotProps={{ htmlInput: { min: 1, step: 1 } }} disabled={isLoading}/>
                <TextField name="scale" label="小数部桁数" type="number" size="small" fullWidth
                           slotProps={{ htmlInput: { min: 0, step: 1 } }} disabled={isLoading}/>
              </Stack>
              <TextField name="description" label="説明" size="small" multiline minRows={3} disabled={isLoading}/>
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
