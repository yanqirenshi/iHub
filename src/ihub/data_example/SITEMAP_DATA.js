import {INDEX_WP_TYPE} from './WBS.js';

import SITEMAP_DATA_NODES from './SITEMAP_DATA/SITEMAP_DATA_NODES.js';
import SITEMAP_DATA_EDGES from './SITEMAP_DATA/SITEMAP_DATA_EDGES.js';

const screens = INDEX_WP_TYPE['screen'].reduce((list, wbs_node)=> {
    const node = SITEMAP_DATA_NODES[wbs_node.id];

    if (!node)
        return list;

    node.label.contents = wbs_node.name;

    node.link.url = `/wbs/${node.id}`;

    list.push(node);

    return list;
}, []);


const DATA = {
    nodes: screens,
    edges: SITEMAP_DATA_EDGES,
};

export default DATA;
