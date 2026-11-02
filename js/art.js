// 絵はすべてコードで作るSVG。
const seeded = (n) => {
  let x = (n * 2654435761) >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
};

// 手がかりの見た目。本物の跡は線が揺らぎ、まがい物は定規のように揃う。
function marks(cx, cy, good, color, seed) {
  const r = seeded(seed + 7);
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    const y = cy - 6 + i * 2.4;
    if (good) {
      const a = cx - 7 + r() * 3;
      const b = cx + 4 + r() * 4;
      out += `<path d="M${a} ${y + r() * 1.4 - 0.7}Q${cx} ${y + r() * 3 - 1.5} ${b} ${y + r() * 1.4 - 0.7}" fill="none" stroke="${color}" stroke-width="${0.25 + r() * 0.45}" stroke-linecap="round"/>`;
    } else {
      out += `<path d="M${cx - 7} ${y}H${cx + 7}" stroke="${color}" stroke-width=".4"/>`;
    }
  }
  return out;
}

const DRAW = {
  chawan(r, item) {
    const glaze = { 黒: '#20242c', 赤: '#8c3321', 灰: '#7c7f6e', 白: '#d9d3c0' }[item.name[0]] || '#20242c';
    const dark = glaze === '#d9d3c0' ? '#a59f8c' : '#14161c';
    return `<ellipse cx="100" cy="146" rx="62" ry="9" fill="#000" opacity=".35"/>
      <path d="M66 126h68l-6 16H72z" fill="#a98e6b"/>
      <path d="M38 48C40 100 62 130 100 130s60-30 62-82z" fill="${glaze}"/>
      <path d="M38 48c30 12 94 12 124 0v10c-28 44-92 46-120 10z" fill="${dark}" opacity=".24"/>
      <ellipse cx="100" cy="46" rx="62" ry="13" fill="${glaze}"/>
      <ellipse cx="100" cy="47" rx="54" ry="9.5" fill="${dark}"/>
      <path d="M54 66c6 26 16 42 30 50" stroke="#fff" stroke-width="3" opacity=".16" fill="none" stroke-linecap="round"/>`;
  },
  scroll(r) {
    const ink = '#262a33';
    const moon = r() > 0.5;
    return `<rect x="64" y="146" width="72" height="5" fill="#000" opacity=".3"/>
      <rect x="52" y="6" width="96" height="6" rx="2" fill="#4b3320"/>
      <rect x="60" y="12" width="80" height="128" fill="#5e6f58"/>
      <rect x="68" y="32" width="64" height="84" fill="#dbcfae"/>
      <path d="M68 96c12-16 18-8 26-20s16-8 22 2 12 6 16 16v22H68z" fill="${ink}" opacity=".38"/>
      <path d="M78 104c10-12 16-6 24-14s12-2 18 8 8 6 12 8v10H78z" fill="${ink}" opacity=".62"/>
      ${moon ? '<circle cx="114" cy="50" r="8" fill="#f0e9cf" stroke="#262a33" stroke-width=".5"/>' : '<path d="M90 44q6 10 2 22M100 40q8 12 3 30" stroke="#262a33" stroke-width="1.5" fill="none" opacity=".55"/>'}
      <rect x="116" y="96" width="8" height="8" fill="#b92c20"/>
      <rect x="52" y="140" width="96" height="7" rx="3" fill="#4b3320"/>
      <rect x="46" y="141" width="8" height="5" rx="2" fill="#d6c6a0"/><rect x="146" y="141" width="8" height="5" rx="2" fill="#d6c6a0"/>`;
  },
  tsuba(r) {
    const iron = ['#39352f', '#2f3236', '#433630'][Math.floor(r() * 3)];
    return `<ellipse cx="100" cy="146" rx="58" ry="7" fill="#000" opacity=".35"/>
      <ellipse cx="100" cy="80" rx="62" ry="66" fill="${iron}"/>
      <ellipse cx="100" cy="80" rx="55" ry="59" fill="none" stroke="#5c564c" stroke-width="2"/>
      <path d="M93 62h14l3 18-3 18H93l-3-18z" fill="#0f3f32"/>
      <path d="M70 30c12 2 18 10 22 18-12 0-20-6-22-18zM130 30c-12 2-18 10-22 18 12 0 20-6 22-18z" fill="#0f3f32"/>
      <path d="M126 104h8v18h-8zM66 72h10v16H66z" fill="#0f3f32"/>
      <path d="M58 56c-6 18-4 38 6 54" stroke="#776f62" stroke-width="2" fill="none" opacity=".55"/>`;
  },
  watch() {
    let ticks = '';
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      ticks += `<rect x="-1" y="-2.5" width="2" height="5" fill="#262a33" transform="translate(${100 + Math.sin(a) * 41} ${90 - Math.cos(a) * 41}) rotate(${i * 30})"/>`;
    }
    return `<ellipse cx="100" cy="150" rx="50" ry="7" fill="#000" opacity=".35"/>
      <rect x="93" y="10" width="14" height="16" rx="3" fill="#c5c5bd"/>
      <path d="M86 12a14 11 0 0 1 28 0" fill="none" stroke="#c5c5bd" stroke-width="4"/>
      <circle cx="100" cy="90" r="60" fill="#b5b5ad"/><circle cx="100" cy="90" r="54" fill="#8f8f88"/>
      <circle cx="100" cy="90" r="50" fill="#ece6d4"/>${ticks}
      <path d="M100 90L100 58" stroke="#262a33" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M100 90L124 102" stroke="#262a33" stroke-width="3" stroke-linecap="round"/>
      <circle cx="100" cy="90" r="3" fill="#b92c20"/>
      <circle cx="100" cy="116" r="9" fill="none" stroke="#262a33" stroke-width=".6"/>`;
  },
  toy(r) {
    const body = ['#b92c20', '#2c5da8', '#d59a1e'][Math.floor(r() * 3)];
    return `<ellipse cx="100" cy="150" rx="46" ry="6" fill="#000" opacity=".35"/>
      <rect x="82" y="4" width="4" height="12" fill="#888"/><circle cx="84" cy="4" r="3.5" fill="#f4c542"/>
      <rect x="72" y="14" width="56" height="38" rx="4" fill="#b8bcc4"/>
      <circle cx="88" cy="32" r="7" fill="#f4c542" stroke="#262a33" stroke-width="2"/><circle cx="112" cy="32" r="7" fill="#f4c542" stroke="#262a33" stroke-width="2"/>
      <path d="M84 44h32v4H84z" fill="#262a33"/>
      <rect x="64" y="54" width="72" height="56" rx="4" fill="${body}"/>
      <rect x="76" y="62" width="48" height="26" fill="#262a33"/><path d="M80 80l8-10 8 6 8-12 12 16z" fill="#58d0b5"/>
      <circle cx="88" cy="99" r="4" fill="#f4c542"/><circle cx="112" cy="99" r="4" fill="#fff"/>
      <rect x="46" y="58" width="16" height="42" rx="3" fill="#b8bcc4"/><rect x="138" y="58" width="16" height="42" rx="3" fill="#b8bcc4"/>
      <rect x="74" y="112" width="20" height="30" fill="#b8bcc4"/><rect x="106" y="112" width="20" height="30" fill="#b8bcc4"/>
      <rect x="68" y="140" width="30" height="8" rx="2" fill="#262a33"/><rect x="102" y="140" width="30" height="8" rx="2" fill="#262a33"/>`;
  },
  koban() {
    let lines = '';
    for (let i = 0; i < 26; i += 1) lines += `<path d="M64 ${22 + i * 4.4}H136" stroke="#a97c1c" stroke-width=".7" opacity=".6"/>`;
    return `<ellipse cx="100" cy="148" rx="44" ry="7" fill="#000" opacity=".35"/>
      <ellipse cx="100" cy="80" rx="52" ry="70" fill="#d8ac3c"/>
      <ellipse cx="100" cy="80" rx="46" ry="64" fill="#e6c25a"/>
      <clipPath id="kb"><ellipse cx="100" cy="80" rx="46" ry="64"/></clipPath><g clip-path="url(#kb)">${lines}</g>
      <rect x="86" y="26" width="28" height="18" fill="#c99b2e" stroke="#8f6a14"/>
      <path d="M92 30h16M100 30v10M93 40h14" stroke="#8f6a14" stroke-width="2"/>
      <rect x="86" y="110" width="28" height="18" rx="3" fill="#c99b2e" stroke="#8f6a14"/>
      <path d="M92 118q8-8 16 0" stroke="#8f6a14" stroke-width="2" fill="none"/>`;
  },
};

