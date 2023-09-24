import * as attr from './attributes.js';

const query = `
{
  viewer {
    repositories(${attr.page_nation()}) {
      nodes {
        ${attr.repositories()}
        owner {
          ${attr.owner()}
        }
      }
      pageInfo {
        ${attr.page_info()}
      }
    }
  }
}
`;

export default query;
