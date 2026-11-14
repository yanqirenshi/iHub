import React, { useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';

import MarkdownPage from './components/MarkdownPage.jsx';
import { PAGES, SECTIONS } from './pages.js';

export default function App () {
    const location = useLocation();

    // 今のページがある小見出し。(コンポーネントの assemblies・panels など)
    // 小見出しのページを開いているときは、本文の左にその小見出しのページの一覧を出す。
    const currentGroup = SECTIONS
          .flatMap(section=> section.groups || [])
          .find(group=> group.pages.some(page=> page.path===location.pathname));

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

                  <NavLinks pages={section.pages}/>

                  {/* 小見出しは、その最初のページを開く。 */}
                  {(section.groups || []).map(group=> (
                      <Link key={group.label}
                            to={group.pages[0].path}
                            className={group===currentGroup ? 'nav-link nav-sublink active' : 'nav-link nav-sublink'}>
                        {group.label}
                      </Link>
                  ))}
                </div>
            ))}
          </nav>

          <main className="main">
            {currentGroup && <SubNav group={currentGroup}/>}

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

// 本文の左に出す、小見出しのページの一覧。
function SubNav (props) {
    const { group } = props;

    return (
        <nav className="subnav">
          <div className="nav-group-label">{group.label}</div>
          <NavLinks pages={group.pages}/>
        </nav>
    );
}

function NavLinks (props) {
    const { pages = [] } = props;

    return pages.map(page=> (
        <NavLink key={page.path} to={page.path} end className="nav-link">
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
