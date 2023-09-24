const query = `{
  node(id: "@column-id") {
    id
    ... on ProjectColumn {
      id
      cards(after: "", first: 100) {
        edges {
          node {
            id
            note
            state
            isArchived
            content {
              ... on Issue {
                id
                url
                title
                updatedAt
                state
                number
                createdAt
                closedAt
                body
                labels(first: 10) {
                  nodes {
                    color
                    id
                    name
                    url
                  }
                }
                projectCards {
                  nodes {
                    id
                    url
                    note
                    state
                    column {
                      id
                      name
                      url
                      purpose
                      project {
                        id
                        number
                        name
                        body
                        createdAt
                        updatedAt
                        closedAt
                        url
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
                    login
                    name
                    id
                    url
                  }
                }
              }
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
