// 調整する値と文章はすべてここに置く。

export const CONFIG = {
  startCash: 100000,
  days: 5,
  customersPerDay: 3,
  rent: [8000, 12000, 20000, 30000, 45000], // 日ごとの店賃
  freeLooks: 2,
  startRep: 3,
  maxRep: 5,
  oracleUses: 2,
  step: 1000, // 算盤の最小単位
};

// 鑑定で分かる位。mult は「本物なら」の値段に掛かる。
export const GRADES = {
  fake: { label: '贋作', stamp: '贋', mult: 0.03, good: 0.14 },
  copy: { label: '後世の写し', stamp: '写', mult: 0.22, good: 0.45 },
  real: { label: '真作', stamp: '真', mult: 1, good: 0.86 },
  gem: { label: '極上の逸品', stamp: '極', mult: 3, good: 0.97 },
};
export const GRADE_ORDER = ['fake', 'copy', 'real', 'gem'];

export const CATEGORIES = {
  chawan: {
    label: '茶碗',
    names: ['黒茶碗 銘「夜半」', '赤茶碗 銘「残照」', '灰釉茶碗 銘「時雨」', '白釉茶碗 銘「初雪」'],
    author: '松風庵 宗澄',
    spots: [
      { name: '高台', x: 50, y: 82,
        good: ['土が荒く、削りに迷いがない', '高台の内に古い手垢が染みている'],
        bad: ['削りが機械のように揃っている', '高台だけ妙に白く新しい'] },
      { name: '釉', x: 36, y: 50,
        good: ['貫入の奥まで茶渋が入り込んでいる', '釉の溜まりに深い奥行きがある'],
        bad: ['貫入の線が墨を刷り込んだように浮く', '表面がつるりと均一に光る'] },
      { name: '口縁', x: 66, y: 28,
        good: ['金継ぎの跡が手に馴染んでいる', '飲み口が指に吸いつくように薄い'],
        bad: ['欠けが薬で磨いたように丸い', 'どこも同じ厚みで表情がない'] },
    ],
  },
  scroll: {
    label: '掛軸',
    names: ['山水図 双幅の片割れ', '寒月図', '枯木鴉図', '雨中帰樵図'],
    author: '霞峰 玄斎',
    spots: [
      { name: '落款', x: 60, y: 68,
        good: ['朱が紙に沈み、印の欠けも正しい', '署名の筆勢が最後まで切れない'],
        bad: ['朱が紙の上に浮いている', '署名がなぞったように震えている'] },
      { name: '紙', x: 42, y: 42,
        good: ['焼けが裏まで通っている', '虫食いの穴が裏表で揃う'],
        bad: ['焼けが表だけで、茶で染めたよう', '紙の繊維が新しく白い'] },
      { name: '表具', x: 50, y: 90,
        good: ['軸先の象牙が飴色に変わっている', '裂地の折れ目が自然に擦れている'],
        bad: ['金具だけがやけに光っている', '軸の糊がまだ匂う'] },
    ],
  },
  tsuba: {
    label: '鍔',
    names: ['鉄地 雁透かし鍔', '鉄地 波千鳥鍔', '鉄地 月に薄鍔', '鉄地 竹透かし鍔'],
    author: '金工 正吉郎',
    spots: [
      { name: '鉄肌', x: 30, y: 62,
        good: ['鉄肌に紫がかった落ち着いた光', '鎚の跡が残り、手に重い'],
        bad: ['赤い錆が粉を吹いている', '鋳物らしいザラつきがある'] },
      { name: '銘', x: 68, y: 66,
        good: ['鏨が一気に打たれて迷いがない', '銘の溝の中まで古い錆が入る'],
        bad: ['銘の溝だけ新しく光る', '字がきれいすぎて刻みが浅い'] },
      { name: '透かし', x: 50, y: 30,
        good: ['透かしの角に手仕事の揺らぎ', '角が使い込まれて減っている'],
        bad: ['角が全部同じ型で抜いたよう', '透かしの縁にバリが残る'] },
    ],
  },
  watch: {
    label: '懐中時計',
    names: ['銀側 二重蓋懐中時計', '琺瑯文字盤 懐中時計', '鉄道員用 懐中時計', '金張り 懐中時計'],
    author: '時計師 ルカ・ブラン',
    spots: [
      { name: '文字盤', x: 50, y: 52,
        good: ['陶の文字盤に細かな貫入がある', '数字の手描きが一つずつ違う'],
        bad: ['数字が印刷のように均一', '文字盤が紙の貼りもの'] },
      { name: '裏蓋', x: 26, y: 74,
        good: ['刻印が摩耗して角が丸い', '番号が機械の番号と一致する'],
        bad: ['刻印だけくっきり新しい', '番号が機械の番号と合わない'] },
      { name: '機械', x: 74, y: 30,
        good: ['テンプが澄んだ音で刻む', '香箱に古い手入れの跡がある'],
        bad: ['中身が新しい電池式に替わっている', 'ねじ山が全部なめている'] },
    ],
  },
  toy: {
    label: 'ブリキ玩具',
    names: ['ゼンマイ歩行ロボ', '火花ロボ 二号', '宇宙警備ロボ', '月面探検ロボ'],
    author: '浅草 三ツ星玩具',
    spots: [
      { name: '塗装', x: 50, y: 42,
        good: ['印刷の網点が肉眼で見える', '光の当たる面だけ色褪せている'],
        bad: ['色が新しい印刷のように滑らか', '全面が均一に褪せている'] },
      { name: '刻印', x: 40, y: 82,
        good: ['足裏に当時の輸出刻印がある', '爪に一度だけ曲げた跡がある'],
        bad: ['刻印の字体が当時と違う', '爪を何度も開けた跡がある'] },
      { name: 'ゼンマイ', x: 76, y: 56,
        good: ['巻くと油切れの渋い音がする', '鍵の摩耗が穴と合っている'],
        bad: ['鍵だけ新品で穴に合わない', '軽すぎて歯車の手応えがない'] },
    ],
  },
  koban: {
    label: '小判',
    names: ['慶長小判', '元禄小判', '享保小判', '天保小判'],
    author: '金座 後藤',
    spots: [
      { name: '極印', x: 50, y: 30,
        good: ['極印の打ち込みが深い', '花押の線が鋭く残る'],
        bad: ['極印の輪郭が丸くダレている', '花押が鋳型で写したように甘い'] },
      { name: '茣蓙目', x: 40, y: 58,
        good: ['茣蓙目が一本ずつ手で打たれている', '茣蓙目の幅が場所ごとに違う'],
        bad: ['茣蓙目が定規で引いたように揃う', '茣蓙目が浅く鋳肌が見える'] },
      { name: '重み', x: 62, y: 76,
        good: ['掌に乗せると見た目より重い', '天秤がぴたりと規定に合う'],
        bad: ['見た目より軽い', '磁石にわずかに吸いつく'] },
    ],
  },
};
export const CATEGORY_IDS = Object.keys(CATEGORIES);

