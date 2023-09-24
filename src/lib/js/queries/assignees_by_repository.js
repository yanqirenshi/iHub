const query = `{
  repository (owner: "@owner", name: "@name") {
    assignableUsers(after: "", first: 100) {
      nodes {
        id
        login
        name
        url
        email
        company
        createdAt
        updatedAt
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

export default query;
