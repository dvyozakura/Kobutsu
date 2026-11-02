# 眼福堂

持ち込まれた品に算盤で値をつけ、日暮れの市で本当の値段を知る古物商ゲーム。五日間、店賃を払い続けて手持ちを増やします。

- 品の部分を見て手がかりを読む（2か所まで無料、3か所目は客の我慢を使う）
- 鑑定人を呼ぶ。隠居は安いが大声で、客に聞かれると言い値が上がる
- 客の底値は見えない。安く叩きすぎると帰られ、千代さんを買い叩くと信用が落ちる

## 公開手順

1. リポジトリの Settings → Pages → Source を **GitHub Actions** にする
2. このフォルダ一式を `main` に push する（隠しフォルダ `.github` を忘れない）
3. Actions の「Deploy to GitHub Pages」が緑になれば公開完了

X共有カードのURLは、デプロイ時に `__PAGES_URL__` が公開URLへ自動で置き換わります。

## 開発

ビルドは不要です。ESモジュールなのでローカルでは `python3 -m http.server` などで開きます。

- `js/data.js` 値と文章。調整はここだけで済みます
- `node tools/sim.mjs` ボットで難易度を測る
- `?seed=123` で乱数を固定する
- `python3 tools/make-cards.py` 共有カードを作り直す（称号を変えたとき。カードの `?v=` も上げる）
- 文字を増やしたら `python3 tools/subset-fonts.py <google/fontsのoflフォルダ>` でフォントを作り直す

## 素材

絵はコード生成のSVG、音はWeb Audioの合成です。フォントは Dela Gothic One と Shippori Antique（ともにSIL OFL 1.1、全文は `fonts/`）。人物、作者、作品名はすべて架空です。
