import React from 'react';

import Frame from '../frames/Frame.js';

export default function UML () {
  return (
      <Frame>
        <div style={sx()}>UML</div>
      </Frame>
  );
}

function sx () {
    return {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '333px',
        background: '#eee',
        color: '#eaeaea',
    };
}
