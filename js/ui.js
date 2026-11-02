import { CONFIG, GRADES, CATEGORIES, CUSTOMERS, APPRAISERS, APPRAISER_IDS, REACTIONS } from './data.js';
import {
  createGame, nextCustomer, look, canLook, looksLeft, offer, pass, callAppraiser, canCall,
  settleDay, finalResult, dayDone, rentFor, yen,
} from './game.js';
import { itemSVG, portraitSVG } from './art.js';
import { sound } from './audio.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const BEST_KEY = 'ganpukudo.best';
const RODS = [1000000, 100000, 10000, 1000];
const ROD_NAMES = ['百万', '十万', '万', '千'];

let g = null;
let bid = 0;
let focusSpot = null;
let note = '';

const wait = (ms) => new Promise((r) => { setTimeout(r, reduced() ? Math.min(ms, 60) : ms); });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function readBest() { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } }
function saveBest(n) { try { if (n > readBest()) localStorage.setItem(BEST_KEY, String(n)); } catch { /* 保存できなくても遊べる */ } }

const muteButton = () => `<button class="mute" data-act="mute" aria-pressed="${sound.muted}" aria-label="音を${sound.muted ? '出す' : '消す'}">${sound.muted ? '音なし' : '音あり'}</button>`;

function title() {
  sound.music(null);
  const best = readBest();
  app.innerHTML = `<main class="title">
    <div class="noren" aria-hidden="true"><span>眼</span><span>福</span><span>堂</span></div>
    <h1 class="sr">眼福堂</h1>
    <div class="title-body">
      <p class="lead">持ち込まれた品に算盤で値をつけ、市で本当の値段を知る古物商の五日間。</p>
      <ul class="howto">
        <li>品の気になる所を見て、本物かを読む</li>
        <li>迷ったら鑑定人を呼ぶ。ただし聞かれたら値が上がる</li>
        <li>日暮れの市で売り、店賃を払えれば翌日へ</li>
      </ul>
      <button class="primary" data-act="start">暖簾を上げる</button>
      ${best ? `<p class="best">これまでの最高 ${yen(best)}</p>` : ''}
    </div>${muteButton()}</main>`;
}

function start() {
  const seed = params.has('seed') ? Number(params.get('seed')) : undefined;
  g = createGame(seed);
  window.__ganpukudo = g;
  document.body.classList.add('in-game');
  sound.unlock();
  dayOpen();
}

function dayOpen() {
  sound.music('shop');
  const sp = CATEGORIES[g.specialty].label;
  app.innerHTML = `<main class="daycard">
    <p class="dayno">${g.day}日目</p>
    <dl class="dayfacts">
      <div><dt>手持ち</dt><dd>${yen(g.cash)}</dd></div>
      <div><dt>今夜の店賃</dt><dd>${yen(rentFor(g.day))}</dd></div>
      <div><dt>土橋先生の専門</dt><dd>${sp}</dd></div>
    </dl>
    ${g.day === CONFIG.days ? '<p class="warn">今日の最後に、大物が来るらしい。手持ちを残しておくこと。</p>' : ''}
    <button class="primary" data-act="next">店を開ける</button>
  </main>`;
}

function nextDeal() {
  nextCustomer(g);
  bid = 0; focusSpot = null; note = '';
  shop();
  sound.bell();
}

function pips(n, max, on = '●', off = '○') { return on.repeat(Math.max(0, n)) + off.repeat(Math.max(0, max - n)); }

