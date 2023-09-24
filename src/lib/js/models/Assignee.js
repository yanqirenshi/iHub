import GraphQLNode from './GraphQLNode.js';

export default class Assignee extends GraphQLNode {
    // constructor (data) {
    //     super(data);
    // }
    login () {
        return this._core.login || null;
    }
    name () {
        return this._core.name || null;
    }
    email () {
        return this._core.email || null;
    }
    url () {
        return this._core.url || null;
    }
    company () {
        return this._core.company || null;
    }
}
