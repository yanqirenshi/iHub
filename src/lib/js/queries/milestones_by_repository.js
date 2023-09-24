const query = `{
  repository (owner: "@owner", name: "@name") {
    milestones(after: "", first: 100, states: OPEN) {
      nodes {
        id
        url
        number
        title
        dueOn
        state
        description
        createdAt
        updatedAt
        closedAt
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

export default query;