function shop() {
  const d = g.deal;
  const c = CUSTOMERS[d.customerId];
  const spotDefs = CATEGORIES[d.item.cat].spots;
  const spotButtons = spotDefs.map((sp, i) => {
    const seen = d.looks.includes(i);
    const can = canLook(g, i);
    return `<button class="spot ${seen ? 'seen' : ''} ${focusSpot === i ? 'on' : ''}" style="left:${sp.x}%;top:${sp.y}%" data-act="look" data-i="${i}" ${!seen && !can ? 'disabled' : ''} aria-label="${sp.name}を見る"><span>${sp.name}</span></button>`;
  }).join('');
  const clues = d.looks.map((i) => `<li class="${focusSpot === i ? 'latest' : ''}"><b>${spotDefs[i].name}</b>${esc(d.item.spots[i].clue)}</li>`).join('');
  const left = looksLeft(g);
  const a = d.appraisal;
  const lens = focusSpot != null
    ? `<div class="lens">${itemSVG(d.item, d.item.spots, { spotPos: spotDefs, focus: focusSpot, label: `${spotDefs[focusSpot].name}の拡大` })}</div>` : '';
  app.innerHTML = `<main class="shop">
    <header class="bar">
      <span class="when">${g.day}日目 ${g.slot}/${CONFIG.customersPerDay}人</span>
      <span class="money" aria-label="手持ち">${yen(g.cash)}</span>
      <span class="rep" aria-label="信用 ${g.rep}">信用 ${pips(g.rep, CONFIG.maxRep, '★', '☆')}</span>
      ${muteButton()}
    </header>
    <section class="customer ${d.boss ? 'boss' : ''}">
      <div class="face">${portraitSVG(c.look, d.mood)}</div>
      <div class="bubble">
        <p class="who">${c.name}<span class="pat" aria-label="我慢 ${d.patience}">我慢 ${pips(d.patience, c.patience)}</span></p>
        <p class="say">${esc(d.line)}</p>
      </div>
    </section>
    <div class="scroller">
      <section class="mat">
        <div class="tag">
          <p class="itemname">${d.item.name}</p>
          <p class="auth">伝 ${d.item.author}</p>
          <dl>
            <div><dt>本物なら</dt><dd>${yen(d.item.ifReal)}</dd></div>
            <div class="ask"><dt>言い値</dt><dd>${yen(d.ask)}</dd></div>
          </dl>
        </div>
        <div class="piece">${itemSVG(d.item, d.item.spots, { spotPos: spotDefs })}${spotButtons}</div>
      </section>
      <section class="notes">
        ${lens}
        <div class="noteinner">
          ${clues ? `<ul class="clues">${clues}</ul>` : '<p class="hint">光る印を押すと、その部分を見られます。</p>'}
          <p class="hint">${left > 0 ? `あと${left}か所は無料で見られます。` : d.looks.length < 3 ? REACTIONS.thirdLook : '全部見ました。'}</p>
          ${a ? `<div class="appraisal"><b>${APPRAISERS[a.id].name}</b>${esc(appraisalLine(a))}${d.heard ? '<em>客に聞こえた。言い値が上がった。</em>' : ''}</div>` : ''}
        </div>
      </section>
    </div>
    <section class="deal">
      <div class="abacus-wrap">
        <div class="abacus" role="group" aria-label="買い取り額の算盤">${abacusHTML()}</div>
        <div class="readout">
          <output class="bid" aria-live="polite">${yen(bid)}</output>
          <div class="presets">
            <button data-act="set" data-v="${d.ask}">言い値</button>
            <button data-act="set" data-v="${Math.max(1000, Math.round(d.ask / 2000) * 1000)}">半値</button>
            <button data-act="set" data-v="0">御破算</button>
          </div>
        </div>
      </div>
      ${note ? `<p class="note" role="alert">${esc(note)}</p>` : ''}
      <div class="actions">
        <button class="sub" data-act="pass">見送る</button>
        <button class="sub" data-act="appraisers" ${a ? 'disabled' : ''}>鑑定人を呼ぶ</button>
        <button class="primary" data-act="offer">この値で買う</button>
      </div>
    </section>
  </main>`;
}

// 小さい画面でも、読んだばかりの手がかりが隠れないようにする
function showNotes() {
  const s = app.querySelector('.scroller');
  if (s && innerWidth < 760) s.scrollTop = s.scrollHeight;
}

function appraisalLine(a) {
  const def = APPRAISERS[a.id];
  return def.say(GRADES[a.seen].label, yen(a.low), yen(a.high));
}

function abacusHTML() {
  return RODS.map((unit, r) => {
    const digit = Math.floor(bid / unit) % 10;
    const five = digit >= 5;
    const ones = digit % 5;
    let earth = '';
    for (let i = 1; i <= 4; i += 1) {
      earth += `<button class="bead ${i <= ones ? 'up' : ''}" data-act="bead" data-r="${r}" data-b="${i}" aria-label="${ROD_NAMES[r]}の珠${i}"></button>`;
    }
    return `<div class="rod" aria-label="${ROD_NAMES[r]}の位 ${digit}">
      <span class="rodname">${ROD_NAMES[r]}</span>
      <div class="heaven"><button class="bead ${five ? 'down' : ''}" data-act="bead" data-r="${r}" data-b="5" aria-label="${ROD_NAMES[r]}の五珠"></button></div>
      <div class="earth">${earth}</div>
    </div>`;
  }).join('');
}

