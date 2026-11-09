import { createTheme } from '@mui/material/styles';

// 設定の colors ({ base, main, sub, accent }。src/config/COLORS.js) を、部品ごとの形にする。
// 色が null のときは、その部品のこれまでの色のままにする。

// '#rrggbb' (または '#rgb') を { r, g, b } にする。
// 形が違うときは null を返す。(menubook・manipulater は { r, g, b } で色を受け取る)
export function rgbOf (color) {
    if (typeof color !== 'string')
        return null;

    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());

    if (!m)
        return null;

    const hex = m[1].length === 3
          ? m[1].split('').map(c=> c + c).join('')
          : m[1];

    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
}

// 決めてある色だけを取り出す。
function colorOf (colors, name) {
    return rgbOf(colors?.[name]) ? colors[name].trim() : null;
}

// 地の色・主の色・補助の色・差し色。(決めていないときは null)
export const baseColor   = (colors)=> colorOf(colors, 'base');
export const mainColor   = (colors)=> colorOf(colors, 'main');
export const subColor    = (colors)=> colorOf(colors, 'sub');
export const accentColor = (colors)=> colorOf(colors, 'accent');

// ドックのボタンと吹き出しの色。({ r, g, b })
// null のときは、manipulater の既定の色 (青緑) になる。
export const dockColor = (colors)=> rgbOf(mainColor(colors));

// MUI のテーマ。決めてある色だけを入れる。
export function makeTheme (colors) {
    const BASE   = baseColor(colors);
    const MAIN   = mainColor(colors);
    const SUB    = subColor(colors);
    const ACCENT = accentColor(colors);

    return createTheme({
        palette: {
            ...(MAIN   && { primary:   { main: MAIN } }),
            ...(ACCENT && { secondary: { main: ACCENT } }),
            ...(BASE   && { background: { default: BASE } }),
            ...((MAIN || SUB) && {
                text: {
                    ...(MAIN && { primary: MAIN }),
                    ...(SUB  && { secondary: SUB }),
                },
            }),
            ...(SUB && { divider: SUB }),
        },
    });
}

// CSS の変数。src/ihub/index.css のクラス (theme-color など) が使う。
// 既定の値は src/ihub/index.css の :root にあり、決めてある色だけを上書きする。
export function cssVariables (colors) {
    const BASE   = baseColor(colors);
    const MAIN   = mainColor(colors);
    const SUB    = subColor(colors);
    const ACCENT = accentColor(colors);

    return {
        ...(BASE   && { '--ihub-color-base':   BASE }),
        ...(MAIN   && { '--ihub-color-main':   MAIN }),
        ...(SUB    && { '--ihub-color-sub':    SUB }),
        ...(ACCENT && { '--ihub-color-accent': ACCENT }),
    };
}

// MUI の GlobalStyles に渡すスタイル。
// CSS の変数を :root に置き、地の色を決めてあるときは画面の背景にする。
export function globalStyles (colors) {
    const BASE = baseColor(colors);

    return {
        ':root': cssVariables(colors),
        ...(BASE && { body: { backgroundColor: BASE } }),
    };
}
