const query = `{
  repository(name: "@name", owner: "@owner") {
    id
    label(name: "報告") {
      id
      name
      url
      createdAt
      updatedAt
      issues(after: "", first: 100) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          url
          title
          createdAt
          closedAt
          updatedAt
          number
          body
          bodyHTML
          projectCards(first: 1) {
            nodes {
              column {
                id
                name
                url
                project {
                  id
                  number
                  name
                  body
                  url
                  createdAt
                  updatedAt
                  closedAt
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export default query;