// 客。odds は位の出やすさ、askFrac は言い値、floorFrac は言い値のうち譲れる底。
export const CUSTOMERS = {
  granny: {
    name: '蔵じまいの千代さん', look: 'granny', patience: 3, weight: 1,
    repWeight: 0.45, // 信用が高いほど来る
    odds: { fake: 8, copy: 34, real: 47, gem: 11 },
    askFrac: [0.14, 0.26], floorFrac: [0.6, 0.8], basis: 'ifReal',
    greet: ['主人の蔵を片付けておりましてね。値打ちなんて分かりませんの。', '孫に譲るほどの物でもなくて。少しでもお値がつけば。'],
    near: ['あら、もう少しだけ、いかがでしょう。'], far: ['それでは主人に申し訳なくて。'],
    accept: ['ありがとうございます。助かりますわ。'], leave: ['今日はやめておきましょうね。'],
  },
  collector: {
    name: '蒐集家の黒田氏', look: 'collector', patience: 3, weight: 1, repWeight: 0.2,
    odds: { fake: 4, copy: 26, real: 58, gem: 12 },
    askFrac: [1.0, 1.25], floorFrac: [0.68, 0.85], basis: 'believed',
    greet: ['手放すのは惜しいが、棚が満杯でね。相場は承知している。', '素人相手なら売らないところだ。分かる値をつけてくれ。'],
    near: ['ふむ、あと一声だ。'], far: ['君、私を誰だと思っている。'],
    accept: ['良かろう。大事にしてくれたまえ。'], leave: ['話にならん。失礼する。'],
  },
  broker: {
    name: '口八丁の仲買 辰', look: 'broker', patience: 3, weight: 1.4, repWeight: -0.3,
    odds: { fake: 50, copy: 33, real: 15, gem: 2 },
    askFrac: [0.55, 0.8], floorFrac: [0.42, 0.62], basis: 'ifReal',
    greet: ['旦那、いい出物ですよ。今日中なら他に回さない。', '鑑定書は今ちょっと手元にないが、本物は本物だ。'],
    near: ['へへ、旦那には敵わないな。もうひと声。'], far: ['冗談きついや。それじゃ運び賃にもならねえ。'],
    accept: ['毎度あり！ 返品は受けませんぜ。'], leave: ['他を当たらせてもらいますよ。'],
  },
  youth: {
    name: '金欠の遥斗くん', look: 'youth', patience: 2, weight: 1.2, repWeight: 0,
    odds: { fake: 30, copy: 36, real: 29, gem: 5 },
    askFrac: [0.24, 0.42], floorFrac: [0.5, 0.72], basis: 'ifReal',
    greet: ['じいちゃんの押入れにあって。明日までにお金が要るんです。', 'これ、高いやつだと思うんですけど、急いでて。'],
    near: ['えっと、あと少しなんとか。'], far: ['さすがにそれは、ないです。'],
    accept: ['やった、助かります！'], leave: ['ごめんなさい、他を探します。'],
  },
  clearing: {
    name: '遺品整理の小田さん', look: 'clearing', patience: 1, weight: 1, repWeight: 0,
    odds: { fake: 36, copy: 38, real: 23, gem: 3 },
    askFrac: [0.14, 0.3], floorFrac: [0.75, 0.95], basis: 'ifReal',
    greet: ['次の現場があるんで、一声で決めてください。', 'こっちは処分料が浮けばいいんで。一回きりでお願いします。'],
    near: ['うーん、時間切れです。'], far: ['じゃ、処分場に回します。'],
    accept: ['はい毎度。次行きます。'], leave: ['じゃ、処分場に回します。'],
  },
  lord: {
    name: '蔵の主 鷹司翁', look: 'lord', patience: 3, weight: 0, repWeight: 0,
    odds: { fake: 28, copy: 22, real: 38, gem: 12 },
    askFrac: [0.2, 0.32], floorFrac: [0.6, 0.78], basis: 'ifReal',
    greet: ['噂を聞いて来た。この一点、お前の眼に預けてみたい。'],
    near: ['もうひと押しだ。眼があるなら出せるはずだ。'], far: ['その程度の眼か。'],
    accept: ['決まりだ。あとは市が答えを出す。'], leave: ['縁がなかったな。'],
  },
};

