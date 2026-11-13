import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import sogh from '../../manegers/sogh.js';
import { fetchIssueDateValues } from '../../manegers/githubProject.js';
import { nextActionOf } from '../../manegers/nextAction.js';

// 自分が担当の Issue (Cockpit タブのカードになるもの) の id。
function assignedIssueIds (ids) {
    const viewer = sogh.viewer();
    const login = viewer ? viewer.login() : null;

    if (!login)
        return [];

    return ids.filter(id=> sogh.issue(id).assignees().find(ass=> ass.login===login));
}

// Issue を読んだあと、自分が担当の Issue の NextAction の日付を、まとめて読む。(Issue の数だけは呼ばない)
// 日付の読み込みに失敗しても、Issue は、そのまま返す。(日付が無い扱いになり、並びは、読み込んだ順)
//   戻り値: { ids, next_actions: { [issue の id]: 'YYYY-MM-DD' }, next_actions_error: 失敗の文章 | null }
export const fetchIssues = createAsyncThunk('bridge/fetchIssues', async ()=> {
    const ids = await sogh.asyncFetchIssueByViewer();

    const next_actions = {};
    let next_actions_error = null;

    try {
        const mine = assignedIssueIds(ids);
        const values = mine.length > 0 ? await fetchIssueDateValues(mine) : {};

        for (const id of mine) {
            const date = nextActionOf(values[id]);

            if (date)
                next_actions[id] = date;
        }
    } catch (e) {
        next_actions_error = e.message;
    }

    return { ids, next_actions, next_actions_error };
});

const bridgeSlice = createSlice({
    name: 'bridge',
    initialState: {
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
        issueIds: [],
        nextActions: {}, // Issue の id → NextAction の日付 ('YYYY-MM-DD')。日付の無い Issue は、入っていない
        nextActionsError: null, // 日付を読み込めなかったときの、失敗の文章
    },
    reducers: {},
    extraReducers: (builder)=> {
        builder
            .addCase(fetchIssues.pending, (state)=> {
                state.status = 'loading';
            })
            .addCase(fetchIssues.fulfilled, (state, action)=> {
                state.status = 'succeeded';
                state.issueIds = action.payload.ids;
                state.nextActions = action.payload.next_actions;
                state.nextActionsError = action.payload.next_actions_error;
            })
            .addCase(fetchIssues.rejected, (state, action)=> {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default bridgeSlice.reducer;
