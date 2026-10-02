# INCPT Wallet — motion reel

> **Interface update (Oct 2026):** INCPT Wallet has a new interface, so every asset built from the old UI was removed:
> - the old screenshots (`assets/screens` and the first `assets/app`);
> - the staking prototype and the top-up beta video;
> - every cut-out, slot, page and manifest made from them.
>
> What is left:
> - the brand logo and the phone mockup (`assets/build`: `phone_*`, `dynamic_island`, `logo*`);
> - all code (engine, tutorial toolkit, builders);
> - the four finished renders in `renders/`, which show the old UI.
>
> No reel below re-renders until it is rebuilt from the new interface material (now in `assets/app`, see below). The old files are still in git history.

A 27.5 s, 1080×1920 @ 30 fps promo reel for the INCPT Wallet Telegram mini app (AI crypto wallet and crypto cards). Its pacing follows the editing language of the Tangem 6.1 "Address Book" reel, with INCPT's own look:
- a slow holographic foil background in the INCPT logo palette (mint, sky, periwinkle, lavender, lilac)
- heavy, word-by-word headlines
- real UI elements lifting off a titanium phone mockup
- whip transitions with real motion blur
- a 96 BPM edit

**Output:** `renders/incpt_wallet_reel.mp4` (14 Mbps master) and `renders/incpt_wallet_reel_preview.mp4` (under 25 MB, for messengers)

## Script (RU, on-screen)

| Time | Headline | Picture (real UI only) |
|---|---|---|
| 0.0 | ОПЛАТИТЬ ПОДПИСКУ С КРИПТЫ? | Subscription payments float in parallax: After Effects, APPLE.COM/BILL, HIGGSFIELD |
| 2.5 | И БЕЗ KYC? | The payments settle into a frosted tray, and one is tapped |
| 5.0 | INCPT WALLET | Drop. The phone rises with the home screen. Получить/Отправить lift off |
| 7.5 | КАРТА В ОДИН КЛИК | Card-issue sheet. The card flies out. Tap on «Оформить карту · $50» |
| 9.4 | БЕЗ KYC | The «OneClick MasterCard NoKYC» title lifts off |
| 10.6 | APPLE PAY И GOOGLE PAY | Both ✓ rows lift off |
| 12.5 | ПОПОЛНЯЙ → ПЛАТИ → ВЫВОДИ | My cards: top-up tap and the +$22 row, payments fan out, withdraw tap |
| 16.25 | ПО ВСЕМУ МИРУ | Holo card in 3D with a stream of real transactions |
| 18.75 | ВСЁ ПРЯМО В TELEGRAM | Home screen scrolls through balance → cards → operations. The Telegram header lifts |
| 22.3 | INCPT WALLET · AI-КРИПТОКОШЕЛЁК И КАРТЫ | End card in the INCPT IO brand-sheet style on off-white: the logo flies in from depth, then «INCPT WALLET» (WALLET in the logo gradient), a tracked tagline, and a «Доступен в Telegram» badge |

The copy uses only claims that are visible in the app: OneClick, NoKYC, Apple/Google Pay, «онлайн-платежи по всему миру», and the Telegram mini app. "AI" comes from the product positioning.

## Reel 2 — staking announcement (RU)

`renders/incpt_staking_announce.mp4` (+ `_preview.mp4`), 27 s, calm cut at 80 BPM with its own
warm electric-piano track (`sound.py` style `calm`). Built as a short how-to: every big line has a
plain-language subline. The UI is cut out of the team's prototype (`assets/staking/source/prototype.mp4`,
`tools/build_staking.py`), never redrawn; the $100 → $600 counter plays the prototype's own 19 in-between frames.

