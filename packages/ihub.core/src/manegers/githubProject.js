// GitHub の Issue が入っている Project の、アイテムの項目の値を読む。
// (sogh の Issue の読み込み (issues_by_viwer) は、Project のアイテムとその項目の値を取らないため、GraphQL を直接呼ぶ)
//
// 艦橋の Cockpit タブの NextAction.Date (manegers/nextAction.js) で使う。
// Project の Plan.* (予定の期間) を読んで Issue を絞る (iHub#148) ときにも、同じ読み方を使える。(項目の名前の頭で選ぶ)

import { graphql } from './githubGraphql.js';

// nodes(ids:) に渡せる id の数の上限。
export const NODES_PER_QUERY = 100;

// 1 つの Issue が入っている Project の数・1 つのアイテムの項目の値の数の、読む上限。
const PROJECT_ITEMS = 20;
const FIELD_VALUES = 50;

const QUERY_ISSUE_DATE_VALUES = `
query ($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Issue {
      id
      projectItems(first: ${PROJECT_ITEMS}) {
        nodes {
          project { title }
          fieldValues(first: ${FIELD_VALUES}) {
            nodes {
              ... on ProjectV2ItemFieldDateValue {
                date
                field { ... on ProjectV2FieldCommon { name } }
              }
            }
          }
        }
      }
    }
  }
}`;

// Issue の id (GraphQL の node id) の配列から、各 Issue の Project のアイテムの、日付の項目の値を読む。
//   戻り値: { [issue の id]: [{ project (Project の名前), field (項目の名前), date ('YYYY-MM-DD') }] }
//   Issue の数だけは呼ばず、100 件ずつ、まとめて呼ぶ。(Project に入っていない Issue は、空の配列)
//   読めなかったときは、例外。(一部だけ読めた結果は返さない)
export async function fetchIssueDateValues (issue_ids) {
    const chunks = [];

    for (let i = 0; i < issue_ids.length; i += NODES_PER_QUERY)
        chunks.push(issue_ids.slice(i, i + NODES_PER_QUERY));

    const results = await Promise.all(chunks.map(ids=> graphql(QUERY_ISSUE_DATE_VALUES, { ids })));

    const out = Object.fromEntries(issue_ids.map(id=> [id, []]));

    for (const data of results) {
        for (const node of data?.nodes || []) {
            // 見つからない id や、Issue でないものは、null や {} で返る。
            if (!node?.id)
                continue;

            out[node.id] = (node.projectItems?.nodes || []).flatMap(item=>
                (item?.fieldValues?.nodes || [])
                    .filter(value=> value?.date && value.field?.name)
                    .map(value=> ({ project: item.project?.title ?? null, field: value.field.name, date: value.date })));
        }
    }

    return out;
}

// 日付の項目の値 (fetchIssueDateValues の 1 つの Issue ぶん) のうち、項目の名前が prefix で始まるものを、日付の早い順に。
export function valuesByFieldPrefix (values, prefix) {
    return (values || [])
        .filter(value=> value.field.startsWith(prefix))
        .sort((a, b)=> a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}
