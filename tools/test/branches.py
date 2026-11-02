import sys, http.server, threading
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8124), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
errors = []
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 320, 'height': 568}, has_touch=True)
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.add_init_script("window.__opened=[];window.open=(u)=>{window.__opened.push(u)}")
    pg.goto('http://127.0.0.1:8124/index.html?seed=5')
    pg.click('[data-act=mute]'); print('mute', pg.inner_text('.mute'), pg.evaluate("localStorage.getItem('ganpukudo.muted')")); pg.click('[data-act=mute]')
    pg.click('[data-act=start]'); pg.wait_for_selector('.daycard'); pg.click('[data-act=next]')
    st = lambda: pg.evaluate("(()=>{const d=window.__ganpukudo.deal;return {pat:d.patience,looks:d.looks.length,status:d.status,floor:d.floor,ask:d.ask}})()")
    # 算盤: 五珠+1珠 = 6千 / 万の位2
    pg.click('.rod >> nth=3 >> .heaven .bead'); pg.click('.rod >> nth=3 >> .earth .bead >> nth=0'); pg.click('.rod >> nth=2 >> .earth .bead >> nth=1')
    print('abacus', pg.inner_text('.bid'))
    pg.click('.rod >> nth=2 >> .earth .bead >> nth=1'); print('abacus toggle', pg.inner_text('.bid'))
    pg.click('[data-act=set][data-v="0"]'); pg.click('[data-act=offer]'); print('zero note', pg.inner_text('.note'))
    # 3か所目
    for i in range(3): pg.click(f'.spot >> nth={i}')
    print('3 looks', st()); pg.screenshot(path=f'{OUT}/third.png')
    print('notes visible', pg.evaluate("(()=>{const n=document.querySelector('.scroller');return n.scrollTop>0})()"))
    # 値切って断られる→帰られる
    pg.evaluate("(()=>{const b=document.querySelector('[data-act=set]');b.dataset.v='1000';b.click()})()")
    pg.click('[data-act=offer]'); print('low offer', st(), pg.inner_text('.say'))
    while st()['status'] == 'open':
        pg.evaluate("(()=>{const b=document.querySelector('[data-act=set]');b.dataset.v='1000';b.click()})()")
        pg.click('[data-act=offer]')
    print('left', st()); pg.wait_for_timeout(1300)
    # 手持ち超え
    pg.evaluate("(()=>{const b=document.querySelector('[data-act=set]');b.dataset.v='5000000';b.click()})()")
    pg.click('[data-act=offer]'); print('over', pg.inner_text('.note'))
    # 隠居の大声で言い値が上がるseedを探す
    pg.goto('about:blank')
    heard = False
    for seed in range(1, 60):
        pg.goto(f'http://127.0.0.1:8124/index.html?seed={seed}'); pg.click('[data-act=start]'); pg.wait_for_selector('.daycard'); pg.click('[data-act=next]')
        v = pg.evaluate("window.__ganpukudo.deal.ask")
        pg.click('[data-act=appraisers]'); pg.click('[data-id=inkyo]')
        if pg.evaluate("!!window.__ganpukudo.deal.heard"):
            print('heard seed', seed, v, '->', st()['ask']); pg.screenshot(path=f'{OUT}/heard.png'); heard = True; break
    # 結果の共有
    pg.set_viewport_size({'width': 1100, 'height': 760})
    print('heard', heard)
    b.close()
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 800})
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.add_init_script("window.__opened=[];window.open=(u)=>{window.__opened.push(u)}")
    pg.goto('http://127.0.0.1:8124/index.html?seed=8'); pg.click('[data-act=start]'); pg.wait_for_selector('.daycard')
    for _ in range(400):
        if pg.query_selector('.receipt'): break
        for sel in ['[data-act=next]', '[data-act=auction]', '[data-act=nextday]', '[data-act=result]', '[data-act=pass]:not([disabled])']:
            el = pg.query_selector(sel)
            if el: el.click(); break
        pg.wait_for_timeout(30)
    pg.click('[data-act=share]'); print('share', pg.evaluate("window.__opened[0]"))
    pg.click('[data-act=again]'); print('again ok', bool(pg.query_selector('.noren')))
    b.close()
print('ERRORS', errors)