| Time | Headline / subline | Picture |
|---|---|---|
| 0.0 | СТЕЙКИНГ USDT / Новое в INCPT Wallet | The vault drifts in from depth; staking UI floats around it |
| 3.0 | 20–40% ГОДОВЫХ / Ваши USDT начинают приносить доход | Phone rises with the staking screen, the vault lifts off |
| 5.25 | ВЫПЛАТЫ КАЖДЫЙ ДЕНЬ / Профит начисляется ежедневно | «+$161.00 сегодня» lifts |
| 7.5 | ШАГ 1 ВЫБЕРИТЕ СУММУ / От $10 до $20 000 | Amount panel lifts, tap on +$500, counter $100 → $600 |
| 11.25 | +$180 ЗА ГОД / Пример: $600 → ≈ $780 через год | «Через год получите ≈ $780 · профит +$180» lifts |
| 13.5 | ШАГ 2 ОДИН ТАП / Нажмите «Открыть стейкинг» | Same phone: the button lifts, tap |
| 16.5 | ГОТОВО — ДЕПОЗИТ РАБОТАЕТ / $600 USDT под 20–40% годовых | «Стейкинг открыт», check + «$600 USDT» card |
| 18.75 | ВЫВОД В ЛЮБОЙ МОМЕНТ / Пополнение и вывод без блокировки средств | Checklist rows lift |
| 22.5 | INCPT WALLET · СТЕЙКИНГ USDT · 20–40% ГОДОВЫХ | Brand end card + «Доступен в Telegram» |

```bash
python3 tools/build_staking.py
node tools/render.mjs video --workers 3 --reel staking      # -> out/staking/
python3 tools/sound.py out/staking
bash tools/finalize.sh renders/incpt_staking_announce.mp4 out/staking
```

## Reel 3 — top-up tutorial (RU, 1:1)

