import * as util from '../libs/yutils/index.js';

class Operators {
    initialize (window_size, operators) {
        const new_operators = util.cp(operators);

        new_operators.initialized = util.ts();

        new_operators.list = operator.calRootPos(window_size.w, window_size.h, operators.list);

        return new_operators;
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
    calRootPos (w, h, operators=[]) {
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
            const new_operator = util.cp(operator);

            // cal x
            new_operator.position.x = start_x;
            start_x += new_operator.size.w + s;

            // cal y
            new_operator.position.y = h - new_operator.size.h - s;

            return new_operator;
        });
    }
    // +------------------+
    // | reaf             |
    // |  ............... |
    // |  ............... |
    // |  ............... |
    // +------------------+
    //         V branch
    //     +------+
    //     | Root |
    //     +------+
    calBranchPos () {
    }
    calReefPos () {
    }
    // ////////////////////////////////////////////////////////////////
    // Getter, Selector
    // ////////////////////////////////////////////////////////////////
    selectedOperator (operators) {
        const active = operators.active;

        if (active===null)
            return null;

        return operators.list.find(operator=> operator.code===active) || null;
    }
    // ////////////////////////////////////////////////////////////////
    // Update state
    // ////////////////////////////////////////////////////////////////
    clickedRoot (code, operators) {
        const new_operators = util.cp(operators);

        new_operators.active = new_operators.active===code ? null : code;

        return new_operators;
    }
}

const operator = new Operators();

export default operator;
