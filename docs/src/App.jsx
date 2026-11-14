import React, { useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';

import MarkdownPage from './components/MarkdownPage.jsx';
import { PAGES, SECTIONS } from './pages.js';

export default function App () {
    const location = useLocation();

    // 今のページがあるセクション。小見出し (groups) を持つときは、本文の左にその一覧を出す。
    const current = SECTIONS.find(section=> sectionPages(section).some(page=> page.path===location.pathname));

    // ページを移ったら、先頭から表示する。
    // (scrollTo は Promise を返すブラウザがあるので、戻り値を返さないように {} で囲む)
    useEffect(()=> {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="layout">
          <header className="header">
            <Link to="/">iHub マニュアル</Link>
          </header>

          <nav className="nav">
            {SECTIONS.map(section=> (
                <div key={section.label} className="nav-section">
                  <div className="nav-label">{section.label}</div>

                  {/* 小見出しのページを開いているあいだも、セクションの入口を選んだままにする。 */}
                  <NavLinks pages={section.pages}
                            active={section.groups && section===current ? section.pages[0].path : null}/>
                </div>
            ))}
          </nav>

          <main className="main">
            {current?.groups && <SubNav groups={current.groups}/>}

            <div className="main-body">
              <Routes>
                {PAGES.map((page, i)=> (
                    <Route key={page.path}
                           path={page.path}
                           element={<MarkdownPage page={page} prev={PAGES[i - 1]} next={PAGES[i + 1]}/>}/>
                ))}

                <Route path="*" element={<NotFound/>}/>
              </Routes>
            </div>
          </main>
        </div>
    );
}

function sectionPages (section) {
    return [
        ...(section.pages || []),
        ...(section.groups || []).flatMap(group=> group.pages),
    ];
}

// 本文の左に出す、小見出しごとのページの一覧。
function SubNav (props) {
    const { groups } = props;

    return (
        <nav className="subnav">
          {groups.map(group=> (
              <div key={group.label} className="nav-group">
                <div className="nav-group-label">{group.label}</div>
                <NavLinks pages={group.pages}/>
              </div>
          ))}
        </nav>
    );
}

function NavLinks (props) {
    const { pages = [], active = null } = props;

    return pages.map(page=> (
        <NavLink key={page.path}
                 to={page.path}
                 end
                 className={({ isActive })=> (isActive || page.path===active) ? 'nav-link active' : 'nav-link'}>
          {page.title}
        </NavLink>
    ));
}

function NotFound () {
    return (
        <article className="page">
          <h1>ページが見つかりません</h1>
          <p><Link to="/">iHub とは</Link> から読んでください。</p>
        </article>
    );
}
