const query = `{
  repository(name: "@name", owner: "@owner") {
    label(name: "@label_name") {
      issues(after: "", first: 100, states: OPEN) {
        nodes {
          id
          url
          title
          createdAt
          closedAt
          updatedAt
          number
          body
          projectCards(first: 1) {
            nodes {
              id
              url
              note
              state
              column {
                id
                name
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
          milestone {
            id
            url
            title
            state
            number
            dueOn
          }
          assignees(first: 10) {
            nodes {
              email
              id
              name
              login
              url
            }
          }
          labels(first: 10) {
            nodes {
              color
              id
              name
              url
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
}`;

export default query;
