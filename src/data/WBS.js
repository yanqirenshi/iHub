import PROJECTS from './WBS/PROJECTS.js';
import WBS from './WBS/WBS.js';
import WORKPACKAGES from './WBS/WORKPACKAGES.js';

function p () {
    const parent = {};

    const x = (d)=> {
        if (!parent[d.from])
            parent[d.from] = [];

        parent[d.from].push(d);

        return parent;
    };

    for (const d of PROJECTS) x(d);
    for (const d of WBS) x(d);
    for (const d of WORKPACKAGES) x(d);

    return parent;
}

const WBS_DATA = {
    projects:     PROJECTS,
    wbs:          WBS,
    workpackages: WORKPACKAGES,
    edges:        null,
    index: {
        parent: p(),
    },
};

const INDEX_WP  = WORKPACKAGES.ht;

export {
    PROJECTS,
    WBS,
    WORKPACKAGES,
    //
    WBS_DATA,
    INDEX_WP,
}
