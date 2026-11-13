import React, { useEffect, useRef, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useDispatch, useSelector } from 'react-redux';

import { Leaf } from '@yanqirenshi/manipulater';

// <markdown-workspace> などのカスタム要素を登録する。
import '@yanqirenshi/markdown.sitter';

import { useConfig } from '../../config.js';
import { dockColor } from '../../manegers/colors.js';
import sogh from '../../manegers/sogh.js';
import {
    createIssueInProject,
    defaultAssignees,
    fetchAssignableUsers,
    fetchProjectDateFields,
    fetchProjectRepository,
} from '../../manegers/githubIssue.js';
import { fetchProjectsV2 } from '../../redux/slices/scrumSlice.js';

// 吹き出しの大きさ
const LEAF_W = 1111;
const LEAF_H = 888;
// ボタンと吹き出しの間隔
const BRANCH_H = 33;
// 画面の端からの余白
const MARGIN = 8;

const IDLE = { status: 'idle', data: null, error: null };

function leafPosition (root) {
    const w_center = root.position.x + (root.size.w / 2);

    const x = Math.min(Math.max(MARGIN, w_center - (LEAF_W / 2)),
                       Math.max(MARGIN, window.innerWidth - LEAF_W - MARGIN * 3));
    const y = Math.max(MARGIN, root.position.y - BRANCH_H - LEAF_H);

    return { x, y };
}

const userLabel = (user)=> user.name ? `${user.login} (${user.name})` : user.login;

