import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { CARDINALITIES, OPTIONALITIES, SUBSET_KINDS } from '@yanqirenshi/model.tm';

import { errorMessage, useAddRecordMutation } from '../../../redux/api/dataApi.js';
import { buildRelationshipRecord } from '../../../manegers/tmAddForms.js';
import { nameText, TM_TABLE_COLLECTIONS } from '../../../manegers/tmTables.js';

import { TM_DIALOG_Z_INDEX } from './tmDialog.js';

// ビジネスのページの Relationships のタブの「Relationship の追加」。(0.12.0 から。yanqirenshi/iHub#238)
// ボタンを押すと、モーダルのフォームを出し、POST /api/tm/relationships で、結線を 1 件足す。(id は API サーバーが振る)
// 保存するレコードの形は、manegers/tmAddForms.js の buildRelationshipRecord が作る。
// 接続位置 (from.position・to.position) は、2 つのエンティティの位置から、向かい合う向きに決める。(フォームに欄は無い。#240)
const TITLE = 'Relationship の追加';
const CARDINALITY_LABELS = { 1: '1', 3: '多' };
const OPTIONALITY_LABELS = { 0: '任意', 1: '必須' };

// 端点の入力。{ entity, cardinality, optionality }
function endValues (form, name) {
    return {
        // HTML の選択値は文字列なので、JSON で数値 ID と文字列 ID を区別している。(EntitySelect)
        entity: JSON.parse(form.get(name)),
        cardinality: form.get(`${name}Cardinality`),
        optionality: form.get(`${name}Optionality`),
    };
}

export default function AddTmRelationship ({ entities }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
          <Button variant="contained" size="small" onClick={()=> setOpen(true)} sx={{ textTransform: 'none' }}>
            {TITLE}
          </Button>
          {open && <RelationshipDialog entities={entities} onClose={()=> setOpen(false)}/>}
        </>
    );
}

function RelationshipDialog ({ entities, onClose }) {
    const titleId = React.useId();
    const [addRecord, { isLoading }] = useAddRecordMutation();
    const [subsetKind, setSubsetKind] = React.useState('');
    const [failure, setFailure] = React.useState(null);
    const options = entities.filter(entity=> typeof entity?.id==='number' || typeof entity?.id==='string');
    const canSubmit = options.length > 0 && !isLoading;

    const close = ()=> {
        if (!isLoading)
            onClose();
    };

    const submit = async (e)=> {
        e.preventDefault();
        if (!canSubmit)
            return;

        const form = new FormData(e.currentTarget);
        const record = buildRelationshipRecord({
            from: endValues(form, 'from'),
            to: endValues(form, 'to'),
            type: form.get('type'),
            label: form.get('label'),
            subsetKind,
            subsetCode: form.get('subsetCode'),
            description: form.get('description'),
        }, options);

        setFailure(null);
        try {
            await addRecord({ name: TM_TABLE_COLLECTIONS.relationships, record }).unwrap();
            onClose();
        } catch (error) {
            setFailure(errorMessage(error, 'リレーションシップを追加できません。'));
        }
    };

    return (
        <Dialog open onClose={close} fullWidth maxWidth="sm" aria-labelledby={titleId} sx={{ zIndex: TM_DIALOG_Z_INDEX }}
                slotProps={{ paper: { component: 'form', onSubmit: submit } }}>
          <DialogTitle id={titleId}>{TITLE}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {options.length === 0 && <Alert severity="info">Entities タブでエンティティを追加してください。</Alert>}
              <RelationshipEndFields name="from" label="接続元" entities={options} disabled={!canSubmit}/>
              <RelationshipEndFields name="to" label="接続先" entities={options} disabled={!canSubmit}/>
              <TextField name="type" label="種類" size="small" disabled={isLoading}/>
              <TextField name="label" label="ラベル" size="small" disabled={isLoading}/>
              <TextField select label="サブセットの区分" size="small" value={subsetKind}
                         onChange={e=> setSubsetKind(e.target.value)} disabled={isLoading}
                         slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}>
                <option value="">指定なし</option>
                {SUBSET_KINDS.map(kind=> <option key={kind} value={kind}>{kind}</option>)}
              </TextField>
              {subsetKind &&
               <TextField name="subsetCode" label="区分コード" size="small" required disabled={isLoading}
                          slotProps={{ htmlInput: { pattern: '.*\\S.*' } }}/>}
              <TextField name="description" label="説明" size="small" multiline minRows={3} disabled={isLoading}/>
              {failure && <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>{failure}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close} disabled={isLoading}>キャンセル</Button>
            <Button type="submit" variant="contained" disabled={!canSubmit}>作成</Button>
          </DialogActions>
        </Dialog>
    );
}

function RelationshipEndFields ({ name, label, entities, disabled }) {
    return (
        <Stack spacing={1} role="group" aria-label={label}>
          <EntitySelect name={name} label={`${label}のエンティティ`} entities={entities} disabled={disabled}/>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <EndOptionSelect name={`${name}Cardinality`} label="カーディナリティ"
                             values={CARDINALITIES} labels={CARDINALITY_LABELS} disabled={disabled}/>
            <EndOptionSelect name={`${name}Optionality`} label="オプショナリティ"
                             values={OPTIONALITIES} labels={OPTIONALITY_LABELS} disabled={disabled}/>
          </Stack>
        </Stack>
    );
}

function EndOptionSelect ({ name, label, values, labels, disabled }) {
    return (
        <TextField select name={name} label={label} size="small" defaultValue="" fullWidth disabled={disabled}
                   slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}>
          <option value="">指定なし</option>
          {values.map(value=> <option key={value} value={value}>{labels[value]}</option>)}
        </TextField>
    );
}

function EntitySelect ({ name, label, entities, disabled }) {
    return (
        <TextField select name={name} label={label} size="small" defaultValue="" required disabled={disabled}
                   slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}>
          <option value="">選択してください</option>
          {entities.map(({ id, name })=> {
              // HTML の選択値は文字列なので、JSON で数値 ID と文字列 ID を区別する。
              const value = JSON.stringify(id);
              const text = nameText(name);

              return <option key={value} value={value}>{text ? `${text} [${id}]` : String(id)}</option>;
          })}
        </TextField>
    );
}
