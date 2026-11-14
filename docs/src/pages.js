// マニュアルのページ。
// 並び順が、サイドメニューと「前へ・次へ」の順になる。
// 本文は src/content/ の Markdown に書く。
import about           from './content/about.md?raw';
import setup           from './content/setup.md?raw';
import screens         from './content/screens.md?raw';
import data            from './content/data.md?raw';
import diagrams        from './content/diagrams.md?raw';
import wbs             from './content/wbs.md?raw';
import github          from './content/github.md?raw';
import structure       from './content/structure.md?raw';
import customize       from './content/customize.md?raw';
import build           from './content/build.md?raw';
import update          from './content/update.md?raw';
import migrate         from './content/migrate.md?raw';
import api             from './content/api.md?raw';
import troubleshooting from './content/troubleshooting.md?raw';

import { COMPONENT_SECTION } from './componentPages.js';

// セクションは、pages (ページの一覧) と、groups (小見出しごとのページの一覧) を持てる。
// サイドメニューには pages を並べる。groups は、そのセクションのページを開いたときに、本文の左に並べる。
// 「前へ・次へ」は、pages を先に、groups をそのあとにたどる。
export const SECTIONS = [
    {
        label: 'はじめに',
        pages: [
            { path: '/',      title: 'iHub とは',    content: about },
            { path: '/setup', title: '導入のしかた', content: setup },
        ],
    },
    {
        label: '使い方',
        pages: [
            { path: '/screens',  title: '画面の見方',      content: screens },
            { path: '/data',     title: 'データの管理',    content: data },
            { path: '/diagrams', title: '図の編集',        content: diagrams },
            { path: '/wbs',      title: 'WBS',             content: wbs },
            { path: '/github',   title: 'GitHub との連携', content: github },
        ],
    },
    {
        label: '開発者向け',
        pages: [
            { path: '/structure', title: 'フォルダ構成',   content: structure },
            { path: '/customize', title: 'カスタマイズ',   content: customize },
            { path: '/build',     title: 'ビルドと配信',   content: build },
            { path: '/update',    title: 'iHub の更新',    content: update },
            { path: '/migrate',   title: 'コピー版からの移行', content: migrate },
            { path: '/api',       title: 'API サーバー',   content: api },
        ],
    },
    COMPONENT_SECTION,
    {
        label: 'そのほか',
        pages: [
            { path: '/troubleshooting', title: '困ったとき', content: troubleshooting },
        ],
    },
];

export const PAGES = SECTIONS.flatMap(section=> [
    ...(section.pages || []),
    ...(section.groups || []).flatMap(group=> group.pages),
]);