const DARK_MARK = (item) => ['koban', 'watch', 'scroll'].includes(item.cat) || item.name[0] === '白';

export function itemSVG(item, spots, opts = {}) {
  const r = seeded(item.art + 1);
  const defs = opts.spotPos || [];
  const detail = spots.map((s, i) => {
    if (!defs[i]) return '';
    const cx = (defs[i].x / 100) * 200;
    const cy = (defs[i].y / 100) * 160;
    return marks(cx, cy, s.good, DARK_MARK(item) ? '#4a3a12' : '#efe7cf', item.art + i * 31);
  }).join('');
  let view = '0 0 200 160';
  if (opts.focus != null && defs[opts.focus]) {
    const cx = (defs[opts.focus].x / 100) * 200;
    const cy = (defs[opts.focus].y / 100) * 160;
    view = `${cx - 13} ${cy - 13} 26 26`;
  }
  return `<svg viewBox="${view}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.label || item.name}">${DRAW[item.cat](r, item)}${detail}</svg>`;
}

// 人物。moodで口と眉だけ変える。
const PEOPLE = {
  granny: { bg: '#7b9a86', skin: '#e8c6a4', cloth: '#5a4a6a', hair: '#d9d6cf', style: 'bun' },
  collector: { bg: '#49506a', skin: '#dcb48f', cloth: '#22283c', hair: '#3a3a3a', style: 'slick', glasses: true },
  broker: { bg: '#a8693a', skin: '#d9a97f', cloth: '#6b2b2b', hair: '#1f1f22', style: 'sharp' },
  youth: { bg: '#6e94b8', skin: '#ecc8a8', cloth: '#e9e5d6', hair: '#5a3a24', style: 'shag' },
  clearing: { bg: '#8c8a5a', skin: '#d6a980', cloth: '#2e4f7a', hair: '#2b2b2b', style: 'cap' },
  lord: { bg: '#2c1f3a', skin: '#d8b896', cloth: '#14131f', hair: '#e6e3da', style: 'bald', beard: true },
  inkyo: { bg: '#b58b4a', skin: '#e0b48c', cloth: '#3f5a4a', hair: '#cfcac0', style: 'bald' },
  banto: { bg: '#7a4257', skin: '#ecc8a8', cloth: '#1e3a5c', hair: '#1f1f22', style: 'bun' },
  sensei: { bg: '#4e7a78', skin: '#e0ba96', cloth: '#6f6a5e', hair: '#8a8a8a', style: 'slick', glasses: true },
  oracle: { bg: '#3a2a52', skin: '#d6ae8c', cloth: '#7a1f2a', hair: '#efece2', style: 'veil' },
};

