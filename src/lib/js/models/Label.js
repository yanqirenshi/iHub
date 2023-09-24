import GraphQLNode from './GraphQLNode.js';

// id
// name
// url
// color
// description
// createdAt
// updatedAt

export default class Label extends GraphQLNode {
    // constructor (data) {
    //     super(data);
    // }
    color () {
        return this._core.color || null;
    }
    name () {
        return this._core.name || null;
    }
    url () {
        return this._core.url || null;
    }
    description () {
        return this._core.description || null;
    }
    fontColor (hexcolor) {
        var r = parseInt( hexcolor.substr( 1, 2 ), 16 ) ;
        var g = parseInt( hexcolor.substr( 3, 2 ), 16 ) ;
        var b = parseInt( hexcolor.substr( 5, 2 ), 16 ) ;

        const color = ( ( ( (r * 299) + (g * 587) + (b * 114) ) / 1000 ) < 128 ) ? "white" : "black" ;

        return color;
    }
}
