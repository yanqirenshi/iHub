const query = `{
  repository(name: "@name", owner: "@owner") {
    id
    name
    url
    description
    descriptionHTML
    createdAt
    updatedAt
    pushedAt
    owner {
      id
      login
      resourcePath
    }
  }
}
`;

export default query;
