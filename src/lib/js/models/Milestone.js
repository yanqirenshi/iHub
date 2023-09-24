import GraphQLNode from './GraphQLNode.js';

// id
// number
// url
// title
// state
// dueOn
// description
// createdAt
// updatedAt
// closedAt
// issues	model

export default class Milestone extends GraphQLNode {
    // constructor (data) {
    //     super(data);
    // }
    title () {
        return this._core.title || null;
    }
    url () {
        return this._core.url || null;
    }
    number () {
        return this._core.number || null;
    }
    state () {
        return this._core.state || null;
    }
    description () {
        return this._core.description || null;
    }
    closedAt () {
        return this._core.closedAt || null;
    }
    dueOn () {
        return this._core.dueOn || null;
    }
}
