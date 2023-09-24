import GraphQLNode from './GraphQLNode.js';

export default class ProjectNextItem extends GraphQLNode {
    // constructor (data) { super(data); }
    title () {
        return this._core.title || null;
    }
    isArchived () {
        return this._core.isArchived || null;
    }
    type () {
        return this._core.type || null;
    }
    content () {
        return this._core.content || null;
    }
    fieldValues () {
        return this._core.fieldValues.nodes || [];
    }
    getFieldValueByName(name) {
        return this.fieldValues().find(fv=> {
            return fv.field.name === name;
        });
    }
    status () {
        const field_value = this.getFieldValueByName('Status');

        return field_value ? field_value.name : null;
    }
    dueDate () {
        return null;
    }
    nextActionDate () {
        return null;
    }
    plans () {
        return {};
    }
    resutls () {
        return {};
    }
    before () {
        return [];
    }
    after () {
        return [];
    }
}
