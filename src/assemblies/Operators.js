import React from 'react';

import Root from './Operators/Root.js';
import Branch from './Operators/Branch.js';
import Leaf from './Operators/Leaf.js';

import operator from '../manegers/operator.js';

export default function Operators (props) {
    const actions     = props.actions;
    const operators   = props.operators;
    const window_size = props.window_size;
    const children    = props.children;

    React.useEffect(()=> {
        if (!window_size)
            return;

        if (!operators.initialized)
            actions.operator.change(
                operator.initialize(window_size, operators));
    }, [window_size]);

    if (!window_size) return null;

    const clickRoot = (code)=>
          actions.operator.change(operator.clickedRoot(code, operators));

    const selected_operator = operator.selectedOperator(operators);

    return (
        <>
          {selected_operator &&
           <>
             <Branch root={selected_operator}/>
             <Leaf   root={selected_operator}
                     contents={children}/>
           </>}

          {operators.list.map(operator=> {
              return (
                  <Root key={operator.code}
                        operator={operator}
                        active={operator.code===operators.active}
                        actions={actions}
                        onClick={clickRoot}/>
              );
          })}
        </>
    );
}
