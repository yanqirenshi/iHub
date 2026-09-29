import {INDEX_WP_TYPE} from './WBS.js';

import SITEMAP_DATA_NODES from './SITEMAP_DATA/SITEMAP_DATA_NODES.js';
import SITEMAP_DATA_EDGES from './SITEMAP_DATA/SITEMAP_DATA_EDGES.js';

const screens = Object.values(SITEMAP_DATA_NODES);

const DATA = {
    nodes: screens,
    edges: SITEMAP_DATA_EDGES,
};

export default DATA;
