import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import sogh from '../../manegers/sogh.js';

export const fetchIssues = createAsyncThunk('bridge/fetchIssues', ()=> {
    return sogh.asyncFetchIssueByViewer();
});

const bridgeSlice = createSlice({
    name: 'bridge',
    initialState: {
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
        issueIds: [],
    },
    reducers: {},
    extraReducers: (builder)=> {
        builder
            .addCase(fetchIssues.pending, (state)=> {
                state.status = 'loading';
            })
            .addCase(fetchIssues.fulfilled, (state, action)=> {
                state.status = 'succeeded';
                state.issueIds = action.payload;
            })
            .addCase(fetchIssues.rejected, (state, action)=> {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default bridgeSlice.reducer;
