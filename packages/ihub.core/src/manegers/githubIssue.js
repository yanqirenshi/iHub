// GitHub の Issue を作って、Project に足す。(ドックの「Issue の追加」。assemblies/ProjectItemForm.js)
// sogh には、Issue の作成・Project への追加・項目の設定がないため、GraphQL API を直接呼ぶ。

import sogh from './sogh.js';

// 日付の欄にする、Project の項目の名前の頭。(型が DATE のもの)
//   Plan.      … 予定の期間 (Plan.Start・Plan.End・Plan.From・Plan.To など。Project ごとに名前が違う)
//   NextAction. … 次にやることの日 (NextAction.Date)
// 実績 (Result.*) は、作るときには書かないので、出さない。
export const DATE_FIELD_PREFIXES = ['Plan.', 'NextAction.'];

// Issue を作るときに、日付の欄にする項目か。
export function isIssueDateField (field) {
    return !!field
        && field.dataType==='DATE'
        && typeof field.name==='string'
        && DATE_FIELD_PREFIXES.some(prefix=> field.name.startsWith(prefix));
}

const QUERY_PROJECT_REPOSITORY = `
query ($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 { repositories(first: 1) { nodes { id nameWithOwner } } }
  }
}`;

const QUERY_PROJECT_FIELDS = `
query ($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 { fields(first: 100) { nodes { ... on ProjectV2FieldCommon { id name dataType } } } }
  }
}`;

const QUERY_ASSIGNABLE_USERS = `
query ($repositoryId: ID!) {
  viewer { id login }
  node(id: $repositoryId) {
    ... on Repository { assignableUsers(first: 100) { nodes { id login name } } }
  }
}`;

const MUTATION_CREATE_ISSUE = `
mutation ($repositoryId: ID!, $title: String!, $body: String, $assigneeIds: [ID!]) {
  createIssue(input: { repositoryId: $repositoryId, title: $title, body: $body, assigneeIds: $assigneeIds }) {
    issue { id number url }
  }
}`;

const MUTATION_ADD_PROJECT_ITEM = `
mutation ($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
    item { id }
  }
}`;

const MUTATION_SET_DATE = `
mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $date: Date!) {
  updateProjectV2ItemFieldValue(input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { date: $date } }) {
    projectV2Item { id }
  }
}`;

async function graphql (query, variables) {
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

// Project に紐づいた先頭のリポジトリを、Issue の作成先にする。
// (GitHub の API に Project の Default repository の項目がないため)
export async function fetchProjectRepository (project_id) {
    const data = await graphql(QUERY_PROJECT_REPOSITORY, { projectId: project_id });

    return data?.node?.repositories?.nodes?.[0] || null;
}

// Project の項目のうち、Issue を作るときに日付を入れる項目。([{ id, name }]。並びは、Project の項目の順)
export async function fetchProjectDateFields (project_id) {
    const data = await graphql(QUERY_PROJECT_FIELDS, { projectId: project_id });

    return (data?.node?.fields?.nodes || [])
        .filter(isIssueDateField)
        .map(field=> ({ id: field.id, name: field.name }));
}

// 作成先のリポジトリで、担当にできる人と、ログイン中の自分。
//   { viewer: { id, login }, users: [{ id, login, name }] }
export async function fetchAssignableUsers (repository_id) {
    const data = await graphql(QUERY_ASSIGNABLE_USERS, { repositoryId: repository_id });

    return {
        viewer: data?.viewer || null,
        users: data?.node?.assignableUsers?.nodes || [],
    };
}

// 担当の初めの選び方。ログイン中の自分。(自分が担当にできないリポジトリなら、空)
export function defaultAssignees ({ viewer, users }) {
    return viewer ? users.filter(user=> user.id===viewer.id) : [];
}

// Issue を作り、Project に足し、日付を設定する。
//   assignee_ids … 担当にする人の id の配列。(空なら、担当なし)
//   dates        … [{ id (項目の id), name (項目の名前), value ('YYYY-MM-DD'。空のときは設定しない) }]
// 戻り値は、作った Issue ({ id, number, url })。
// Issue を作れたあとの失敗は、どの Issue かが分かるように、例外に次を付ける。
//   issue  … 作った Issue
//   stage  … 'project' (Project に足せなかった) | 'dates' (日付を設定できなかった項目がある)
//   failed … stage が 'dates' のとき、設定できなかった項目 ([{ name, message }])
// (日付の設定は、1 つが失敗しても、残りを続ける)
export async function createIssueInProject ({ project_id, repository_id, title, body, assignee_ids = [], dates = [] }) {
    const created = await graphql(MUTATION_CREATE_ISSUE, {
        repositoryId: repository_id,
        title,
        body,
        assigneeIds: assignee_ids,
    });

    const issue = created.createIssue.issue;

    let item_id;

    try {
        const added = await graphql(MUTATION_ADD_PROJECT_ITEM, { projectId: project_id, contentId: issue.id });

        item_id = added.addProjectV2ItemById.item.id;
    } catch (e) {
        e.issue = issue;
        e.stage = 'project';
        throw e;
    }

    const failed = [];

    for (const date of dates.filter(d=> d.value)) {
        try {
            await graphql(MUTATION_SET_DATE, { projectId: project_id, itemId: item_id, fieldId: date.id, date: date.value });
        } catch (e) {
            failed.push({ name: date.name, message: e.message });
        }
    }

    if (failed.length > 0) {
        const error = new Error(failed.map(f=> `${f.name}: ${f.message}`).join('\n'));

        error.issue = issue;
        error.stage = 'dates';
        error.failed = failed;

        throw error;
    }

    return issue;
}
