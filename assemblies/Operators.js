'use client';
import { useRecoilValue } from "recoil";
import { OPERATORS } from "../recoil/Provider.js";

import Box from '@mui/material/Box';

import Root from './Operators/Root.js';

export default function Operators (props) {
    const operators = props.operators;
    const window_size = props.window_size;

    if (!window_size) return null;

    const calculated_operators = calPositions(window_size.w, window_size.h, operators);

    return (
        <>
          {calculated_operators.map(operator=> {
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

    if (size===0) return [];

    // Root 間の Space は全部固定
    const s = 11;

    // operators width を計算する。
    const operators_width = operators.reduce((w, operator, i)=> {
        return w + operator.size.w;
    }, (size - 1) * s);

    // operators の 開始 x を計算する。
    let start_x = (w / 2) - (operators_width / 2);

    // operator 毎 の position を計算する。
    return operators.map(operator=> {
        const new_operator = JSON.parse(JSON.stringify(operator));

        // cal x
        new_operator.position.x = start_x;
        start_x += new_operator.size.w + s;

        // cal y
        new_operator.position.y = h - new_operator.size.h - s;

        return new_operator;
    });
}
