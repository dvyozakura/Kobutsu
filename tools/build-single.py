#!/usr/bin/env python3
"""すぐ遊べる1ファイル版を作る。 python3 tools/build-single.py 出力先.html"""
import base64, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
js = ''
for n in ('data', 'game', 'art', 'audio', 'ui'):
    t = (R / f'js/{n}.js').read_text(encoding='utf8')
    t = re.sub(r"^import [\s\S]*?from '[^']+';\n", '', t, flags=re.M)
    t = re.sub(r'^export ', '', t, flags=re.M)
    js += t + '\n'
css = (R / 'css/style.css').read_text(encoding='utf8')
for f in ('dela', 'shippori'):
    b = base64.b64encode((R / f'fonts/{f}.woff').read_bytes()).decode()
    css = css.replace(f'../fonts/{f}.woff', f'data:font/woff;base64,{b}')
h = (R / 'index.html').read_text(encoding='utf8')
h = h.replace('<link rel="stylesheet" href="css/style.css">', '<style>' + css + '</style>')
h = h.replace('<script type="module" src="js/ui.js"></script>', '<script type="module">' + js.replace('</script', '<\\/script') + '</script>')
pathlib.Path(sys.argv[1]).write_text(h, encoding='utf8')
