import moment from 'moment';

// import Column from './Column.js';
// import Label  from './Label.js';

import GraphQLNode from './GraphQLNode.js';

// id
// number
// name
// body
// url
// state
// closed
// progress
// createdAt
// updatedAt
// closedAt

export default class Project extends GraphQLNode {
    constructor (data) {
        super(data);

        this._type = null;
        this._priority = null;
        this._assignee = null;

        this._plan = null;
        this._result = null;

        this.addAnotetionValue(data);

        this._issues = [];

        // const priority = [
        //     { code: 'c', label: '急' },
        //     { code: 'h', label: '高' },
        //     { code: 'n', label: '普' },
        //     { code: 'l', label: '低' },
        // ];

        // const types = [
        //     { code: '障害',       order: 1 },
        //     { code: 'リリース',   order: 2 },
        //     { code: '案件',       order: 3 },
        //     { code: '問い合せ',   order: 4 },
        //     { code: 'クラッシュ', order: 5 },
        //     { code: '改善',       order: 6 },
        // ];
    }
    number () {
        return this._core.number || null;
    }
    name () {
        return this._core.name || null;
    }
    url () {
        return this._core.url || null;
    }
    state () {
        return this._core.state || null;
    }
    closedAt () {
        return this._core.closedAt || null;
    }
    closed () {
        return this._core.closed || null;
    }
    body () {
        return this._core.body || null;
    }
    progress () {
        return this._core.progress || null;
    }
    type () {
        return this._type || null;
    }
    priority () {
        return this._priority || null;
    }
    assignee () {
        return this._assignee || null;
    }
    plan () {
        return this._plan || null;
    }
    result () {
        return this._result || null;
    }
    issues () {
        return this._issues;
    }
    columns () {
        if (!this._core.columns)
            return [];

        return this._core.columns.nodes;
    }
    addAnotetionValue (project) {
        const priority = (p) => {
            const ret = /.*@Priority:\s+([c|h|n|l]).*/.exec(p.body);

            // Critical :  最高の優先度のユーザー・ジョブ。
            // High : 高い優先度のユーザー・ジョブ。
            // Normal : 通常の優先度のユーザー・ジョブ。
            // Low : 低い優先度のユーザー・ジョブ。

            if (!ret)
                return 'l';

            return ret[1];
        };

        const assignee = (p) => {
            const ret = /.*@assignee:\s+(\S+).*/.exec(p.body);

            return ret ? ret[1] : null;
        };

        const schedulePlan = (p) => {
            const ret = /.*@Plan:(\s+\d+-\d+-\d+),\s+(\d+-\d+-\d+).*/.exec(p.body);

            if (!ret)
                return { start: null, end: null };

            return { start: moment(ret[1]), end: moment(ret[2]) };
        };

        const scheduleResult = (p) => {
            const ret = /.*@Result:(\s+\d+-\d+-\d+),\s+(\d+-\d+-\d+).*/.exec(p.body);

            if (!ret)
                return { start: null, end: null };

            return { start: moment(ret[1]), end: moment(ret[2]) };
        };

        const type = (p) => {
            const ret = /.*@Type:\s+(\S+).*/.exec(p.body);

            return ret ? ret[1] : null;
        };

        this._type = type(project);
        this._priority = priority(project);
        this._assignee = assignee(project);

        this._plan = schedulePlan(project);
        this._result = scheduleResult(project);

        return project;
    }
    colorByPriority () {
        if (this.closed())
            return { background: 'none', color: '#333' };

        const priority = this.priority();

        const palette = {
            'c': { background: '#e83929', color: '#fff' },
            'h': { background: '#fcc800', color: '#333' },
            'n': { background: '#89c3eb', color: '#333' },
            'l': { background: '#dcdddd', color: '#333' },
            '?': { background: '#ffffff', color: '#333' },
        };

        return palette[priority];
    }
    priorityLabel () {
        const code = this.priority();

        const m = {
            c: '急',
            h: '高',
            n: '普',
            l: '低',
        };
        const label = m[code];
        if (!label)
            return '??';

        return label;
    }
}