// ドックの「Issue の追加」の吹き出しの中身。Project を選んで、リポジトリに Issue を作り、Project に足す。
//   - 日付: 選んだ Project の日付の項目のうち、名前が Plan. か NextAction. で始まるものを欄にする。(Result.* は出さない)
//     空の欄は設定しない。
//   - 担当: 作成先のリポジトリで担当にできる人から、複数選べる。初めは、ログイン中の自分。
//   - 作成先のリポジトリは、Project に紐づいた先頭のリポジトリ。
//
//   root … ドックのボタン ({ code, position, size })。吹き出しの位置を決める。使う側 (Operators) から渡す。
//
// 吹き出しの枠の色は、設定の colors (配色の主の色。ドックのボタンと同じ) から決める。
export default function ProjectItemForm (props) {
    const root = props.root;

    const { colors } = useConfig();
    const theme_color = React.useMemo(()=> dockColor(colors), [colors]);

    const dispatch = useDispatch();
    const authed = useSelector(s=> s.githubAuth.value);
    const { status: projects_status, ids: project_ids } = useSelector(s=> s.scrum.projectsV2);

    const [project_id, setProjectId] = useState('');
    const [repository, setRepository] = useState(IDLE);
    const [date_fields, setDateFields] = useState(IDLE);
    const [users, setUsers] = useState(IDLE);
    const [assignees, setAssignees] = useState([]);
    const [dates, setDates] = useState({});
    const [title, setTitle] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    const workspace = useRef(null);

    useEffect(()=> {
        if (authed===true && projects_status==='idle')
            dispatch(fetchProjectsV2());
    }, [authed, projects_status, dispatch]);

    // Project を選んだら、作成先のリポジトリと、日付の項目を読み込む。
    useEffect(()=> {
        setDates({});

        if (!project_id) {
            setRepository(IDLE);
            setDateFields(IDLE);
            return;
        }

        let canceled = false;

        setRepository({ ...IDLE, status: 'loading' });
        setDateFields({ ...IDLE, status: 'loading' });

        fetchProjectRepository(project_id)
            .then(repo=> !canceled && setRepository({ status: 'succeeded', data: repo, error: null }))
            .catch(e=> !canceled && setRepository({ status: 'failed', data: null, error: e.message }));

        fetchProjectDateFields(project_id)
            .then(fields=> !canceled && setDateFields({ status: 'succeeded', data: fields, error: null }))
            .catch(e=> !canceled && setDateFields({ status: 'failed', data: null, error: e.message }));

        return ()=> { canceled = true; };
    }, [project_id]);

    // 作成先のリポジトリが決まったら、担当にできる人を読み込み、自分を選んだ状態にする。
    const repository_id = repository.data?.id || null;

    useEffect(()=> {
        setAssignees([]);

        if (!repository_id) {
            setUsers(IDLE);
            return;
        }

        let canceled = false;

        setUsers({ ...IDLE, status: 'loading' });

        fetchAssignableUsers(repository_id)
            .then(found=> {
                if (canceled)
                    return;

                setUsers({ status: 'succeeded', data: found, error: null });
                setAssignees(defaultAssignees(found));
            })
            .catch(e=> !canceled && setUsers({ status: 'failed', data: null, error: e.message }));

        return ()=> { canceled = true; };
    }, [repository_id]);

    // ログイン中のアカウントの、閉じていない ProjectV2
    const projects = (Array.isArray(project_ids) ? project_ids : [])
          .map(id=> sogh.projectV2(id))
          .filter(p=> p && !p.core().closed);

    const repo = repository.data;
    const fields = date_fields.data || [];
    const can_add = !!project_id && !!repo && title.trim()!=='' && !sending;

    const add = async ()=> {
        if (!can_add) return;

        setSending(true);
        setResult(null);

        try {
            const body = workspace.current ? workspace.current.value : '';
            const issue = await createIssueInProject({
                project_id,
                repository_id: repo.id,
                title: title.trim(),
                body,
                assignee_ids: assignees.map(user=> user.id),
                dates: fields.map(field=> ({ id: field.id, name: field.name, value: dates[field.id] || '' })),
            });

            setResult({ type: 'success', issue });

            // 次の Issue のために、入れたものを空に戻す。(担当は、初めの選び方に戻す)
            setTitle('');
            setDates({});
            setAssignees(users.data ? defaultAssignees(users.data) : []);
            if (workspace.current) workspace.current.value = '';
        } catch (e) {
            setResult({ type: 'error', message: e.message, issue: e.issue || null, stage: e.stage || null });
        } finally {
            setSending(false);
        }
    };

    const { x, y } = leafPosition(root);

    return (
        <Leaf x={x} y={y} w={LEAF_W} h={LEAF_H} theme_color={theme_color || undefined}>
          <Box sx={{ height: '100%', boxSizing: 'border-box', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Project にイシューを追加</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 444 }}>
                <InputLabel id="project-item-form-project">Project</InputLabel>
                <Select labelId="project-item-form-project"
                        label="Project"
                        value={project_id}
                        disabled={sending}
                        onChange={e=> setProjectId(e.target.value)}>
                  {projects.map(p=> (
                      <MenuItem key={p.id()} value={p.id()}>{p.title()}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Destination authed={authed}
                           projects_status={projects_status}
                           project_id={project_id}
                           repository={repository}/>
            </Box>

            <TextField label="タイトル"
                       size="small"
                       required
                       fullWidth
                       value={title}
                       disabled={sending}
                       onChange={e=> setTitle(e.target.value)}/>

            <Assignees users={users}
                       value={assignees}
                       disabled={sending}
                       onChange={setAssignees}/>

            <DateFields date_fields={date_fields}
                        dates={dates}
                        disabled={sending}
                        onChange={(id, value)=> setDates(prev=> ({ ...prev, [id]: value }))}/>

            <Box sx={{ flex: 1, minHeight: 0, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <markdown-workspace ref={workspace} mode="split" live="" style={{ display: 'block', height: '100%' }}>
                <markdown-editor slot="editor" placeholder="本文 (Markdown)"></markdown-editor>
                <markdown-viewer slot="preview"></markdown-viewer>
              </markdown-workspace>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Result result={result}/>
              </Box>

              <Button variant="contained" disabled={!can_add} onClick={add}>
                {sending ? '追加中...' : '追加'}
              </Button>
            </Box>
          </Box>
        </Leaf>
    );
}

function Destination (props) {
    const { authed, projects_status, project_id, repository } = props;

    if (authed!==true)
        return <Typography color="text.secondary">Github に接続していません。</Typography>;

    if (projects_status==='loading')
        return <Typography color="text.secondary">Project を読み込み中...</Typography>;

    if (projects_status==='failed')
        return <Typography color="error">Project を取得できませんでした。</Typography>;

    if (!project_id)
        return null;

    if (repository.status==='loading')
        return <Typography color="text.secondary">作成先を読み込み中...</Typography>;

    if (repository.status==='failed')
        return <Typography color="error">作成先を取得できませんでした。({repository.error})</Typography>;

    if (!repository.data)
        return <Typography color="error">この Project にはリポジトリが紐づいていません。</Typography>;

    return <Typography>作成先: {repository.data.nameWithOwner}</Typography>;
}

// 担当。作成先のリポジトリで担当にできる人から、複数選べる。(選ばなければ、担当なしで作る)
function Assignees (props) {
    const { users, value, disabled, onChange } = props;

    if (users.status==='idle')
        return null;

    if (users.status==='failed')
        return <Typography color="error">担当にできる人を取得できませんでした。担当なしで作ります。({users.error})</Typography>;

    return (
        <Autocomplete multiple
                      size="small"
                      options={users.data?.users || []}
                      value={value}
                      disabled={disabled || users.status==='loading'}
                      loading={users.status==='loading'}
                      loadingText="読み込み中..."
                      noOptionsText="担当にできる人がいません"
                      getOptionLabel={userLabel}
                      isOptionEqualToValue={(option, selected)=> option.id===selected.id}
                      onChange={(e, selected)=> onChange(selected)}
                      renderInput={params=> <TextField {...params} label="担当 (assignees)"/>}/>
    );
}

// 日付。選んだ Project の、Plan.* と NextAction.* の日付の項目。(無い Project では、何も出さない) 空の欄は、設定しない。
function DateFields (props) {
    const { date_fields, dates, disabled, onChange } = props;

    if (date_fields.status==='failed')
        return <Typography color="error">日付の項目を取得できませんでした。日付なしで作ります。({date_fields.error})</Typography>;

    const fields = date_fields.data || [];

    if (fields.length===0)
        return null;

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {fields.map(field=> (
              <TextField key={field.id}
                         type="date"
                         label={field.name}
                         size="small"
                         value={dates[field.id] || ''}
                         disabled={disabled}
                         slotProps={{ inputLabel: { shrink: true } }}
                         onChange={e=> onChange(field.id, e.target.value)}/>
          ))}
        </Box>
    );
}

function Result (props) {
    const result = props.result;

    if (!result) return null;

    if (result.type==='success')
        return (
            <Typography>
              追加しました: <Link href={result.issue.url} target="_blank" rel="noopener noreferrer">{result.issue.url}</Link>
            </Typography>
        );

    const lead = result.stage==='dates'
          ? 'イシューを作成し、Project に追加しましたが、次の日付を設定できませんでした。'
          : 'イシューは作成しましたが、Project に追加できませんでした。';

    return (
        <Typography color="error" sx={{ whiteSpace: 'pre-wrap' }}>
          {result.issue
           ? <>{lead}(<Link href={result.issue.url} target="_blank" rel="noopener noreferrer">{result.issue.url}</Link>)<br/></>
           : null}
          {result.message}
        </Typography>
    );
}
