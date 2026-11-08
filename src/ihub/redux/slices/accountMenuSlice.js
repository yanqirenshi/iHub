import { createSlice } from '@reduxjs/toolkit';

import { PAGES } from '../../../config/ACCOUNT_MENUS.js';

// サイドメニューで強調する項目 (selected_item) は、ここには持たない。
// 今の URL から決まるものなので、Frame.js で useLocation() から導出する。(#6)
const accountMenuSlice = createSlice({
    name: 'accountMenu',
    initialState: {
        menu: {
            avater: { enterd: false, clicked: true },
            menu: { enterd: false },
            // 初めに開くページは、src/config/ACCOUNT_MENUS.js の先頭のページにする。
            // (アプリに合わせて、ページの名前 (label) を設定だけで変えられるようにするため)
            current_page: PAGES[0]?.label,
            pages: PAGES,
        },
        isOpend: false,
    },
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
