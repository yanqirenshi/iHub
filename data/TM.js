import IDENTIFIERS from './TM/IDENTIFIERS.js';
import ATTRIBUTES from './TM/ATTRIBUTES.js';

// identifiers: 10,000
// attributes:  20,000
// entities:    30,000
// entity identifiers: 40,000
// entity attributes:  50,000

const TM = {
    identifiers: IDENTIFIERS,
    attributes:  ATTRIBUTES,
    entities:    [
        {
            id: 30000,
            type: 'RESOURCE',
            name: 'Firebase Auth',
            description: 'User',
            position: { x:-300, y:-100, z:0 },
            size: { w: 0, h: 0 },
            identifiers: [
                { id: 100, identifier: 10000 }
            ],
            attributes:  [],
        },
        {
            id: 30001,
            type: 'RESOURCE',
            name: 'Firebase Auth Provider',
            description: 'User',
            position: { x:-300, y:100, z:0 },
            size: { w: 0, h: 0 },
            identifiers: [
                { id: 103, identifier: 10001 }
            ],
            attributes:  [
                { id: 400, attribute: 20000},
            ],
        },
        {
            id: 30002,
            type: 'EVENT',
            name: 'Firebase Auth Provider 認証',
            // credentials
            description: '',
            position: { x:100, y:-100, z:0 },
            size: { w: 0, h: 0 },
            identifiers: [
                { id: 101, identifier: 10000 },
                { id: 102, identifier: 10001 },
            ],
            attributes:  [
                { id: 300, attribute: 20002},
                { id: 301, attribute: 20003},
            ],
        },
    ],
    relationships: [
        { id: 1, from: { id: 100, position: 270 }, to: { id: 101, position: 90 } },
        { id: 2, from: { id: 103, position: 270 }, to: { id: 102, position: 90 } },
    ],
};

export default TM;

export {
    IDENTIFIERS,
    ATTRIBUTES,
}
