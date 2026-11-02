#!/usr/bin/env python3
"""X共有カードと共有ページを作る。 python3 tools/make-cards.py
__PAGES_URL__ はデプロイ時に公開URLへ置き換わる。"""
import pathlib, re
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'js/data.js').read_text(encoding='utf8')
TITLES = re.findall(r"\{ id: '(\w+)', name: '([^']+)', line: '([^']+)'", src)
FONT = (ROOT / 'fonts').as_uri()
CSS = f"""
@font-face{{font-family:D;src:url({FONT}/dela.woff)}}@font-face{{font-family:S;src:url({FONT}/shippori.woff)}}
*{{margin:0;box-sizing:border-box}}body{{width:1200px;height:630px;background:#1b2a52;color:#e9e5d6;font-family:S;display:grid;grid-template-columns:330px 1fr;overflow:hidden}}
.n{{display:grid;grid-template-rows:repeat(3,1fr);gap:4px;background:#101a38;border-right:14px solid #6a3f21}}
.n span{{font-family:D;font-size:150px;display:grid;place-items:center;background:#17513f;line-height:1}}
.b{{padding:64px 60px;display:flex;flex-direction:column;justify-content:center;gap:22px}}
.k{{font-size:32px;color:#f4c542}}h1{{font-family:D;font-weight:400;font-size:84px;line-height:1.15}}.l{{font-size:34px}}
.s{{position:absolute;right:52px;bottom:40px;width:120px;height:120px;border:7px solid #d8321f;color:#d8321f;background:#e9e5d6;border-radius:50%;display:grid;place-items:center;font-family:D;font-size:34px;transform:rotate(9deg);writing-mode:vertical-rl}}
"""
PAGE = """<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><title>{name} | 眼福堂</title>
<meta name="description" content="{line}">
<meta property="og:type" content="website"><meta property="og:title" content="称号「{name}」| 眼福堂">
<meta property="og:description" content="{line} 算盤で値をつける古物商ゲーム。">
<meta property="og:image" content="__PAGES_URL__/share/{id}.png?v=1">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="称号「{name}」| 眼福堂">
<meta name="twitter:description" content="{line}"><meta name="twitter:image" content="__PAGES_URL__/share/{id}.png?v=1">
</head><body><p><a href="../">眼福堂を遊ぶ</a></p><script>location.replace('../');</script></body></html>
"""
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    for id_, name, line in TITLES:
        tmp = ROOT / 'tools/.card.html'
        tmp.write_text(f'<!doctype html><meta charset=utf-8><style>{CSS}</style><div class=n><span>眼</span><span>福</span><span>堂</span></div><div class=b><p class=k>五日間の商いの結果</p><h1>{name}</h1><p class=l>{line}</p></div><div class=s>眼福</div>', encoding='utf8')
        pg.goto(tmp.as_uri())
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(150)
        pg.screenshot(path=str(ROOT / f'share/{id_}.png'))
        (ROOT / f'share/{id_}.html').write_text(PAGE.format(id=id_, name=name, line=line), encoding='utf8')
        tmp.unlink()
    b.close()
print(len(TITLES), 'cards')
