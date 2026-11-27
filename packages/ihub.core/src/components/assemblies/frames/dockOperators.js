import React from 'react';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useDispatch } from 'react-redux';

import { Leaf } from '@yanqirenshi/manipulater';

import { useConfig } from '../../../config.js';
import { dockColor } from '../../../manegers/colors.js';
import { dockOperatorCode } from '../../../manegers/dockOperators.js';
import { dockOperatorAdded, dockOperatorRemoved } from '../../../redux/slices/operatorsSlice.js';

// タブ (やページ) の部品が、表示されている間だけ、ドックに丸を足す口。(0.12.0 から。yanqirenshi/iHub#242)
//
//   useDockOperator({
//       code:  'overview',                     // 丸の名前。(ドックの丸の code は 'ihub.core:overview' になる)
//       label: '要素の追加',                    // ツールチップの文
//       Icon:  AddIcon,                         // アイコンの部品 (MUI のアイコンなど)
//       leaf:  ({ root, close })=> <DockMenu root={root} items={[...]} onClose={close}/>,  // 丸を押したときの吹き出し
//   });
//
// - 部品が表示されたときに、ドックの右端に丸を足し、消えたとき (タブ・ページを離れたとき) に丸を消す。
//   丸の数が変わると、ドックは、丸を中央にそろえて並べ直す。(manegers/dockOperators.js)
// - 丸を押したときの吹き出しは、leaf が描く。(設定の operators.Leafs には、回さない)
//   root はドックの丸 (位置と大きさ)、close() は吹き出しを閉じる関数。leaf は、いつも最後に渡した関数を使う。
// - アイコンは、ここで描く。(設定の operators.labels.withIcons が知らない code でも出る)
// - 吹き出しを出したまま部品が消えたときは、選択も外す。
// - Frame の中 (ページの中) でだけ働く。Frame の外では、何もしない。

const DockOperatorsContext = React.createContext(null);

// Frame が持つ、足した丸の表。(code → { Icon, leaf })
// 部品 (関数) は Redux に入れられないので、ここに持ち、描く直前に差し込む。
export function useDockOperatorRegistry () {
    const [entries, setEntries] = React.useState(()=> new Map());

    const registry = React.useMemo(()=> ({
        register: (code, entry)=> setEntries(prev=> new Map(prev).set(code, entry)),
        unregister: (code)=> setEntries(prev=> {
            if (!prev.has(code))
                return prev;

            const next = new Map(prev);
            next.delete(code);
            return next;
        }),
    }), []);

    return [entries, registry];
}

export function DockOperatorsProvider ({ registry, children }) {
    return (
        <DockOperatorsContext.Provider value={registry}>
          {children}
        </DockOperatorsContext.Provider>
    );
}

export function useDockOperator ({ code, label, Icon, leaf }) {
    const registry = React.useContext(DockOperatorsContext);
    const dispatch = useDispatch();

    // 吹き出しは、いつも最後に渡した関数で描く。(部品の state を使えるように)
    const leaf_ref = React.useRef(leaf);
    leaf_ref.current = leaf;

    const dock_code = dockOperatorCode(code);

    React.useEffect(()=> {
        if (!registry)
            return undefined;

        registry.register(dock_code, { Icon, leaf: (props)=> leaf_ref.current(props) });
        dispatch(dockOperatorAdded({ code: dock_code, label }));

        return ()=> {
            dispatch(dockOperatorRemoved(dock_code));
            registry.unregister(dock_code);
        };
    }, [registry, dispatch, dock_code, label, Icon]);
}

// 足した丸のラベルを、アイコンを描く関数に置き換える。(Manipulater の Root は、label.type が 'function' のとき val() を描く)
// state に保存する前に、manegers/dockOperators.js の withoutDockIcons で元に戻す。
export function withDockIcons (operators, entries, theme_color) {
    if (entries.size===0)
        return operators;

    const active_color = theme_color
          ? `rgba(${theme_color.r}, ${theme_color.g}, ${theme_color.b}, 1.0)`
          : 'rgba(8, 156, 163, 1.0)';

    return {
        ...operators,
        list: operators.list.map(operator=> {
            const entry = entries.get(operator.code);
            const label = operator.label;

            if (!entry || !label || label.type!=='icon')
                return operator;

            const Icon = entry.Icon;
            const active = operator.code===operators.active;
            const sx = { fontSize: 44, color: active ? active_color : '#888' };

            return {
                ...operator,
                label: {
                    type: 'function',
                    code: label.code,
                    text: label.val,
                    dockIcon: true,
                    val: ()=> active
                        ? <Icon sx={sx}/>
                        : <Tooltip title={label.val}><Icon sx={sx}/></Tooltip>,
                },
            };
        }),
    };
}

// 足した丸を押したときの吹き出し。(entries に無い丸のときは null)
export function dockLeaf (entries, root, close) {
    const entry = entries.get(root.code);

    return entry ? entry.leaf({ root, close }) : null;
}

// ---- 吹き出しの部品 --------------------------------------------------------------------------------------------------

// 項目の高さと、吹き出しの大きさ
const MENU_ITEM_H = 44;
const MENU_W = 222;
const MENU_PADDING = 8;
// ボタンと吹き出しの間隔
const BRANCH_H = 33;
// 画面の端からの余白
const MARGIN = 8;

// 吹き出しの位置。(丸の真上。画面の右端・左端からは、はみ出さない)
export function dockMenuPosition (root, size, window_width) {
    const w_center = root.position.x + (root.size.w / 2);

    const x = Math.min(Math.max(MARGIN, w_center - (size.w / 2)),
                       Math.max(MARGIN, window_width - size.w - MARGIN * 3));
    const y = Math.max(MARGIN, root.position.y - BRANCH_H - size.h);

    return { x, y };
}

// 項目を並べた、吹き出し。(押すと、onClick を呼ぶ)
//   root  … ドックの丸 (useDockOperator の leaf に渡る root)
//   items … [{ code, label, onClick }]
export function DockMenu ({ root, items }) {
    const { colors } = useConfig();
    const theme_color = React.useMemo(()=> dockColor(colors), [colors]);

    const size = { w: MENU_W, h: items.length * MENU_ITEM_H + MENU_PADDING * 2 };
    const { x, y } = dockMenuPosition(root, size, window.innerWidth);

    return (
        <Leaf x={x} y={y} w={size.w} h={size.h} theme_color={theme_color || undefined}>
          <Box component="ul" sx={{ m: 0, p: `${MENU_PADDING}px`, listStyle: 'none' }}>
            {items.map(item=> (
                <li key={item.code}>
                  <ButtonBase onClick={item.onClick}
                              sx={{ width: '100%', height: MENU_ITEM_H, px: 2, justifyContent: 'flex-start',
                                    borderRadius: '4px', '&:hover': { background: '#f0f0f0' } }}>
                    <Typography variant="body1">{item.label}</Typography>
                  </ButtonBase>
                </li>
            ))}
          </Box>
        </Leaf>
    );
}
