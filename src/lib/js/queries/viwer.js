import * as attr from './attributes.js';

const query = `{
  viewer {
    ${attr.user()}
  }
}`;

export default query;
