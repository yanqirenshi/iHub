// サイドメニューの色。
// null のときは、@yanqirenshi/menubook の既定の色 (紫 { r: 157, g: 91, b: 139 } の背景に、白い文字) になる。
const ACCOUNT_MENU_COLORS = {
    // 背景の色。{ r, g, b } (0〜255) で書く。
    // 選択中の項目は白い背景になり、この色を文字の色に使う。
    // 例: { r: 3, g: 57, b: 115 }
    background: null,

    // 文字とアイコンの色。CSS の色 ('#2b2b2b' など) で書く。
    // 背景が明るくて、白い文字が読みにくいときにだけ決める。
    // 選択中の項目とページの一覧 (どちらも白い背景) の文字にも使うので、暗い色にする。
    // 決めると、アイコンを白く反転しなくなる。アイコンの色は、ICONS.js の SVG の fill で決まる。(無いときは黒)
    text: null,
};

export default ACCOUNT_MENU_COLORS;
