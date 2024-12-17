import {Link as RrLink} from "react-router-dom";

import wbs from '../manegers/wbs.js';

export default function ItemWbsNode (props) {
    const children = props.children;
    const wbs_id = props.wbs_id;

    const wbs_node = wbs.get(wbs_id);

    if (!wbs_node) return <>{children || wbs_id}</>;

    return (
        <>
          {wbs_node.name}

          &nbsp;(
          <RrLink to={`/wbs/P${wbs_id}`}
                  style={{
                      color: 'rgba(0, 0, 0, 0.87)',
                      textDecorationStyle: 'dotted',
                      textDecorationColor: 'rgba(188, 188, 188, 0.88)',
                      textDecorationThickness: '0.05em',
                  }}>
            {wbs_id}
          </RrLink>
          )
        </>
    );
}