export const REACTIONS = {
  cash: '手持ちが足りません。',
  zero: '算盤を弾いて、値を示してください。',
  thirdLook: 'もう少し見せてもらう。客の我慢が1減ります。',
};

// 鑑定人。fee は呼ぶ代金、err は値段の振れ幅、acc は位を当てる確率。
export const APPRAISERS = {
  inkyo: {
    name: '隣の隠居 金さん', look: 'inkyo', fee: 1000, err: 0.5, acc: 0.72, loud: true,
    note: '安いが声が大きい。高いと言えば客にも聞こえる',
    say: (g, lo, hi) => `おーい！ こりゃ${g}だな！ ${lo}から${hi}ってとこだ！`,
  },
  banto: {
    name: '番頭 お照さん', look: 'banto', fee: 6000, err: 0.28, acc: 0.9,
    note: '奥で静かに見る。客には聞こえない',
    say: (g, lo, hi) => `小声で失礼します。${g}と見ました。${lo}から${hi}かと。`,
  },
  sensei: {
    name: '土橋先生', look: 'sensei', fee: 5000, err: 0.08, acc: 1, specialist: true,
    note: '本日の専門だけは正確。専門外は呼べない',
    say: (g, lo, hi) => `これは${g}です。論文にも書きましたが、${lo}から${hi}でしょう。`,
  },
  oracle: {
    name: '千里眼のおウメ', look: 'oracle', fee: 3000, err: 0, acc: 1, cut: 0.2, quiet: true,
    note: 'ぴたりと当てる。呼べるのは五日で2回、買えば売値の2割も取られる',
    say: (g, lo) => `${g}じゃ。市では${lo}。買うなら売値の二割、もらうよ。`,
  },
};
export const APPRAISER_IDS = Object.keys(APPRAISERS);

// 結果の称号。上から順に判定する。
export const TITLES = [
  { id: 'bankrupt', name: '暖簾をたたんだ人', line: '店賃が払えず、看板を下ろした。', test: (f) => f.bankrupt },
  { id: 'master', name: '天下の目利き', line: '眼も信用も、町でいちばん。', test: (f) => f.cash >= 3000000 && f.rep >= 3 },
  { id: 'tycoon', name: '人でなし大尽', line: '蔵は金で満ちたが、挨拶する人はいない。', test: (f) => f.cash >= 3000000 },
  { id: 'trusted', name: '町いちばんの眼', line: '千代さんが孫を連れて来るようになった。', test: (f) => f.cash >= 1000000 && f.rep >= 3 },
  { id: 'shark', name: '買い叩きの名人', line: '儲かった。ただ、夜道は少し怖い。', test: (f) => f.cash >= 1000000 },
  { id: 'town', name: '堅実な古物商', line: '派手さはないが、暖簾は続く。', test: (f) => f.cash >= 300000 },
  { id: 'novice', name: '勉強代の人', line: '授業料は高かった。眼は少し育った。', test: () => true },
];

export const VENDOR_NOTE = '人物、作者、作品名はすべて架空です。';
