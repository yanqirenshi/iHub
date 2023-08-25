import * as recoil from 'recoil';

export {default as PAGE_BPMN} from './PAGE_BPMN.js';
export {default as PAGE_DDD} from './PAGE_DDD.js';
export {default as PAGE_SCREENS} from './PAGE_SCREENS.js';
export {default as PAGE_BUSINESS} from './PAGE_BUSINESS.js';
export {default as PAGE_CLASSES} from './PAGE_CLASSES.js';
export {default as PAGE_DATA} from './PAGE_DATA.js';
export {default as PAGE_DESIGN} from './PAGE_DESIGN.js';
export {default as PAGE_BATCHS} from './PAGE_BATCHS.js';
export {default as PAGE_SYSTEMS} from './PAGE_SYSTEMS.js';
export {default as PAGE_MESSAGES} from './PAGE_MESSAGES.js';
export {default as PAGE_DEVOPS} from './PAGE_DEVOPS.js';

export {default as ACCOUNT_MENU} from './ACCOUNT_MENU.js';
export {default as OPERATORS} from './OPERATORS.js';
export {default as PAGE_MARKETS} from './PAGE_MARKETS.js';

export const WINDOW = recoil.atom({
    key: "WINDOW",
    default: null,  // {w: num, h: num}
});

export const GITHUB = recoil.atom({
    key: "GITHUB",
    default: {
        user: {},
        repositories: { start: null, end: null, error: null },
        projectsv2: {
            by_user: {},
            by_id: {},
        },
        issues: {
        },
    },
});
