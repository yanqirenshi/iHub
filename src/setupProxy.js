// 開発サーバー (npm start) にだけ組み込まれる処理。
// Create React App が起動時に読み込む。本番用のビルドには含まれない。
const fs = require('fs');
const path = require('path');

const ACCOUNT_MENUS_PATH = path.join(__dirname, 'data', 'ACCOUNT_MENUS.js');

const API_ACCOUNT_MENU_ACTIVE = '/__ihub/account-menu-pages/active';

function escapeRegExp (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readJson (req) {
    return new Promise((resolve, reject)=> {
        let body = '';

        req.setEncoding('utf8');
        req.on('data', chunk=> { body += chunk; });
        req.on('end', ()=> {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// ACCOUNT_MENUS.js の ACCOUNT_MENU_PAGES で、ページ (label) の中の項目 (code) の active を書き換える。
// 同じ code が複数のページにあるため、ページの範囲の中だけを書き換える。
function updateActive (src, page, code, active) {
    const pages_start = src.indexOf('export const ACCOUNT_MENU_PAGES = [');

    if (pages_start < 0)
        throw new Error('ACCOUNT_MENU_PAGES が見つかりません。');

    const page_re = new RegExp(`label: '${escapeRegExp(page)}',\\s*items: \\[[\\s\\S]*?\\n\\s*\\],`);
    const page_match = page_re.exec(src.slice(pages_start));

    if (!page_match)
        return null;

    const block_start = pages_start + page_match.index;
    const block = page_match[0];

    const item_re = new RegExp(`(\\{ code: '${escapeRegExp(code)}',\\s*active: )(true|false)( \\})`);

    if (!item_re.test(block))
        return null;

    const new_block = block.replace(item_re, `$1${active ? 'true' : 'false'}$3`);

    return src.slice(0, block_start) + new_block + src.slice(block_start + block.length);
}

module.exports = function (app) {
    app.post(API_ACCOUNT_MENU_ACTIVE, async (req, res)=> {
        try {
            const { page, code, active } = await readJson(req);

            if (typeof page!=='string' || typeof code!=='string' || typeof active!=='boolean')
                return res.status(400).json({ message: 'page (文字列)・code (文字列)・active (真偽値) を指定してください。' });

            const src = fs.readFileSync(ACCOUNT_MENUS_PATH, 'utf8');
            const new_src = updateActive(src, page, code, active);

            if (new_src===null)
                return res.status(404).json({ message: `項目が見つかりません。(page=${page}, code=${code})` });

            if (new_src!==src)
                fs.writeFileSync(ACCOUNT_MENUS_PATH, new_src, 'utf8');

            return res.json({ page, code, active, changed: new_src!==src });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    });
};
