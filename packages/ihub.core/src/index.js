// @yanqirenshi/ihub.core の入り口。
//
// アプリは、設定 (config) を組み立てて <IHub> に渡す。(設定の形は config.js、使い方は README.md)
//
//   import { IHub, pages } from '@yanqirenshi/ihub.core';
//
// <IHub> は、bulma と index.css (iHub の見た目) も読む。
// アプリの index.css は、<IHub> の import より後に読み込む。

// 画面全体と設定
export { default as IHub } from './IHub.js';
export { ConfigProvider, useConfig, resolveConfig, DEFAULT_CONFIG, clientHeaderName } from './config.js';
export { createStore } from './redux/store.js';

// 部品
export * as pages from './components/pages/index.js';
export * as docPages from './components/pages/docs/index.js';
export * as panels from './components/panels/index.js';
export * from './components/assemblies/index.js';   // Frame・FrameTabs・FrameWbsNode・FrameWbsNodeTabs・Link など
export * from './components/parts/index.js';        // ItemWbsNode・LinkWBS など
export * from './hooks/index.js';                   // usePageTabs
export * as manegers from './manegers/index.js';
export { wbs, useWbs, sogh } from './manegers/index.js';

// データ (API サーバーからの読み書き)
export {
    dataApi,
    useGetDataQuery,
    usePatchCollectionMutation,
    useAddRecordMutation,
    usePatchRecordMutation,
    useCollections,
    errorMessage,
} from './redux/api/dataApi.js';

// GitHub (Scrum)
export { fetchRepositories, fetchProjectsV2 } from './redux/slices/scrumSlice.js';
