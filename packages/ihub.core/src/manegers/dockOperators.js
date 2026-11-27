// タブ (やページ) の部品が、表示されている間だけ、ドックに足す丸。(0.12.0 から。yanqirenshi/iHub#242)
//
// ドックの丸の一覧は、Redux の operators.list。(redux/slices/operatorsSlice.js。初めの丸は、設定の operators.items)
// ここは、丸を足す・消すときの、operators の作り直し方だけを持つ。(ただの関数。node --test で、そのまま確かめる)
// 部品から使う口は、components/assemblies/frames/dockOperators.js の useDockOperator。
//
// 丸の並べ直しは、@yanqirenshi/manipulater (0.1.0) がする。
// manipulater は、operators.initialized が偽のときに、丸の位置を計算し直す。(dist/js/operator.js の initialize・calRootPos)
// そのため、丸を足す・消すときは、initialized を偽にする。(丸の数で、画面の中央にそろえ直す)

// 足した丸の code の頭。(アプリの丸の code (a・b・c など) と重ならないように)
export const DOCK_OPERATOR_PREFIX = 'ihub.core:';

// ドックの丸の大きさと、枠の太さ。(アプリの丸と同じ。operatorsSlice.js の initialOperators)
const OPERATOR_SIZE = { w: 55, h: 55 };
const BORDER_WIDTH = 3;

// 部品が決めた code を、ドックの丸の code にする。(例: 'overview' → 'ihub.core:overview')
export function dockOperatorCode (code) {
    return `${DOCK_OPERATOR_PREFIX}${code}`;
}

// 足した丸か。
export function isDockOperatorCode (code) {
    return typeof code==='string' && code.startsWith(DOCK_OPERATOR_PREFIX);
}

// 丸を、右端に足す。(code はドックの丸の code。label はツールチップの文)
// 同じ code の丸があるときは、何もしない。(React の StrictMode で、2 度足されても 1 つにする)
export function addDockOperator (operators, { code, label }) {
    if (operators.list.some(o=> o.code===code))
        return operators;

    const operator = {
        code,
        label: { type: 'icon', code, val: label },
        size: { ...OPERATOR_SIZE },
        position: { x: null, y: null },
        border: { w: BORDER_WIDTH },
        branch: {},
    };

    return { ...operators, initialized: false, list: [...operators.list, operator] };
}

// 丸を消す。選んでいた (吹き出しを出していた) ときは、選択も外す。
// 無い code のときは、何もしない。
export function removeDockOperator (operators, code) {
    if (!operators.list.some(o=> o.code===code))
        return operators;

    return {
        ...operators,
        initialized: false,
        active: operators.active===code ? null : operators.active,
        list: operators.list.filter(o=> o.code!==code),
    };
}

// 選んでいる丸の吹き出しを閉じる。
export function closeDockOperator (operators) {
    return operators.active===null ? operators : { ...operators, active: null };
}

// 描く直前に差し込んだ、足した丸のアイコンを、元のラベルに戻す。(Redux の state には、部品を入れられないため)
// (components/assemblies/frames/dockOperators.js の withDockIcons の逆)
export function withoutDockIcons (operators) {
    return {
        ...operators,
        list: operators.list.map(operator=> {
            const label = operator.label;

            if (!label || !label.dockIcon)
                return operator;

            return { ...operator, label: { type: 'icon', code: label.code, val: label.text } };
        }),
    };
}
