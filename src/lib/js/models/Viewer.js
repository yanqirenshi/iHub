import GraphQLNode from './GraphQLNode.js';

export default class Viewer extends GraphQLNode {
    // constructor (data) {
    //     super(data);
    // }
    login () {
        return this._core.login || null;
    }
    name () {
        return this._core.name || null;
    }
    url () {
        return this._core.url || null;
    }
}
