import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API サーバー (server/) からデータを読み書きする。
// 起動時に GET /api/data で全データを読み込み、書き込んだあとは、そのコレクションだけを差し替える。
export const dataApi = createApi({
    reducerPath: 'dataApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (build)=> ({
        getData: build.query({
            query: ()=> 'data',
        }),
        // オブジェクトのコレクション (個人の設定など) を、JSON Merge Patch で部分的に書き換える。
        patchCollection: build.mutation({
            query: ({ name, patch })=> ({ url: name, method: 'PATCH', body: patch }),
            async onQueryStarted (arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: result } = await queryFulfilled;

                    dispatch(dataApi.util.updateQueryData('getData', undefined, draft=> {
                        draft.collections[result.name] = result.data;
                        draft.etags[result.name] = result.etag;
                    }));
                } catch (e) {
                    // 失敗は、呼び出した側で扱う。
                }
            },
        }),
    }),
});

export const { useGetDataQuery, usePatchCollectionMutation } = dataApi;

// 読み込んだ全データ ({ 'er/entities': [...], ... })。
// DataGate が読み込み終えてから描画する部品で使う。
export function useCollections () {
    return useGetDataQuery().data.collections;
}
