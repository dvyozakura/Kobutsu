// 純粋なロジック。DOMに触らず、Nodeからそのまま動かせる。
import {
  CONFIG, GRADES, GRADE_ORDER, CATEGORIES, CATEGORY_IDS, CUSTOMERS, APPRAISERS, TITLES,
} from './data.js';

function rand(s) {
  s.r = (s.r + 0x6d2b79f5) | 0;
  let t = s.r;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (s, [a, b]) => a + (b - a) * rand(s);
const pick = (s, list) => list[Math.floor(rand(s) * list.length) % list.length];

function weighted(s, table) {
  const entries = Object.entries(table);
  let n = rand(s) * entries.reduce((a, [, w]) => a + Math.max(0, w), 0);
  for (const [key, w] of entries) {
    n -= Math.max(0, w);
    if (n <= 0) return key;
  }
  return entries[0][0];
}

export const toStep = (n) => Math.max(CONFIG.step, Math.round(n / CONFIG.step) * CONFIG.step);
const nice = (n) => {
  const unit = n >= 1000000 ? 100000 : n >= 100000 ? 10000 : 1000;
  return Math.max(unit, Math.round(n / unit) * unit);
};
export const rentFor = (day) => CONFIG.rent[day - 1];

export function createGame(seed = Date.now() >>> 0) {
  const s = {
    seed, r: seed | 0, day: 1, slot: 0, cash: CONFIG.startCash, rep: CONFIG.startRep,
    oracleLeft: CONFIG.oracleUses, specialty: 'chawan', crate: [], history: [],
    deal: null, phase: 'shop', over: null, lastSettle: null,
  };
  s.specialty = pick(s, CATEGORY_IDS);
  return s;
}

function chooseCustomer(s) {
  if (s.day === CONFIG.days && s.slot === CONFIG.customersPerDay) return 'lord';
  const table = {};
  for (const [id, c] of Object.entries(CUSTOMERS)) {
    table[id] = c.weight === 0 ? 0 : c.weight + c.repWeight * (s.rep - CONFIG.startRep);
  }
  if (s.deal) table[s.deal.customerId] *= 0.25; // 同じ客が続きにくい
  return weighted(s, table);
}

function makeItem(s, boss) {
  const cat = pick(s, CATEGORY_IDS);
  const def = CATEGORIES[cat];
  const low = 24000 * (1 + 0.55 * (s.day - 1));
  const high = 240000 * (1 + 0.85 * (s.day - 1));
  const ifReal = boss
    ? nice(2400000 + rand(s) * 3600000)
    : nice(Math.exp(Math.log(low) + rand(s) * (Math.log(high) - Math.log(low))));
  return { cat, name: pick(s, def.names), author: def.author, ifReal, art: Math.floor(rand(s) * 1e6) };
}

export function nextCustomer(s) {
  if (s.phase !== 'shop') throw new Error('店が閉まっています');
  s.slot += 1;
  const customerId = chooseCustomer(s);
  const c = CUSTOMERS[customerId];
  const boss = customerId === 'lord';
  const item = makeItem(s, boss);
  const grade = weighted(s, c.odds);
  const def = GRADES[grade];
  item.grade = grade;
  item.value = nice(item.ifReal * def.mult * (0.85 + rand(s) * 0.3));
  item.spots = CATEGORIES[item.cat].spots.map((spot) => {
    const good = rand(s) < def.good;
    return { good, clue: pick(s, good ? spot.good : spot.bad) };
  });
  // 蒐集家は眼があるが、極上までは見抜けない
  const believed = item.ifReal * Math.min(def.mult, 1);
  const basis = c.basis === 'believed' ? Math.max(believed, item.ifReal * 0.1) : item.ifReal;
  const ask = toStep(basis * between(s, c.askFrac));
  const floor = Math.min(ask, toStep(ask * between(s, c.floorFrac)));
  s.deal = {
    customerId, boss, item, ask, firstAsk: ask, floor, patience: c.patience,
    looks: [], appraisal: null, line: pick(s, c.greet), mood: 'calm', status: 'open', paid: 0,
  };
  return s.deal;
}

export const looksLeft = (s) => Math.max(0, CONFIG.freeLooks - s.deal.looks.length);
export function canLook(s, i) {
  const d = s.deal;
  if (d.status !== 'open' || d.looks.includes(i)) return false;
  return looksLeft(s) > 0 || d.patience >= 2;
}
export function look(s, i) {
  if (!canLook(s, i)) return null;
  const d = s.deal;
  if (looksLeft(s) === 0) d.patience -= 1; // 3か所目は客を待たせる
  d.looks.push(i);
  return d.item.spots[i];
}

export function canCall(s, id) {
  const a = APPRAISERS[id];
  const d = s.deal;
  if (d.status !== 'open' || d.appraisal) return { ok: false, why: '一人の客に呼べるのは一度だけ' };
  if (s.cash < a.fee) return { ok: false, why: '手持ちが足りない' };
  if (a.specialist && d.item.cat !== s.specialty) return { ok: false, why: '専門外' };
  if (id === 'oracle' && s.oracleLeft <= 0) return { ok: false, why: 'もう呼べない' };
  return { ok: true };
}

export function callAppraiser(s, id) {
  if (!canCall(s, id).ok) return null;
  const a = APPRAISERS[id];
  const d = s.deal;
  s.cash -= a.fee;
  if (id === 'oracle') s.oracleLeft -= 1;
  let seen = d.item.grade;
  if (rand(s) > a.acc) {
    const at = GRADE_ORDER.indexOf(seen);
    const shift = at === 0 ? 1 : at === GRADE_ORDER.length - 1 ? -1 : rand(s) < 0.5 ? -1 : 1;
    seen = GRADE_ORDER[at + shift];
  }
  const base = seen === d.item.grade ? d.item.value : d.item.ifReal * GRADES[seen].mult;
  const center = base * (1 + (rand(s) * 2 - 1) * a.err * 0.5);
  const low = nice(center * (1 - a.err * 0.5));
  const high = nice(center * (1 + a.err * 0.5));
  d.appraisal = { id, seen, low, high, cut: a.cut || 0 };
  if (a.loud && center > d.ask) {
    // 大声が客に聞こえて、値が吊り上がる
    d.floor = Math.max(d.floor, toStep(center * 0.42));
    d.ask = Math.max(d.ask, toStep(center * 0.62));
    d.heard = true;
  }
  return d.appraisal;
}

export function offer(s, amount) {
  const d = s.deal;
  const c = CUSTOMERS[d.customerId];
  if (d.status !== 'open') return { result: 'closed' };
  if (!(amount > 0)) return { result: 'invalid' };
  if (amount > s.cash) return { result: 'nocash' };
  if (amount >= d.floor) {
    s.cash -= amount;
    d.paid = amount;
    d.status = 'bought';
    d.mood = 'happy';
    d.line = pick(s, c.accept);
    s.crate.push(d);
    return { result: 'accepted' };
  }
  const ratio = amount / d.floor;
  d.patience -= ratio < 0.5 ? 2 : 1;
  d.ask = Math.max(d.floor, toStep(d.ask - (d.ask - d.floor) * 0.4));
  if (d.patience <= 0) {
    d.status = 'left';
    d.mood = 'angry';
    d.line = pick(s, c.leave);
    return { result: 'left' };
  }
  d.mood = ratio >= 0.8 ? 'calm' : 'angry';
  d.line = pick(s, ratio >= 0.8 ? c.near : c.far);
  return { result: 'refused', near: ratio >= 0.8 };
}

export function pass(s) {
  const d = s.deal;
  if (d.status === 'open') {
    d.status = 'passed';
    d.line = '';
  }
}

export const dayDone = (s) => s.slot >= CONFIG.customersPerDay && s.deal && s.deal.status !== 'open';

// 市で売り、店賃を払い、次の日へ進める。
export function settleDay(s) {
  const sales = s.crate.map((d) => {
    const fee = d.appraisal && d.appraisal.cut ? nice(d.item.value * d.appraisal.cut) : 0;
    const before = s.rep;
    if (d.customerId === 'granny') {
      const share = d.paid / d.item.value;
      if (share < 0.1 && GRADE_ORDER.indexOf(d.item.grade) >= 2) s.rep -= 1;
      else if (share >= 0.45) s.rep += 1;
    }
    s.rep = Math.max(0, Math.min(CONFIG.maxRep, s.rep));
    const entry = {
      day: s.day, name: d.item.name, cat: d.item.cat, art: d.item.art, grade: d.item.grade,
      spots: d.item.spots, paid: d.paid, sale: d.item.value, fee, profit: d.item.value - d.paid - fee,
      customer: CUSTOMERS[d.customerId].name, boss: d.boss, repChange: s.rep - before,
    };
    s.cash += d.item.value - fee;
    s.history.push(entry);
    return entry;
  });
  const rent = rentFor(s.day);
  const paidRent = s.cash >= rent;
  s.cash -= rent;
  s.crate = [];
  s.lastSettle = { sales, rent, paidRent, day: s.day, cash: s.cash };
  if (!paidRent) s.over = 'bankrupt';
  else if (s.day >= CONFIG.days) s.over = 'done';
  else {
    s.day += 1;
    s.slot = 0;
    s.specialty = pick(s, CATEGORY_IDS);
  }
  if (s.over) s.phase = 'over';
  return s.lastSettle;
}

export function finalResult(s) {
  const f = { cash: s.cash, rep: s.rep, bankrupt: s.over === 'bankrupt' };
  const title = TITLES.find((t) => t.test(f));
  const sorted = [...s.history].sort((a, b) => b.profit - a.profit);
  return {
    ...f, title, best: sorted[0] || null,
    worst: sorted.length > 1 && sorted[sorted.length - 1].profit < 0 ? sorted[sorted.length - 1] : null,
    deals: s.history.length, fakes: s.history.filter((h) => h.grade === 'fake').length,
  };
}

export const yen = (n) => `${n < 0 ? '−' : ''}¥${Math.abs(Math.round(n)).toLocaleString('ja-JP')}`;
