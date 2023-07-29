import DATA_PROJECTS from './WBS/PROJECTS.js';
import DATA_WBS from './WBS/WBS.js';
import DATA_WORKPACKAGES from './WBS/WORKPACKAGES.js';

/* **************************************************************** *
 * Node
 * **************************************************************** */

function data2project (data) {
    return {
        _id: data.id,
        _class: 'PROJECT',
        _core: data,
        label: data.name,
        name: data.name,
        description: data.description,
    };
}

function data2wbs (data) {
    return {
        _id: data.id,
        _class: 'WBS',
        _core: data,
        label: data.name,
        name: data.name,
        description: data.description,
    };
}

function data2workpackage (data) {
    return {
        _id: data.id,
        _class: 'WORKPACKAGE',
        _core: data,
        label: data.name,
        name: data.name,
        description: data.description,
    };
}

function data2projects (pools) {
    const f = (pool, d)=> {
        const project = data2project(d);

        if (!pool.ht[project._id]) {
            pool.ht[project._id] = project;
            pool.list.push(project);
        } else {
            ; //TODO
        }

        return pool;
    };

    DATA_PROJECTS.reduce(f, pools.projects);
 }

/* **************************************************************** *
 * Edge
 * **************************************************************** */
let i = 1000000000;

function makeEdge (from, to) {
    return {
        _id: i++,
        from_id: from._id,
        from_class: from._class,
        to_id: to._id,
        to_class: to._class,
    };
}

function data2wbsAndEdge (pools, list) {
    const pool_projects = pools.projects;

    // WBS を Pool 化する
    const f = (pool, d)=> {
        const wbs = data2wbs(d);

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

        const edge = makeEdge(parent, child);

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

function data2WorkpackageAndEdge (pools, list) {
    // Workpackage を Pool 化する
    const f = (pool, d)=> {
        const wbs = data2workpackage(d);

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

        const edge = makeEdge(parent, child);

        pool.ht[edge._id] = edge;
        pool.list.push(edge);

        return pool;
    };

    list.reduce(f2, pools.edges);
}


/* **************************************************************** *
 * Edge
 * **************************************************************** */

function build () {
    const pools = {
        projects: { ht: {}, list: [] },
        wbs: { ht: {}, list: [] },
        wp: { ht: {}, list: [] },
        edges: { ht: {}, list: [] },
    };

    data2projects(pools);
    data2wbsAndEdge(pools, DATA_WBS);
    data2WorkpackageAndEdge(pools, DATA_WORKPACKAGES);

    return pools;
}

const WBS = build();

export default WBS;
