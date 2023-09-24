import GraphQLNode from './GraphQLNode.js';

export default class Repository extends GraphQLNode {
    name () {
        return this._core.name || null;
    }
    url () {
        return this._core.url || null;
    }
    description () {
        return this._core.description || null;
    }
    descriptionHTML () {
        return this._core.descriptionHTML || null;
    }
    owner () {
        return this._core.owner || null;
    }
    pushedAt () {
        return this._core.pushedAt || null;
    }
}
