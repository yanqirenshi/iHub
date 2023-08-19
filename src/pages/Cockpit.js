import React from 'react';
import { useRecoilValue } from 'recoil';
import * as atom from '../recoil/ATOMS.js';

import Frame from '../frames/Frame.js';
import Panel from '../panels/cockpit/index.js';

export default function Cockpit () {
    const window_size = useRecoilValue(atom.WINDOW);

    return (
        <Frame>
          <Panel window_size={window_size}/>
        </Frame>
    );
}
