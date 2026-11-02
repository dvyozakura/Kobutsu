// 方針の違うボットを走らせて難易度を測る。 node tools/sim.mjs [回数]
import { CONFIG, GRADES, GRADE_ORDER, CUSTOMERS, TITLES } from '../js/data.js';
import {
  createGame, nextCustomer, look, offer, pass, settleDay, callAppraiser, canCall, finalResult, toStep, canLook,
} from '../js/game.js';

// 見た手がかりから、人が頭の中でやる程度の見積もりを出す
function estimate(d) {
  const c = CUSTOMERS[d.customerId];
  const seen = d.looks.map((i) => d.item.spots[i].good);
  let total = 0; let exp = 0;
  for (const g of GRADE_ORDER) {
    let p = c.odds[g];
    for (const good of seen) p *= good ? GRADES[g].good : 1 - GRADES[g].good;
    total += p; exp += p * GRADES[g].mult;
  }
  return (exp / total) * d.item.ifReal;
}

const haggle = (s, cap) => {
  const d = s.deal;
  let bid = toStep(Math.min(d.ask * 0.6, cap));
  while (d.status === 'open') {
    if (bid > cap || bid > s.cash) { pass(s); break; }
    offer(s, bid);
    bid = toStep(Math.min(bid * 1.25 + 1000, d.ask));
  }
};

const BOTS = {
  見送るだけ: (s) => pass(s),
  言い値で全部買う: (s) => { if (s.cash >= s.deal.ask) offer(s, s.deal.ask); else pass(s); },
  手がかりだけ: (s) => {
    look(s, 0); look(s, 1);
    haggle(s, Math.min(s.cash * 0.6, estimate(s.deal) * 0.5));
    if (s.deal.status === 'open') pass(s);
  },
  三か所まで見る: (s) => {
    look(s, 0); look(s, 1);
    const v = estimate(s.deal);
    if (v > s.deal.ask && canLook(s, 2)) look(s, 2);
    haggle(s, Math.min(s.cash * 0.7, estimate(s.deal) * 0.55));
    if (s.deal.status === 'open') pass(s);
  },
  鑑定人も使う: (s) => {
    look(s, 0); look(s, 1);
    const est = estimate(s.deal);
    let cap = est * 0.55;
    if (s.deal.boss && canCall(s, 'oracle').ok) callAppraiser(s, 'oracle');
    else if (est > 60000 && canCall(s, 'sensei').ok) callAppraiser(s, 'sensei');
    else if (est > 90000 && canCall(s, 'banto').ok) callAppraiser(s, 'banto');
    const a = s.deal.appraisal;
    if (a) cap = ((a.low + a.high) / 2) * (a.cut ? 0.6 : 0.65);
    haggle(s, Math.min(s.cash * 0.85, cap));
    if (s.deal.status === 'open') pass(s);
  },
  買い叩き: (s) => {
    look(s, 0); look(s, 1);
    const d = s.deal;
    if (estimate(d) > d.floor * 1.3 && s.cash >= d.floor) offer(s, d.floor); else pass(s);
  },
};

const runs = Number(process.argv[2] || 4000);
for (const [name, bot] of Object.entries(BOTS)) {
  const cash = []; const titles = {}; let broke = 0; let reps = 0;
  for (let i = 0; i < runs; i += 1) {
    const s = createGame(i * 7919 + 13);
    let guard = 0;
    while (!s.over) {
      for (let c = 0; c < CONFIG.customersPerDay; c += 1) {
        nextCustomer(s);
        bot(s);
        if (s.deal.status === 'open') throw new Error('取引が閉じていない');
      }
      settleDay(s);
      if ((guard += 1) > 10) throw new Error('進まない');
    }
    const r = finalResult(s);
    cash.push(r.cash); titles[r.title.id] = (titles[r.title.id] || 0) + 1;
    if (r.bankrupt) broke += 1;
    reps += r.rep;
  }
  cash.sort((a, b) => a - b);
  const pct = (p) => cash[Math.floor(cash.length * p)].toLocaleString();
  const t = TITLES.map((x) => `${x.id}:${(((titles[x.id] || 0) / runs) * 100).toFixed(0)}`).join(' ');
  console.log(`${name.padEnd(10, '　')} 破産${((broke / runs) * 100).toFixed(0).padStart(3)}% 中央${pct(0.5).padStart(11)} 上位10%${pct(0.9).padStart(11)} 信用${(reps / runs).toFixed(1)}  ${t}`);
}