function refreshAbacus() {
  const el = app.querySelector('.abacus');
  if (el) el.innerHTML = abacusHTML();
  const out = app.querySelector('.bid');
  if (out) {
    out.textContent = yen(bid);
    out.classList.toggle('over', bid > g.cash);
  }
}

function pressBead(r, b) {
  const unit = RODS[r];
  const digit = Math.floor(bid / unit) % 10;
  const five = digit >= 5 ? 5 : 0;
  const ones = digit % 5;
  let next;
  if (b === 5) next = (five ? 0 : 5) + ones;
  else next = five + (ones === b ? b - 1 : b);
  bid += (next - digit) * unit;
  sound.bead();
  refreshAbacus();
}

function appraiserSheet() {
  const d = g.deal;
  const rows = APPRAISER_IDS.map((id) => {
    const a = APPRAISERS[id];
    const st = canCall(g, id);
    const sub = id === 'sensei' ? `本日は${CATEGORIES[g.specialty].label}` : id === 'oracle' ? `残り${g.oracleLeft}回` : '';
    return `<button class="ap" data-act="call" data-id="${id}" ${st.ok ? '' : 'disabled'}>
      <span class="apface">${portraitSVG(a.look, 'calm')}</span>
      <span class="apbody"><b>${a.name}</b><small>${a.note}</small>${sub ? `<small class="apsub">${sub}</small>` : ''}${st.ok ? '' : `<small class="apno">${st.why}</small>`}</span>
      <span class="apfee">${yen(a.fee)}</span>
    </button>`;
  }).join('');
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', `${d.item.name}の鑑定人を選ぶ`);
  sheet.innerHTML = `<div class="sheetbody"><h2>誰を呼びますか</h2>${rows}<button class="sub" data-act="closesheet">呼ばない</button></div>`;
  app.appendChild(sheet);
  sheet.querySelector('button:not([disabled])').focus();
}

async function afterDeal() {
  app.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  await wait(1000);
  if (dayDone(g)) marketIntro();
  else nextDeal();
}

function doOffer() {
  const r = offer(g, bid);
  if (r.result === 'invalid') { note = REACTIONS.zero; shop(); return; }
  if (r.result === 'nocash') { note = REACTIONS.cash; shop(); return; }
  note = '';
  if (r.result === 'accepted') {
    sound.hammer();
    shop();
    app.querySelector('.say').classList.add('pop');
    afterDeal();
  } else if (r.result === 'left') {
    sound.lose();
    shop();
    afterDeal();
  } else {
    sound.refuse();
    shop();
  }
}

function doPass() {
  pass(g);
  if (dayDone(g)) marketIntro();
  else nextDeal();
}

function marketIntro() {
  sound.music('market');
  const crate = g.crate;
  app.innerHTML = `<main class="market">
    <h2>${g.day}日目の市</h2>
    <p class="mkt-lead">${crate.length ? `買い取った${crate.length}点を競りにかけます。` : '今日は何も買わなかった。市に出す品はありません。'}</p>
    <button class="primary" data-act="auction">${crate.length ? '競りを始める' : '店賃を払う'}</button>
    ${muteButton()}
  </main>`;
}

async function auction() {
  const settle = settleDay(g);
  for (const sale of settle.sales) {
    await showSale(sale);
  }
  showTally(settle);
}

function saleStage(sale) {
  const spotDefs = CATEGORIES[sale.cat].spots;
  const item = { cat: sale.cat, art: sale.art, name: sale.name };
  app.innerHTML = `<main class="market bid-floor ${sale.boss ? 'boss' : ''}">
    <p class="mkt-name">${sale.name}</p>
    <div class="auction-piece">${itemSVG(item, sale.spots, { spotPos: spotDefs })}<div class="stamp" hidden></div></div>
    <p class="paid">買値 ${yen(sale.paid)}</p>
    <p class="roll" aria-live="off">¥0</p>
    <p class="verdict" aria-live="polite"></p>
    <button class="primary" data-act="nextsale" hidden>次へ</button>
  </main>`;
}

