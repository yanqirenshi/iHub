import React from 'react';

export default function BodyHtml (props) {
    const comment = props.data;
    const html =  {__html: comment};

    return (
        <div className="sogh-markdown-body-html"
             dangerouslySetInnerHTML={html} >
        </div>
    );
}
