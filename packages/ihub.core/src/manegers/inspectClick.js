// インスペクタを開くクリックの判定。(0.11.0 から)
//
// 図の要素のインスペクタは、Ctrl + クリック (Mac は ⌘ + クリック) で開く。(0.10.x までの右クリックは、やめた)
//   - Windows・Linux は Ctrl、Mac は ⌘。(Mac の Ctrl + クリックは、OS が右クリックとして扱うので、使えない)
//   - 修飾キーの無いクリックでは、開かない。
//   - 右クリックでは、ブラウザの普通のメニューが出る。(d3.* に contextmenu のコールバックを渡さない)
//
// d3.* の click のコールバックは、どれも、最後の引数に DOM の click の MouseEvent を渡す。
//   d3.er・d3.ter: click(d, event)
//   d3.deployment・d3.sitemap・d3.unchi・d3.classes: click(core, node, event)
//   d3.yabane: events.*.click(d, event)
// なので、判定は、最後の引数の event だけを見る。
//
// 開くと決めたときは、event.preventDefault() を呼ぶ。
// (リンクを持つ要素 (画面遷移図のノードのリンクのアイコンなど) で、ブラウザがリンクを開くのを止めるため。d3.* の側では呼ばない)
// ihub.core の 7 つの図 (ER 図・TM・クラス図・システム構成図・画面遷移図・艦橋の Overview・Schedule) は、どれもこれを使う。

// インスペクタを開くクリックか。(Ctrl か ⌘ を押している)
export function isInspectClick (event) {
    return !!event && (event.ctrlKey===true || event.metaKey===true);
}

// d3.* の click のコールバックを作る。
//   open      … インスペクタを開くクリックのときに呼ぶ。(引数は、d3.* の click の引数のまま)
//   otherwise … それ以外のクリックのときに呼ぶ。(任意。Schedule の矢羽根の行き先など。無ければ、何もしない)
// 開くと決めたときは、open を呼ぶ前に、event.preventDefault() を呼ぶ。
export function inspectClick (open, otherwise = null) {
    return (...args)=> {
        const event = args[args.length - 1];

        if (isInspectClick(event)) {
            if (typeof event.preventDefault==='function')
                event.preventDefault();

            open(...args);
            return;
        }

        if (otherwise)
            otherwise(...args);
    };
}
