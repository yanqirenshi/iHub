const query = `{
  repository(name: "@name", owner: "@owner") {
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
    }
  }
}
`;

export default query;
