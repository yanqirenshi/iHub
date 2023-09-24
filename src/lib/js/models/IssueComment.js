import GraphQLNode from './GraphQLNode.js';

export default class IssueComment extends GraphQLNode {
    // constructor (data) {
    //     super(data);
    // }
    body () {
        return this._core.body || null;
    }
    bodyHTML () {
        return this._core.bodyHTML || null;
    }
    url () {
        return this._core.url || null;
    }
    publishedAt () {
        return this._core.publishedAt || null;
    }
    author () {
        return this._core.author || null;
    }
}
