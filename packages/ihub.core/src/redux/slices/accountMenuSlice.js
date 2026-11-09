import { createSlice } from '@reduxjs/toolkit';

// サイドメニューの初期の状態。(pages は、設定の menus.pages)
// 初めに開くページは、pages の先頭のページにする。
// (アプリに合わせて、ページの名前 (label) を設定だけで変えられるようにするため)
export function initialAccountMenu (pages = []) {
    return {
        menu: {
            avater: { enterd: false, clicked: true },
            menu: { enterd: false },
            current_page: pages[0]?.label,
            pages,
        },
        isOpend: false,
    };
}

// サイドメニューで強調する項目 (selected_item) は、ここには持たない。
// 今の URL から決まるものなので、Frame.js で useLocation() から導出する。(#6)
// 初期の状態は、createStore が設定から渡す。(preloadedState)
const accountMenuSlice = createSlice({
    name: 'accountMenu',
    initialState: initialAccountMenu(),
    reducers: {
        menuChanged (state, action) {
            state.menu = action.payload;
        },
        menuOpened (state) {
            state.isOpend = true;
        },
        menuClosed (state) {
            state.isOpend = false;
        },
        // 個人の設定 (on/off) を反映したページに差し替える。
        menuPagesChanged (state, action) {
            state.menu.pages = action.payload;
        },
    },
});

export const { menuChanged, menuOpened, menuClosed, menuPagesChanged } = accountMenuSlice.actions;
export default accountMenuSlice.reducer;