function showSale(sale) {
  return new Promise((resolve) => {
    (async () => {
      saleStage(sale);
      const roll = app.querySelector('.roll');
      const steps = reduced() ? 1 : sale.boss ? 34 : 18;
      for (let i = 1; i <= steps; i += 1) {
        const k = i / steps;
        const jitter = k < 1 ? 1 + (Math.random() - 0.5) * (1 - k) * 0.5 : 1;
        roll.textContent = yen(Math.round((sale.sale * k * k * jitter) / 1000) * 1000);
        sound.tick();
        await wait(sale.boss ? 70 : 45);
      }
      await wait(sale.boss ? 500 : 160);
      roll.textContent = yen(sale.sale);
      sound.hammer();
      const def = GRADES[sale.grade];
      const stamp = app.querySelector('.stamp');
      stamp.textContent = def.stamp;
      stamp.className = `stamp ${sale.grade}`;
      stamp.hidden = false;
      const up = sale.profit >= 0;
      const bits = [`${def.label}でした。${up ? '利益' : '損'} ${yen(Math.abs(sale.profit))}`];
      if (sale.fee) bits.push(`おウメさんに ${yen(sale.fee)} 支払い。`);
      if (sale.repChange < 0) bits.push(`${sale.customer}が値打ちを知り、町に噂が広がった。信用が下がった。`);
      if (sale.repChange > 0) bits.push(`${sale.customer}が喜んで、町で褒めてくれた。信用が上がった。`);
      app.querySelector('.verdict').textContent = bits.join(' ');
      app.querySelector('.verdict').classList.add(up ? 'plus' : 'minus');
      const huge = sale.sale >= 300000 && sale.sale >= sale.paid * 4;
      if (huge) await bigHit(sale);
      else if (up) sound.bell(); else sound.lose();
      const btn = app.querySelector('[data-act="nextsale"]');
      btn.hidden = false;
      btn.focus();
      btn.addEventListener('click', () => resolve(), { once: true });
    })();
  });
}

// 一番の盛り上がり。掘り出し物が出たときだけ画面全部を使う。
function bigHit(sale) {
  return new Promise((resolve) => {
    sound.win();
    const el = document.createElement('button');
    el.className = `bighit ${sale.grade}`;
    el.dataset.act = 'none';
    el.innerHTML = `<span class="rays" aria-hidden="true"></span>
      <span class="bh-stamp">${GRADES[sale.grade].stamp}</span>
      <span class="bh-label">掘り出し物</span>
      <span class="bh-yen">${yen(sale.sale)}</span>
      <span class="bh-paid">買値 ${yen(sale.paid)} が、${Math.floor(sale.sale / Math.max(1, sale.paid))}倍に</span>`;
    el.setAttribute('aria-label', `掘り出し物。${yen(sale.sale)}。押して閉じる`);
    app.appendChild(el);
    el.focus();
    el.addEventListener('click', () => { el.remove(); resolve(); }, { once: true });
  });
}

function showTally(settle) {
  const total = settle.sales.reduce((a, s) => a + s.sale - s.fee, 0);
  const paid = settle.sales.reduce((a, s) => a + s.paid, 0);
  const rows = settle.sales.map((s) => `<tr><td>${s.name}<small>${GRADES[s.grade].label}</small></td><td class="${s.profit >= 0 ? 'plus' : 'minus'}">${s.profit >= 0 ? '+' : ''}${yen(s.profit)}</td></tr>`).join('');
  app.innerHTML = `<main class="market tally">
    <h2>${settle.day}日目の帳尻</h2>
    <table class="ledgertable">
      ${rows || '<tr><td colspan="2">売った品はありません</td></tr>'}
      <tr class="sep"><td>売上</td><td>${yen(total)}</td></tr>
      <tr><td>買い取り</td><td>${yen(-paid)}</td></tr>
      <tr><td>店賃</td><td>${yen(-settle.rent)}</td></tr>
      <tr class="sum"><td>手持ち</td><td>${yen(g.cash)}</td></tr>
    </table>
    ${settle.paidRent ? '' : `<p class="warn">店賃 ${yen(settle.rent)} が払えません。暖簾を下ろします。</p>`}
    <button class="primary" data-act="${g.over ? 'result' : 'nextday'}">${g.over ? '五日帳を閉じる' : '翌朝へ'}</button>
  </main>`;
  app.querySelector('.primary').focus();
}

