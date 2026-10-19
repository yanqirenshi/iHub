import PROJECTS          from '../../data/wbs/projects.json';
import WBS               from '../../data/wbs/wbs.json';
import WORKPACKAGES_DATA from '../../data/wbs/workpackages.json';

// ワークパッケージには、読み込み時に _class を付ける。
const WORKPACKAGES = WORKPACKAGES_DATA.map(d=> ({ ...d, _class: 'WORKPACKAGE' }));

let i = 1000000000;

class Wbs {
    constructor (projects, wbs, workpackages) {
        this.data(this.initialData());
        this.build(projects, wbs, workpackages);
    }
    initialData () {
        return {
            projects: this.makePool(),
            wbs:      this.makePool(),
            wp:       this.makePool(),
            edges:    this.makePool(),
        };
    }
    ///// ////////////////////////////////////////////////////////////////
    ///// accessor
    ///// ////////////////////////////////////////////////////////////////
    data (v) {
        if (arguments.length===1)
            this._data = v;

        return this._data;
    }
    get (id) {
        const data = this.data();

        return data.projects.ht[id]
            || data.wbs.ht[id]
            || data.wp.ht[id]
            || null;
    }
    ///// ////////////////////////////////////////////////////////////////
    ///// Node
    ///// ////////////////////////////////////////////////////////////////
    data2project (data) {
        return {
            _id: data.id,
            _class: 'PROJECT',
            _core: data,
            label: data.name,
            name: data.name,
            description: data.description,
        };
    }
    data2wbs (data) {
        return {
            _id: data.id,
            _class: 'WBS',
            _core: data,
            label: data.name,
            name: data.name,
            description: data.description,
        };
    }
    data2workpackage (data) {
        return {
            _id: data.id,
            _class: 'WORKPACKAGE',
            _core: data,
            label: data.name,
            name: data.name,
            description: data.description,
        };
    }
    data2projects (pools, projects) {
        const f = (pool, d)=> {
            const project = this.data2project(d);

            if (!pool.ht[project._id]) {
                pool.ht[project._id] = project;
                pool.list.push(project);
            } else {
                ; //TODO
            }

            return pool;
        };

        projects.reduce(f, pools.projects);
    }
    ///// ////////////////////////////////////////////////////////////////
    ///// Edge
    ///// ////////////////////////////////////////////////////////////////
    makeEdge (from, to) {
        return {
            _id: i++,
            from_id: from._id,
            from_class: from._class,
            to_id: to._id,
            to_class: to._class,
        };
    }
    data2wbsAndEdge (pools, list) {
        const pool_projects = pools.projects;

        // WBS を Pool 化する
        const f = (pool, d)=> {
            const wbs = this.data2wbs(d);

            if (!pool.ht[wbs._id]) {
                pool.ht[wbs._id] = wbs;
                pool.list.push(wbs);
            } else {
                ; //TODO
            }

            return pool;
        };

        const pool_wbs = list.reduce(f, pools.wbs);

        // Edge を作る
        const f2 = (pool, d)=> {
            const parent = pool_projects.ht[d.parent] || pool_wbs.ht[d.parent];
            const child  = pool_wbs.ht[d.id];

            const edge = this.makeEdge(parent, child);

            pool.ht[edge._id] = edge;
            pool.list.push(edge);

            return pool;
        };

        const edges = list.reduce(f2, pools.edges);

        return {
            nodes: pool_wbs,
            edges: edges,
        };
    }
    data2WorkpackageAndEdge (pools, list) {
        // Workpackage を Pool 化する
        const f = (pool, d)=> {
            const wbs = this.data2workpackage(d);

            if (!pool.ht[wbs._id]) {
                pool.ht[wbs._id] = wbs;
                pool.list.push(wbs);
            } else {
                ; //TODO
            }

            return pool;
        };

        pools.wp = list.reduce(f, { ht: {}, list: [] });

        // Edge を作る
        const f2 = (pool, d)=> {
            const parent = pools.wbs.ht[d.parent];
            const child  = pools.wp.ht[d.id];

            const edge = this.makeEdge(parent, child);

            pool.ht[edge._id] = edge;
            pool.list.push(edge);

            return pool;
        };

        list.reduce(f2, pools.edges);
    }
    ///// ////////////////////////////////////////////////////////////////
    ///// Main
    ///// ////////////////////////////////////////////////////////////////
    makePool () {
        return { ht: {}, list: [] };
    }
    build (projects, wbs, workpackages) {
        const pools = this.data(this.initialData());

        this.data2projects(pools, projects);
        this.data2wbsAndEdge(pools, wbs);
        this.data2WorkpackageAndEdge(pools, workpackages);
    }
}

// プロジェクト・WBS・ワークパッケージを、id で引けるようにする。
// id は、ノードの種類をまたいで一意にする。
const INDEX_ID = {};

for (const wbs_node of [...PROJECTS, ...WBS, ...WORKPACKAGES]) {
    if (INDEX_ID[wbs_node.id])
        throw new Error('Duplication WBS Node. id='+wbs_node.id);

    INDEX_ID[wbs_node.id] = wbs_node;
}

const wbs = new Wbs(PROJECTS, WBS, WORKPACKAGES);

export default wbs;

export {
    INDEX_ID,
};
