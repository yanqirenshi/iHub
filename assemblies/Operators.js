'use client';
import * as React from 'react';
import Box from '@mui/material/Box';

import Root from './Operators/Root.js';

export default function Operators (props) {
    const operators = props.operators;

    // TODO: なんかエラーでるし、、、
    // https://zenn.dev/developanda/articles/daf34873fe4ef4
    if (!window) return null;

    calPositions(window.innerWidth, window.innerHeight, operators);

    return (
        <>
          {operators.map(operator=> {
              return (
                  <Root key={operator.code}
                        operator={operator}/>
              );
          })}
        </>
    );
}

//
//              window center
//                    :                    window height
//   |<------- operators width ------->|      |
//                    :                       |
//   +-----+       +-----+       +-----+      |
//   | R1  |<--s-->| R2  |<--s-->| R3  |      |
//   +-----+       +-----+       +-----+  -   |
//                    :                   |   |
//                    :                   s   |
//   |<--->|       |<--->|       |<--->|  |   |
//     w1            w2            w3     -   -
//
function calPositions (w, h, operators=[]) {
    const size = operators.length;

    if (size===0) return;

    // Root 間の Space は全部固定
    const s = 11;

    // operators width を計算する。
    const operators_width = operators.reduce((w, operator, i)=> {
        return w + operator.size.w;
    }, (size - 1) * s);

    // operators の 開始 x を計算する。
    let start_x = (w / 2) - (operators_width / 2);

    // operator 毎 の position を計算する。
    for (const operator of operators) {
        // cal x
        operator.position.x = start_x;
        start_x += operator.size.w + s;

        // cal y
        operator.position.y = h - operator.size.h - s;
    }
}
