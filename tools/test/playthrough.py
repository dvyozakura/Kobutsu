import asyncio, sys, http.server, threading, functools
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
h = functools.partial(http.server.SimpleHTTPRequestHandler, directory='.')
class Q(http.server.ThreadingHTTPServer): pass
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = Q(('127.0.0.1', 8123), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
errors = []
def play(pw, w, ht, name, seed, strategy):
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': w, 'height': ht}, has_touch=True)
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(f'http://127.0.0.1:8123/index.html?seed={seed}')
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/{name}-title.png')
    pg.click('[data-act=start]'); pg.wait_for_selector('.daycard')
    pg.screenshot(path=f'{OUT}/{name}-day.png')
    shots = 0; bigs = 0
    for _ in range(600):
        over = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
        if over > 0: errors.append(f'overflow {name} {over} ' + pg.evaluate("document.querySelector('main')?.className"))
        if pg.query_selector('.result'): break
        if pg.query_selector('.bighit'):
            if bigs == 0: pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/{name}-big.png')
            bigs += 1; pg.click('.bighit'); continue
        for sel in ['[data-act=next]', '[data-act=auction]', '[data-act=nextday]', '[data-act=result]']:
            el = pg.query_selector(sel)
            if el and el.is_enabled(): el.click(); break
        else:
            nx = pg.query_selector('[data-act=nextsale]')
            if nx and nx.is_visible():
                if shots == 1: pg.screenshot(path=f'{OUT}/{name}-sale.png')
                nx.click(); continue
            if pg.query_selector('.shop') and pg.query_selector('[data-act=offer]:not([disabled])'):
                st = pg.evaluate("(()=>{const g=window.__ganpukudo,d=g.deal;return {cash:g.cash,ask:d.ask,floor:d.floor,pat:d.patience,app:!!d.appraisal,looks:d.looks.length,value:d.item.value,slot:g.slot,boss:d.boss}})()")
                if st['looks'] == 0:
                    pg.click('.spot >> nth=0'); pg.click('.spot >> nth=1')
                    if shots == 0: pg.screenshot(path=f'{OUT}/{name}-shop.png')
                    if strategy != 'broke' and not st['app'] and st['cash'] > 2000:
                        pg.click('[data-act=appraisers]')
                        if shots == 0: pg.screenshot(path=f'{OUT}/{name}-sheet.png')
                        pg.click('[data-act=call][data-id=inkyo]')
                        pg.wait_for_timeout(50)
                        if shots == 0: pg.screenshot(path=f'{OUT}/{name}-appraised.png')
                    shots = 1
                    continue
                if strategy == 'broke': target = st['ask'] if st['ask'] <= st['cash'] else 0
                elif st['value'] > st['floor'] and st['floor'] <= st['cash']: target = st['floor']
                else: target = 0
                if target:
                    pg.evaluate(f"(()=>{{const b=document.querySelector('[data-act=set]');b.dataset.v='{target}';b.click()}})()")
                    pg.click('[data-act=offer]')
                    pg.wait_for_timeout(50)
                else:
                    pg.click('[data-act=pass]')
                continue
        pg.wait_for_timeout(60)
    pg.screenshot(path=f'{OUT}/{name}-result.png', full_page=True)
    print(name, pg.inner_text('.receipt h2') if pg.query_selector('.receipt') else 'NO RESULT', 'bighits', bigs)
    b.close()
with sync_playwright() as pw:
    play(pw, 375, 667, 'm375', 11, 'smart')
    play(pw, 320, 568, 'm320', 12, 'smart')
    play(pw, 1280, 800, 'pc', 13, 'smart')
    play(pw, 375, 667, 'broke', 21, 'broke')
print('ERRORS', len(errors), errors[:8])
