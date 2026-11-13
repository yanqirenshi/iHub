// GitHub の GraphQL API を、直接呼ぶ。(sogh に無い処理に使う。manegers/githubIssue.js・githubProject.js)
// エンドポイントとヘッダー (認証のトークン) は、sogh のものを使う。

import sogh from './sogh.js';

export async function graphql (query, variables) {
    const response = await fetch(sogh.endpoint(), {
        method: 'POST',
        headers: sogh.makeHeader(),
        body: JSON.stringify({ query, variables }),
    });

    const json = await response.json().catch(()=> null);

    if (!response.ok)
        throw new Error(json?.message || `HTTP ${response.status}`);

    if (json?.errors?.length)
        throw new Error(json.errors.map(e=> e.message).join('\n'));

    return json.data;
}
