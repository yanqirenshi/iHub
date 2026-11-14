export { default as DesignAssemblies } from './design/Assemblies.js';
export { default as DesignEvents     } from './design/Events.js';
export { default as DesignPanels     } from './design/Panels.js';
export { default as DesignParts      } from './design/Parts.js';
export { default as Classes        } from './Classes.js';
export { default as ER             } from './ER.js';
export { default as HelpEmpty      } from './HelpEmpty.js';
export { default as Loading        } from './Loading.js';
export { default as Procedures     } from './Procedures.js';
export { default as SystemDynamics } from './SystemDynamics.js';
export { default as TM             } from './TM.js';
export { default as Wbs            } from './Wbs.js';

export * as bridge from './bridge/index.js';
// 古い名前。panels.bridge のほうを使う。(同じもの)
export * as cockpit from './bridge/index.js';
export * as sogh from './sogh/index.js';
export * as systemic_design from './systemic_design/index.js';
