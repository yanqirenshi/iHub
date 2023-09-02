import CompCockpit from './components/Cockpit.js';
import { useRecoilValue } from "recoil";

import { GITHUB_AUTH } from '../../recoil/GITHUB.js';
import { ISSUES } from '../../recoil/PAGE_COCKPIT.js';

export default function Cockpit (props) {
    const window_size = props.window_size;

    const authed = useRecoilValue(GITHUB_AUTH);
    const issues = useRecoilValue(ISSUES(authed));

    return (
        <CompCockpit window_size={window_size}
                     x={issues}/>
    );
}
