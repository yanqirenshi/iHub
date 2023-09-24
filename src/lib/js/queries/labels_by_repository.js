const query = `{
  repository (owner: "@owner", name: "@name") {
    labels(after: "", first: 100) {
      nodes {
        id
        name
        description
        url
        color
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
