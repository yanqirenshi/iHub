import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import sogh from '../../manegers/sogh.js';
import { fetchIssueDateValues } from '../../manegers/githubProject.js';
import { nextActionOf } from '../../manegers/nextAction.js';
import { planRangesOf } from '../../manegers/cockpitFilter.js';

// 自分が担当の Issue (Cockpit タブのカードになるもの) の id。
function assignedIssueIds (ids) {
    const viewer = sogh.viewer();
    const login = viewer ? viewer.login() : null;

    if (!login)
        return [];

    return ids.filter(id=> sogh.issue(id).assignees().find(ass=> ass.login===login));
}

// Issue を読んだあと、自分が担当の Issue の日付 (NextAction・Plan) を、まとめて 1 回で読む。(Issue の数だけは呼ばない)
// Cockpit タブに出す Issue を絞る (manegers/cockpitFilter.js) と、並べる (manegers/nextAction.js) のに使う。
// 日付の読み込みに失敗しても、Issue は、そのまま返す。(画面は、絞らず、読み込んだ順に出す)
//   戻り値: {
//     ids,
//     next_actions: { [issue の id]: 'YYYY-MM-DD' },
//     plans: { [issue の id]: [{ project, from, to }] }  … Plan の期間が入っている Project だけ
//     dates_error: 失敗の文章 | null
//   }
export const fetchIssues = createAsyncThunk('bridge/fetchIssues', async ()=> {
    const ids = await sogh.asyncFetchIssueByViewer();

    const next_actions = {};
    const plans = {};
    let dates_error = null;

    try {
        const mine = assignedIssueIds(ids);
        const values = mine.length > 0 ? await fetchIssueDateValues(mine) : {};

        for (const id of mine) {
            const date = nextActionOf(values[id]);
            const ranges = planRangesOf(values[id]);

            if (date)
                next_actions[id] = date;

            if (ranges.length > 0)
                plans[id] = ranges;
        }
    } catch (e) {
        dates_error = e.message;
    }

    return { ids, next_actions, plans, dates_error };
});

const bridgeSlice = createSlice({
    name: 'bridge',
    initialState: {
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
        issueIds: [],
        nextActions: {}, // Issue の id → NextAction の日付 ('YYYY-MM-DD')。日付の無い Issue は、入っていない
        plans: {}, // Issue の id → Plan の期間 [{ project, from, to }]。期間の無い Issue は、入っていない
        datesError: null, // 日付を読み込めなかったときの、失敗の文章
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
                state.plans = action.payload.plans;
                state.datesError = action.payload.dates_error;
            })
            .addCase(fetchIssues.rejected, (state, action)=> {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default bridgeSlice.reducer;