function shareLink(id) {
  if (!/^https?:$/.test(location.protocol)) return '';
  return new URL(`share/${id}.html`, location.href.split('?')[0]).href;
}

async function share(res) {
  const url = shareLink(res.title.id);
  const text = `古物商ゲーム「眼福堂」で${g.day}日間商って、手持ち${yen(res.cash)}。称号は「${res.title.name}」でした。`;
  if (matchMedia('(pointer: coarse)').matches && navigator.share) {
    try {
      await navigator.share({ text: `${text}\n${url}`.trim() });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }
  const q = new URLSearchParams({ text });
  if (url) q.set('url', url);
  window.open(`https://x.com/intent/post?${q}`, '_blank', 'noopener');
}

function result() {
  sound.music(null);
  const r = finalResult(g);
  saveBest(g.over === 'done' ? r.cash : 0);
  if (r.bankrupt) sound.lose(); else sound.win();
  const line = (t, h) => (h ? `<tr><th>${t}</th><td>${h.name}<br><span class="${h.profit >= 0 ? 'plus' : 'minus'}">${h.profit >= 0 ? '+' : ''}${yen(h.profit)}</span></td></tr>` : '');
  app.innerHTML = `<main class="result ${r.bankrupt ? 'closed' : ''}">
    <div class="receipt">
      <p class="shop-name">眼福堂 五日帳</p>
      <h2>${r.title.name}</h2>
      <p class="tline">${r.title.line}</p>
      <p class="final">${yen(r.cash)}</p>
      <table>
        <tr><th>商った日数</th><td>${g.lastSettle.day}日</td></tr>
        <tr><th>買い取り</th><td>${r.deals}点</td></tr>
        <tr><th>つかんだ贋作</th><td>${r.fakes}点</td></tr>
        <tr><th>信用</th><td>${pips(r.rep, CONFIG.maxRep, '★', '☆')}</td></tr>
        ${line('一番の儲け', r.best)}${line('一番の損', r.worst)}
      </table>
      <div class="seal" aria-hidden="true">眼福</div>
    </div>
    <div class="result-actions">
      <button class="primary" data-act="share">Xで結果を見せる</button>
      <button class="sub" data-act="again">もう一度、暖簾を上げる</button>
    </div>
  </main>`;
  app.querySelector('[data-act="share"]').addEventListener('click', () => share(r));
}

app.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b || b.disabled) return;
  sound.unlock();
  const act = b.dataset.act;
  if (act === 'start') {
    const noren = app.querySelector('.noren');
    if (noren && !reduced()) {
      noren.classList.add('open');
      sound.bell();
      setTimeout(start, 560);
    } else start();
  } else if (act === 'mute') {
    sound.toggle();
    b.textContent = sound.muted ? '音なし' : '音あり';
    b.setAttribute('aria-pressed', String(sound.muted));
    b.setAttribute('aria-label', `音を${sound.muted ? '出す' : '消す'}`);
  } else if (act === 'next' || act === 'nextday') {
    if (act === 'nextday') dayOpen(); else nextDeal();
  } else if (act === 'look') {
    const i = Number(b.dataset.i);
    if (!g.deal.looks.includes(i)) look(g, i);
    focusSpot = i;
    sound.look();
    shop();
    showNotes();
  } else if (act === 'bead') {
    pressBead(Number(b.dataset.r), Number(b.dataset.b));
  } else if (act === 'set') {
    bid = Math.min(9999000, Number(b.dataset.v));
    sound.bead();
    refreshAbacus();
  } else if (act === 'offer') {
    doOffer();
  } else if (act === 'pass') {
    doPass();
  } else if (act === 'appraisers') {
    appraiserSheet();
  } else if (act === 'closesheet') {
    app.querySelector('.sheet').remove();
    app.querySelector('[data-act="appraisers"]').focus();
  } else if (act === 'call') {
    callAppraiser(g, b.dataset.id);
    sound.look();
    shop();
    showNotes();
  } else if (act === 'auction') {
    auction();
  } else if (act === 'result') {
    result();
  } else if (act === 'again') {
    title();
  }
});

title();