`renders/incpt_topup_tutorial.mp4` (+ `_preview.mp4`), 1080×1080, 40.5 s, calm track in F (80 BPM).
Rebuilt from the team's beta (`assets/topup/source/beta.mp4`); editing reference: a MetaMask card tutorial
(`reference/`, not committed). The UI is cut out of the beta frames (`tools/build_topup.py`: every screen is aligned
to the Telegram sheet edge, the beta's island/recording outline is painted out, one clean status bar for all states).

Instruction design, all in the INCPT logo's foil colours:
- **Pointer** — an arrowhead with the logo boomerang's concave back, foil-filled with a white outline; it glides between targets and presses.
- **Highlight** — a rotating foil ring around the target, with the rest of the screen dimmed.
- **Tap** — foil ripples.
- **Progress** — a glass step card: «ШАГ N ИЗ 5», foil progress bar, heading, plain-language explanation.

| Time | Step | On the phone |
|---|---|---|
| 0.0 | ИНСТРУКЦИЯ · КАК ПОПОЛНИТЬ КОШЕЛЁК · 5 простых шагов | Logo spins in |
| 3.0 | 1 · ОТКРОЙТЕ КОШЕЛЁК | Pointer flies in, ring on the round wallet tab, tap → wallet screen |
| 9.0 | 2 · НАЖМИТЕ «ПОЛУЧИТЬ» | Ring + tap on «Получить», the «Пополнение криптовалюты» sheet slides up |
| 15.0 | 3 · ВЫБЕРИТЕ МОНЕТУ | Ring walks Tether → USDC → Ethereum → Bitcoin, back to Tether, tap → push to the QR page |
| 22.5 | 4 · ВЫБЕРИТЕ СЕТЬ | TRC-20 / ERC-20 toggle lifts (tap TRC-20), then the app's own warning lifts |
| 28.5 | 5 · СКОПИРУЙТЕ АДРЕС | Address row lifts, tap on the copy icon; then the QR code is highlighted |
| 34.5 | INCPT WALLET · ПОПОЛНИТЬ КОШЕЛЁК СТАЛО ПРОЩЕ | End card + «Доступен в Telegram» |

```bash
python3 tools/build_topup.py
node tools/render.mjs video --workers 3 --reel topup        # -> out/topup/
python3 tools/sound.py out/topup
bash tools/finalize.sh renders/incpt_topup_tutorial.mp4 out/topup
```

## Reel 4 — app tour «Знакомство с INCPT Wallet» (RU, 9:16)

`renders/incpt_tour_tutorial.mp4` (+ `_preview.mp4`), 1080×1920, 57 s, calm track in G (80 BPM). The first video in the tutorial series.
All tutorials from here on are 9:16 (Reels). The step card sits at the top, and the phone sits under it, clear of the caption area.
- **Step card:** «РАЗДЕЛ N ИЗ 5», the section's real tab icon, its name and one plain-language line per beat.
- **Pointer, foil ring and taps:** `src/tutorial.js`, shared with reel 3.

| Time | Section | On the phone |
|---|---|---|
| 0.0 | ИНСТРУКЦИЯ · ЗНАКОМСТВО С INCPT WALLET · 5 разделов приложения за минуту | Logo spins in |
| 3.0 | НИЖНЕЕ МЕНЮ | The tab bar lifts off the dimmed screen, a label pops on every tab |
| 8.25 | 1 · ГЛАВНАЯ | Balance lifts; ring on Получить / Отправить; the page scrolls: DeFi wallet → card → operations |
| 18.75 | 2 · КАРТЫ | Tap on the cards tab; the action row lifts; the finger swipes card #2 away to «Добавить карту» |
| 28.5 | 3 · КОШЕЛЁК | Tap on the round centre button; the ring walks USDT → USDC → ETH → BTC |
| 36.0 | 4 · СТЕЙКИНГ | Tap on Stake; the app's own «Скоро» card lifts |
| 40.5 | 5 · ПРОФИЛЬ | Tap on the profile; Telegram ID / Email; PIN, биометрия, сид-фраза lift; scroll to language and support |
| 51.0 | INCPT WALLET · ВАШ КРИПТОКОШЕЛЁК В TELEGRAM | End card + «Доступен в Telegram» |

```bash
python3 tools/import_app.py reference/app/IMG_2489.pdf     # (old UI, since removed) screenshots -> assets/app
python3 tools/build_tour.py
node tools/render.mjs video --workers 3 --reel tour         # -> out/tour/
python3 tools/sound.py out/tour
bash tools/finalize.sh renders/incpt_tour_tutorial.mp4 out/tour
```

## Reel 5: product promo on the new interface (RU, 9:16)

`renders/incpt_promo.mp4` (+ `_preview.mp4`), 1080×1920, 29 s.

It follows the editing language of the first reel at a faster cut, to a new 120 BPM track (`sound.py` style `drive`):
- four-on-the-floor kick, rolling 16th bass, supersaw stabs, 16th hats;
- an arp from the third bar;
- crashes and snare fills on every section change.

Every claim on screen is visible in the app.

| Time | Headline | Picture (new UI only) |
|---|---|---|
| 0.0 | КРИПТА · КАРТЫ · СТЕЙКИНГ · В ОДНОМ МЕСТЕ | One word per beat; coin rows, the card, the safe and «20–40% APY» fly in, then fall into one point |
| 4.0 | INCPT WALLET | Drop. The phone rises with the home screen; the total balance lifts |
| 7.0 | АКТИВЫ ПОД ЗАЩИТОЙ | Wallet: the shield leaves the screen, the page scrolls, the five coins fan out |
| 10.0 | ПОЛУЧАЙ · ОБМЕНИВАЙ · ОТПРАВЛЯЙ | One action button per beat; tap on «Обменять» |
| 12.0 | ОБМЕН В ОДИН ТАП | Swap screen: the panels lift and trade places on each tap of the arrows button |
| 15.0 | ВИРТУАЛЬНЫЕ И МЕТАЛЛИЧЕСКИЕ КАРТЫ | The card holder leaves the screen |
| 16.5 | ПЛАТИ КРИПТОЙ | The card lifts; the real operations fan out under it (USDT → card, top-up, Starbucks, Nike) |
| 18.0 | СТЕЙКИНГ 20–40% APY | The safe, the APY badge and «прогноз $14.42 сегодня» lift |
| 21.0 | ВСЁ ПРЯМО В TELEGRAM | Home scrolls from the balance to the operations |
| 23.0 | INCPT WALLET · AI-КРИПТОКОШЕЛЁК И КАРТЫ | End card + «Доступен в Telegram» |

```bash
python3 tools/build_promo.py
node tools/render.mjs video --workers 3 --reel promo        # -> out/promo/
python3 tools/sound.py out/promo
MAXRATE=12 bash tools/finalize.sh renders/incpt_promo.mp4 out/promo
```

## How-to series on the new interface (RU, 9:16)

Six tutorials in `renders/incpt_howto_*.mp4` (+ `_preview.mp4`), each on the calm 80 BPM track in its own key:

| Reel | Video | Steps |
|---|---|---|
| `howto_topup` | Как пополнить кошелёк, 44 s | wallet → «Получить» → coin → network (the address changes with it, warning) → copy / QR / «Поделиться» / Telegram ID |
| `howto_swap` | Как обменять криптовалюту, 40.5 s | wallet → «Обменять» → give / get, ⇅ → amount, 25 / 50 / 75 % / Макс → rate and fees → «Обменять» |
| `howto_send` | Как отправить криптовалюту, 40.5 s | wallet → «Отправить» → coin → network, address or Telegram ID, scan → keypad / MAX → «Отправить» |
| `howto_stake` | Как открыть стейкинг, 40.5 s | Stake → total and forecast → amount, +$50 / +$100 / +$500 / Макс → 20–40% APY, one-year line → «Открыть стейкинг» → «Ваши депозиты» |
| `howto_cards` | Ваши карты INCPT, 31.5 s | cards → balance and today's movement → the card → «Добавить карту» |
| `howto_profile` | Профиль и безопасность, 27.5 s | profile → Telegram ID, Email → PIN, биометрия, сид-фраза |

The phone runs on the screens of `assets/app`. The pages switch the way the app does:
- tab fade;
- iOS push;
- sheet sliding up over the dimmed wallet;
- in-place swap for TRC-20 / ERC-20;
- page scroll.

Each tutorial is one `howto({...})` call in `src/scenes_howto_<name>.js`, holding the copy, the screen flow, the highlights, the lifts and the pointer path. The engine lives in `src/howto.js`; the shared assets come from `tools/build_howto.py` (`assets/manifest_howto.json`).

**«Открыть стейкинг».** In every screenshot the tab bar covers this button, so `build_howto.py` rebuilds it whole: the button's own top rows and grey, a mirrored bottom edge, and the label re-set in Inter at the measured size.

```bash
python3 tools/build_howto.py
node tools/render.mjs video --workers 3 --reel howto_topup   # -> out/howto_topup/
python3 tools/sound.py out/howto_topup
bash tools/finalize.sh renders/incpt_howto_topup.mp4 out/howto_topup
```

## Instagram reels (RU, 9:16, 11 s)

`renders/incpt_ig_card.mp4`, `incpt_ig_stake.mp4` and `incpt_ig_swap.mp4` (+ `_preview.mp4`). Covers and ready post texts are in `renders/instagram/`.

All three share one 120 BPM drive track in a different key for each, and one layout:
- **Structure:** a hook before the drop at 2 s, three sections of 2 s each, then the brand end card at 8 s.
- **Motion:** every lifted piece swells on the beat.
- **Safe areas:** headlines from y 240; products between y 600 and 1500, clear of Instagram's caption and buttons.

| Reel | Hook → sections |
|---|---|
| `ig_card` | A USDT coin spins and, edge-on, becomes the INCPT card on the drop → ПОПОЛНИ ИЗ USDT → ПЛАТИ КАРТОЙ INCPT (Starbucks, Nike) → ВИРТУАЛЬНАЯ ИЛИ МЕТАЛЛИЧЕСКАЯ (the card slides into the holder) |
| `ig_stake` | USDT coins orbit and pour in, the safe slams down on the drop → 20–40% ГОДОВЫХ → ДОХОД КАЖДЫЙ ДЕНЬ (daily forecast, coins rising) → ВЫВОД В ЛЮБОЙ МОМЕНТ (Liquid Vault) |
| `ig_swap` | The five coins orbit in, then collapse into the swap panels on the drop → ОБМЕН В ОДИН ТАП → КУРС И КОМИССИИ СРАЗУ ВИДНЫ → ПОЛУЧАЙ · ОБМЕНИВАЙ · ОТПРАВЛЯЙ |

```bash
python3 tools/build_promo.py && python3 tools/build_howto.py && python3 tools/build_ig.py
node tools/render.mjs video --workers 3 --reel ig_card      # -> out/ig_card/
python3 tools/sound.py out/ig_card
bash tools/finalize.sh renders/incpt_ig_card.mp4 out/ig_card
```

### App screen library (`assets/app/`): new interface

There are 17 screenshots of the new interface (Telegram header «INCEPTION mini app»), 920×2000, ready for the phone mockup:

| Section | Pages |
|---|---|
| Home | `home`, `home_s1` |
| Cards | `cards`, `cards_s1` |
| Wallet | `wallet`, `wallet_s1` |
| Coin sheets | `send_pick`, `receive_pick` |
| Send | `send` |
| Receive | `receive_trc20`, `receive_erc20` |
| Swap | `swap`, `swap_s1` |
| Staking | `stake`, `stake_s1`, `stake_s1_alt` |
| Profile | `profile` |

`pages.json` lists the pages and the ones with «< Back».

The team raised the balances in an AI editor, and that pass left artefacts. `tools/import_app.py` (PDF in git-ignored `reference/app_v2/`) removes them deterministically:

| AI artefact | Fix |
|---|---|
| A halo around every glyph and icon (over-sharpening) | De-ringing on neutral text and line icons only; coloured shapes such as card logos are left alone |
| JPEG mottling | Smoothed in flat areas |
| Staking deposits: tab bar 35 px low | Content and bar moved up |
| Wallet top: coin list squeezed (row pitch 147 px instead of 176), tab bar off-screen | Rebuilt under its hero from `wallet_s1`, which has the true geometry; this also fixes the BTC row, where $84,000.01 contradicted 0.5 BTC = $41,996.01 |
| Time and battery differ per screenshot | One status bar (16:48, 27 %) and one Telegram header (Close / Back) for all pages |
| QR codes undecodable and full of holes | Crisp, valid QR with a demo payload (`INCPT WALLET DEMO TRC-20/ERC-20`), so a scanned frame never yields an address |
| Big balances redrawn with a slab-footed «1» | `$148,450.75` and `$103,450.75` re-set in Inter 600, the app's font (`tools/textpng.mjs`) |

`out/app_clean/sheet.jpg` shows every page before | after.

## Pipeline

```
assets/screens/*.jpg        real app screenshots (source of truth — never redrawn)
tools/build_assets.py       phone mockup, alpha cut-outs with contour shadows, stitched scroll page
src/engine.js               seekable timeline: easing, 3D nodes, phone, tap, headlines, background
src/common.js               shared helpers + brand end card
src/scenes.js               reel 1 edit (all timing lives here, beat = 0.625 s)
src/scenes_staking.js       reel 2 edit (?reel=staking)
src/scenes_topup.js         reel 3 edit, 1:1 (?reel=topup)
src/tutorial.js             tutorial toolkit: foil ring + spotlight, lift rings, pointer with taps / drags
src/scenes_tour.js          reel 4 edit, 9:16 app tour (?reel=tour)
src/scenes_promo.js         reel 5 edit, product promo on the new interface (?reel=promo)
tools/build_promo.py        promo cut-outs, mattes of the 3D illustrations, stitched pages
src/howto.js                how-to engine (9:16): step card, screen flow, scrolls, lifts, pointer
src/scenes_howto_*.js       one tutorial each (?reel=howto_topup, howto_swap, ...)
tools/build_howto.py        how-to overlays, coin sheets, stitched pages, cut-outs and highlight rects
src/ig.js                   Instagram reels: timing, beat swell, titles, cue set; src/scenes_ig_*.js one reel each
tools/build_ig.py           Instagram manifest (promo + how-to cut-outs) and the five coin icons
tools/import_app.py         app screenshots (PDF) -> assets/app, AI artefacts cleaned
tools/render.mjs            headless Chromium → sub-frame motion blur → ffmpeg (parallel workers)
tools/sound.py              procedural music (96 BPM tech / 80 BPM calm / 120 BPM drive) + SFX from the timeline's cue list
tools/finalize.sh           concat + grain + sharpen + AAC mux → H.264 mp4
```

```bash
npm install && pip install pillow numpy scipy
npm run assets                 # rebuild bitmaps from the screenshots
node tools/render.mjs stills 5.2,9.8 --mb   # check single frames (out/stills)
npm run sheet                  # contact sheet of the whole edit (out/)
npm run render                 # full render → out/seg/*.mkv + out/cues.json
npm run sound                  # soundtrack from cues → out/soundtrack.wav
npm run final                  # → renders/incpt_wallet_reel.mp4
```

The renderer expects Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Override it with `CHROME=/path/to/chrome`.

**Motion blur.** Every frame is sampled at both ends of a 180° shutter. When the two samples differ, 3–40 sub-frames are averaged, in proportion to how much moved. Holds cost one capture; whip-pans get the full smear.
