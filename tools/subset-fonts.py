#!/usr/bin/env python3
"""使う文字とかな全部にフォントを絞る。 python3 tools/subset-fonts.py <google/fontsのoflフォルダ>"""
import glob, subprocess, sys
src = sys.argv[1]
text = ''.join(open(f, encoding='utf8').read() for f in glob.glob('js/*.js') + ['index.html', 'tools/make-cards.py'])
text += ''.join(chr(c) for c in list(range(0x20, 0x7f)) + list(range(0x3041, 0x3097)) + list(range(0x30a1, 0x30fb)))
text += 'ー、。！？「」『』・¥−★☆●○'
open('/tmp/ganpukudo-chars.txt', 'w', encoding='utf8').write(''.join(sorted(set(text))))
for out, path in (('dela', 'delagothicone/DelaGothicOne-Regular.ttf'), ('shippori', 'shipporiantique/ShipporiAntique-Regular.ttf')):
    subprocess.run(['pyftsubset', f'{src}/{path}', '--text-file=/tmp/ganpukudo-chars.txt', '--flavor=woff', '--layout-features=*', f'--output-file=fonts/{out}.woff'], check=True)
