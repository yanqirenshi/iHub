export default class Matchmaker {
    constructor (sogh) {
        this.sogh = sogh;
    }
    repository (node) {
        if (node.owner)
            this.sogh.node2user(node.owner);
    }
    user (node) {
    }
}
