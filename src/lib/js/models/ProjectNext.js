import GraphQLNode from './GraphQLNode.js';

export default class ProjectNext extends GraphQLNode {
    // constructor (data) { super(data); }
    number () {
        return this._core.number || null;
    }
    title () {
        return this._core.title || null;
    }
    url () {
        return this._core.url || null;
    }
    fields () {
        return this._core.fields.nodes || [];
    }
}
