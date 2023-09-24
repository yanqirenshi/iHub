import * as attr from './attributes.js';

const query =`{
  node(id: "@id") {
    ... on ProjectNextItem {
      ${attr.project_next_item()}
      content {
        ... on DraftIssue {
          id
        }
        ... on Issue {
          ${attr.issue()}
        }
        ... on PullRequest {
          id
        }
      }
      fieldValues(first: 100) {
        nodes {
          ${attr.project_next_item_field_value()}
          projectField {
            ${attr.project_next_fields()}
          }
          creator {
            ... on User {
              ${attr.user()}
            }
          }
        }
      }
      creator {
        ... on User {
          ${attr.user()}
        }
      }
    }
  }
}`;

export default query;
