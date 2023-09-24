export default class GraphQLNode {
    constructor (data) {
        this._core = data;
    }
    core () {
        return this._core;
    }
    id () {
        return this._core.id || null;
    }
    createdAt () {
        return this._core.createdAt || null;
    }
    updatedAt () {
        return this._core.updatedAt || null;
    }
}
