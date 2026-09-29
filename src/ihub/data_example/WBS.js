import PROJECTS from './WBS/PROJECTS.js';
import WBS from './WBS/WBS.js';
import WORKPACKAGES from './WBS/WORKPACKAGES.js';

const INDEX_ID  = {};
const INDEX_WP_ID  = {};
const INDEX_WP_TYPE  = {};

const all = [
    ...PROJECTS,
    ...WBS,
    ...WORKPACKAGES,
];

for (const wbs_node of all) {
    if (INDEX_ID[wbs_node.id])
        throw new Error('Duplication WBS Node. id='+wbs_node.id);

    INDEX_ID[wbs_node.id] = wbs_node;

    if (wbs_node._class==="WORKPACKAGE") {
        // INDEX_WP_ID
        INDEX_WP_ID[wbs_node.id] = wbs_node;

        // INDEX_WP_TYPE
        const type = wbs_node.type || null;
        if (!INDEX_WP_TYPE[type])
            INDEX_WP_TYPE[type] = [];

        INDEX_WP_TYPE[type].push(wbs_node);
    }
}

const WBS_DATA = {
    projects:     PROJECTS,
    wbs:          WBS,
    workpackages: WORKPACKAGES,
    edges:        null,
};

export {
    PROJECTS,
    WBS,
    WORKPACKAGES,
    //
    WBS_DATA,
    INDEX_ID,
    INDEX_WP_ID,
    INDEX_WP_TYPE,
}
