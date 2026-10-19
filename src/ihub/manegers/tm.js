import IDENTIFIERS   from '../../data/tm/identifiers.json';
import ATTRIBUTES    from '../../data/tm/attributes.json';
import ENTITIES      from '../../data/tm/entities.json';
import RELATIONSHIPS from '../../data/tm/relationships.json';

// d3.ter に渡すデータ一式。
const TM = {
    identifiers:   IDENTIFIERS,
    attributes:    ATTRIBUTES,
    entities:      ENTITIES,
    relationships: RELATIONSHIPS,
};

export default TM;
