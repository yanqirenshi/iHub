import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Leaf } from '@yanqirenshi/manipulater';

import { useConfig } from '../../../../config.js';
import { dockColor } from '../../../../manegers/colors.js';
import { errorMessage, useAddRecordMutation, useCollections } from '../../../../redux/api/dataApi.js';
import {
    OVERVIEW_NODE_FIELDS, buildOverviewNodeRecord, initialOverviewNodeForm, validateOverviewNodeForm,
} from '../../../../manegers/overviewNodeForm.js';
import { DOCK_LEAF_BRANCH_H, DOCK_LEAF_MARGIN, dockLeafPosition } from '../../../assemblies/frames/dockOperators.js';

const TITLE = 'ノードの追加';

// 吹き出しの中の大きさ
const LEAF_W = 444;
const LEAF_H = 300;
// 画面の高さが足りないときの、いちばん小さい高さ。(項目の所はスクロールし、「作成」のボタンは、いつも下に見える)
const LEAF_MIN_H = 180;
// 吹き出しの枠 (manipulater の Leaf の padding。上下で 10px) の分
const LEAF_FRAME = 10;

// 吹き出しの中の高さ。(丸の上に収まらないときは、縮める)
function leafHeight (root) {
    const room = root.position.y - DOCK_LEAF_BRANCH_H - DOCK_LEAF_MARGIN - LEAF_FRAME;

    return Math.min(LEAF_H, Math.max(LEAF_MIN_H, room));
}

// 艦橋の Overview のタブの、ドックの「要素の追加」の丸の吹き出し。(0.12.0 から。yanqirenshi/iHub#242。叩き台)
// 吹き出しの中に、ノードの登録フォームを出す。(見た目は、GitHub の丸の吹き出し ProjectItemForm に近づける)
// 「作成」で、POST /api/overview/nodes に、最上位のノードを 1 件足す。(id は API サーバーが振る)
// 足せたら、フォームを初めの値に戻し、吹き出しは開いたままにする。(続けて足せるように) 足したことを、短い知らせで出す。
// 吹き出しを閉じて開き直すと、入力は初めの値に戻る。(閉じると、この部品は消えるため)
// 項目と、保存するレコードの形は、manegers/overviewNodeForm.js が決める。
//   root   … ドックの丸 (useDockOperator の leaf に渡る root)。吹き出しの位置を決める
//   onSave … レコードを保存する関数。(record)=> Promise。(図を作り直すため、Overview の側で包む)
export default function AddOverviewNode ({ root, onSave }) {
    const { colors } = useConfig();
    const theme_color = React.useMemo(()=> dockColor(colors), [colors]);

    // 置く所を決めるのに使う、いまある最上位のノード。(足すたびに新しくなるので、ここで読む)
    const nodes = useCollections()['overview/nodes'];

    const [values, setValues] = React.useState(initialOverviewNodeForm);
    const [errors, setErrors] = React.useState({});
    const [saving, setSaving] = React.useState(false);
    // 知らせ。{ type: 'success' | 'error', message }
    const [result, setResult] = React.useState(null);

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

        setResult(null);
        setErrors(found);
        if (Object.keys(found).length > 0)
            return;

        const record = buildOverviewNodeRecord(values, nodes);

        setSaving(true);

        try {
            await onSave(record);

            setValues(initialOverviewNodeForm());
            setResult({ type: 'success', message: `「${record.label.text}」を足しました。` });
        } catch (error) {
            setResult({ type: 'error', message: errorMessage(error, 'ノードを追加できません。') });
        } finally {
            setSaving(false);
        }
    };

    const size = { w: LEAF_W, h: leafHeight(root) };
    const { x, y } = dockLeafPosition(root, size);

    return (
        <Leaf x={x} y={y} w={size.w} h={size.h} theme_color={theme_color || undefined}>
          <Box component="form" noValidate onSubmit={submit}
               sx={{ height: '100%', boxSizing: 'border-box', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">{TITLE}</Typography>

            {/* 項目の所。(高さが足りないときは、ここだけスクロールする) */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pt: 1,
                       display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignContent: 'start' }}>
              {OVERVIEW_NODE_FIELDS.map((f, i)=> (
                  <TextField key={f.key}
                             name={f.key}
                             label={f.label}
                             size="small"
                             fullWidth
                             required={!!f.required}
                             autoFocus={i===0}
                             type={f.input==='number' ? 'number' : 'text'}
                             slotProps={f.input==='number' ? { htmlInput: { min: 1, step: 1 } } : undefined}
                             value={values[f.key]}
                             error={!!errors[f.key]}
                             helperText={errors[f.key]}
                             onChange={change(f.key)}
                             disabled={saving}
                             sx={f.wide ? { gridColumn: '1 / -1' } : undefined}/>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Result result={result}/>
              </Box>

              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? '作成中...' : '作成'}
              </Button>
            </Box>
          </Box>
        </Leaf>
    );
}

function Result ({ result }) {
    if (!result)
        return null;

    return (
        <Typography variant="body2" color={result.type==='error' ? 'error' : 'text.primary'} sx={{ whiteSpace: 'pre-wrap' }}>
          {result.message}
        </Typography>
    );
}

// 保存の関数。(Overview の部品で使う)
export function useAddOverviewNode () {
    const [addRecord] = useAddRecordMutation();

    return React.useCallback((record)=> addRecord({ name: 'overview/nodes', record }).unwrap(), [addRecord]);
}
