import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

import Loading from '../panels/Loading.js';
import NotFoundWbsNodeData from '../../../wbs/NotFoundWbsNodeData.js';
import NotFoundWbsNodeComponent from '../../../wbs/NotFoundWbsNodeComponent.js';

import {INDEX_ID} from '../../../data/WBS.js';

// TODO: あと、ページ無いときの処理とかを入れる。
// https://qiita.com/kakken1988/items/9f14480c8a9f0abf7b3b#chunkloaderror-%E3%81%AE%E5%9B%9E%E9%81%BF%E7%AD%96
export default function WbsNode () {
    const {wbs_id} = useParams();

    const wbs_node = INDEX_ID[wbs_id];

    if (!wbs_node)
        return <NotFoundWbsNodeData/>;

    // データに ID があってもページのファイルが無い場合は NotFoundWbsNodeComponent を表示する。
    const Page = lazy(() => import(`../../../wbs/${wbs_node.type ? wbs_node.type + '/' : ''}P${wbs_id}.js`)
                      .catch(() => ({ default: NotFoundWbsNodeComponent })));

    return (
        <Suspense fallback={<Loading/>}>
          <Page wbs_node={wbs_node}/>
        </Suspense>
    );
}
