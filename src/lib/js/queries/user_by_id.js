import * as attr from './attributes.js';

const query = `{
  node(id: "@id") {
    ... on User {
      ${attr.user()}
    }
  }
}`;

export default query;