const HAIR = {
  bun: (c) => `<circle cx="50" cy="20" r="9" fill="${c}"/><path d="M28 44c0-26 44-26 44 0-8-10-36-10-44 0z" fill="${c}"/>`,
  slick: (c) => `<path d="M28 42c-2-26 46-30 44 0-10-12-24-14-44 0z" fill="${c}"/>`,
  sharp: (c) => `<path d="M26 42l6-22 8 8 8-12 8 12 8-8 8 22c-14-8-32-8-46 0z" fill="${c}"/>`,
  shag: (c) => `<path d="M26 50c-6-34 54-36 48 0l-5-12-6 8-5-9-7 9-6-9-7 9-6-8z" fill="${c}"/>`,
  cap: (c) => `<path d="M28 38c0-24 44-24 44 0z" fill="${c}"/><path d="M26 38h58v5H26z" fill="${c}"/>`,
  bald: (c) => `<path d="M28 46c-3-6-2-10 0-12M72 46c3-6 2-10 0-12" stroke="${c}" stroke-width="5" fill="none"/>`,
  veil: (c) => `<path d="M22 72C20 16 80 16 78 72 70 30 30 30 22 72z" fill="${c}"/>`,
};

export function portraitSVG(kind, mood = 'calm') {
  const p = PEOPLE[kind];
  const brow = mood === 'angry'
    ? '<path d="M36 40l10 4M64 40l-10 4" stroke="#262a33" stroke-width="2.4" stroke-linecap="round"/>'
    : '<path d="M36 42h10M54 42h10" stroke="#262a33" stroke-width="2" stroke-linecap="round"/>';
  const mouth = { calm: '<path d="M44 62h12" stroke="#262a33" stroke-width="2" stroke-linecap="round"/>', happy: '<path d="M42 59q8 9 16 0" stroke="#262a33" stroke-width="2" fill="#7a2a22"/>', angry: '<path d="M43 64q7-6 14 0" stroke="#262a33" stroke-width="2" fill="none"/>' }[mood];
  const glasses = p.glasses ? '<circle cx="41" cy="48" r="7" fill="none" stroke="#262a33" stroke-width="1.6"/><circle cx="59" cy="48" r="7" fill="none" stroke="#262a33" stroke-width="1.6"/><path d="M48 48h4" stroke="#262a33" stroke-width="1.6"/>' : '';
  const beard = p.beard ? `<path d="M34 58c4 22 28 22 32 0-6 6-26 6-32 0z" fill="${p.hair}"/>` : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="${p.bg}"/>
    <path d="M12 100c2-24 18-32 38-32s36 8 38 32z" fill="${p.cloth}"/>
    <ellipse cx="50" cy="48" rx="22" ry="25" fill="${p.skin}"/>
    <circle cx="41" cy="48" r="2.4" fill="#262a33"/><circle cx="59" cy="48" r="2.4" fill="#262a33"/>
    ${brow}${mouth}${glasses}${beard}${HAIR[p.style](p.hair)}</svg>`;
}
