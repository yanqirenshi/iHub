import {Link as RrLink} from "react-router-dom";

export default function Link (props) {
    const href = props.href;
    const children = props.children;
    const wbs_id = props.wbs_id;

    if (wbs_id)
        return (
            <RrLink to={`/wbs/P${wbs_id}`}
                    style={{
                        color: 'rgba(0, 0, 0, 0.87)',
                        textDecorationStyle: 'dotted',
                        textDecorationColor: 'rgba(188, 188, 188, 0.88)',
                        textDecorationThickness: '0.05em',
                    }}>
              {wbs_id}
            </RrLink>
        );

    return (
        <RrLink to={href}
                style={{
                    color: 'rgba(0, 0, 0, 0.87)',
                    textDecorationStyle: 'dotted',
                    textDecorationColor: 'rgba(188, 188, 188, 0.88)',
                    textDecorationThickness: '0.05em',
                }}>
          {children}
        </RrLink>
    );
}
