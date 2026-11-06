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

## The incpt.io brand on the older reels (2026-11-06)

Andreas approved the welcome and presale cuts in the incpt.io style («Нормально») and asked for everything else in it.
The promo, the six how-tos and the three Instagram reels now render in a brand mode of the shared engine.
`window.BRAND` covers `promo`, `howto_*` and `ig_*`:
- **Canvas:** `#faf9f5` instead of the foil.
- **Headlines:** the site's type in navy, in sentence case; `~word` puts a word in the site's gradient; no foil bands.
- **Mark:** the chrome mark with a soft shadow, no spin, no sheen.
- **End card:** `brandEnd` in `src/common.js`, with the site's lock-up, a grey tagline and a white Telegram badge.
- **How-to step card:** white, with the gradient progress and highlight ring.
- **Time scale:** `window.TS` runs a whole reel slower, cues included, so nothing is rushed. The Instagram reels run at half speed (4 s sections, 20 s); the promo runs a third slower (4 s sections, 36 s).
- **Music:** generated tracks cut to each reel (`assets/music/*_edit.json`):
  - `ig_a` (120 BPM): its own build and drop land on the Instagram reels';
  - `howto_a` (90 BPM): the how-tos, each a whole number of bars shorter from the middle, so the ending lands on the reel's;
  - the welcome track (90 BPM): the promo.
- **Sound effects:** only quiet functional cues stay over the music (`META.sfxOnly`).
- **Staking:** «от 20 до 100% годовых» across the three plans. The app's Liquid Vault screen still reads 20–40% APY for that plan.

## Instagram films in real 3D (RU, 9:16) — current

They replace the three reels below, which shared one template, one song and flat vector models.
Each film is built anew: its own concept, its own song and light, its own motion and type animation.
All three use real 3D (three.js) and Liquid Glass, and every number and line on screen comes from the app.

| Film | Length | World | Story |
|---|---|---|---|
| `x_card` | 22 s | Airy and pastel. Its own 110 BPM track: a shimmering intro, then a soft drop. | USDT coins spiral into a Liquid Glass lens, and the INCPT card comes out of it on the drop → the app's rows −$5,025 (ERC-20) and +$5,000 → Starbucks −$18.50 and Nike −$249.90 as the card dips for a tap → the metal card joins («Виртуальные и металлическая») → the cards part for the end card. |
| `x_stake` | 26 s | Warm. The app's safe in 3D, lit like black chrome with a gold side. Its own 92 BPM track: it breathes before the drop and ends on a ringing chord. | A macro on the dial, which ticks on every beat → the camera pulls back to the whole safe on the drop → the Liquid, Monthly and Maximum tiles snap in on the beats («От 20 до 100% годовых») → the app's deposit card (20,000.00 USDT) counts its forecast up to $14.42. |
| `x_swap` | 18 s | Cool and kinetic from the first frame. The unused second take of the 120 BPM track, which ends on its own stop. | USDT and BTC orbit as a pair and trade places on the drop → they dock into the app's swap screen in glass → 50% types in 20,000.20 of the real 40,000.40 USDT → the app's fee lines, «Комиссия обмена — в курсе» → the screen turns away like a page. |

The 3D kit is `src/kit3d.js`, loaded for `x_*` and `lab3d*` reels by a module loader in `index.html`:
- **Studio:** an environment of soft boxes, set per film:
  - neutral for the card;
  - for the safe, an amber wall, a cool strip, a black flag and a dark horizon, so polished dark metal reads as in the app;
  - soft shadows on an invisible backdrop or floor.
- **Card:** the app's card, with the oil-slick foil (colours sampled from the app's card), a brushed grain, rounded and bevelled corners, the print in Inter and the Mastercard mark. The metal card is brushed graphite.
- **Safe:** the staking screen's safe, with a chrome body, an inset door, a dial with 72 ridges and the INCPT mark (traced from the logo), gold hinges and feet.
- **Coins:** a reeded edge, raised rims and enamel faces.
- **Liquid Glass:** refracting slabs with a rounded rim, a milky layer for legibility and the app's UI printed on them; a biconvex lens. Live UI (counters, the selected chip) is redrawn on its canvas.
- **Layout:** `K3.L(px, py, z)` places things in frame pixels, so Instagram's safe areas hold at any depth.
- **Look tests:** `lab3d` (card, coins, glass) and `lab3d_safe` (the safe under the stake light).

```bash
node tools/render.mjs video --workers 3 --reel x_card       # -> out/x_card/
python3 tools/sound.py out/x_card
bash tools/finalize.sh renders/instagram/incpt_x_card.mp4 out/x_card
```

## Instagram reels (RU, 9:16, 11 s) — superseded by the films above

`renders/instagram/`: `incpt_ig_card.mp4`, `incpt_ig_stake.mp4` and `incpt_ig_swap.mp4` (+ `_preview.mp4`), with covers and ready post texts.

Every piece in them is vector, drawn in `src/vec.js` at (or above) its display size, so nothing is an upscaled screenshot:
- 3D coins with an edge and a sheen, with the USDT, USDC, BTC, ETH and TRON logos in SVG;
- the holographic and the metal card, with thickness and an iridescence that follows the turn;
- operation rows, the swap panels with ⇅, the rate table, chips, the Liquid Vault card and the action buttons, all with the app's own texts and numbers.

All three share one 120 BPM drive track in a different key for each, and one layout:
- **Structure:** a hook before the drop at 2 s, three sections of 2 s each, then the brand end card at 8 s.
- **Motion:** every lifted piece swells on the beat.
- **Safe areas:** headlines from y 240; products between y 600 and 1500, clear of Instagram's caption and buttons.

| Reel | Hook → sections |
|---|---|
| `ig_card` | A USDT coin spins and, edge-on, becomes the INCPT card on the drop → ПОПОЛНИ ИЗ USDT (coins pour into the card) → ПЛАТИ КАРТОЙ INCPT (Starbucks, Nike) → ВИРТУАЛЬНАЯ ИЛИ МЕТАЛЛИЧЕСКАЯ (the holographic and the metal card fan out) |
| `ig_stake` | USDT coins land on a stack on a turning platform → 20–40% ГОДОВЫХ (three stacks grow into a bar chart, $20,000 in staking) → ДОХОД КАЖДЫЙ ДЕНЬ (a coin per beat, +$14.42) → ВЫВОД В ЛЮБОЙ МОМЕНТ (Liquid Vault, coins fly out) |
| `ig_swap` | The five coins orbit in; USDT and BTC land in the swap panels on the drop → ОБМЕН В ОДИН ТАП (1,000 USDT ≈ 0.0119 BTC at the app's BTC price; ⇅ flips the coins) → КУРС И КОМИССИИ СРАЗУ ВИДНЫ → ПОЛУЧАЙ · ОБМЕНИВАЙ · ОТПРАВЛЯЙ |

```bash
python3 tools/build_promo.py && python3 tools/build_howto.py && python3 tools/build_ig.py
node tools/render.mjs video --workers 3 --reel ig_card      # -> out/ig_card/
python3 tools/sound.py out/ig_card
bash tools/finalize.sh renders/instagram/incpt_ig_card.mp4 out/ig_card
```

## New brand: style frames (RU, 9:16)

`renders/style/`: nine 1080×1920 frames in three directions for the redesign, and `board.jpg` with all of them labelled.
They are built from the new chrome logo render and the new interface (git-ignored `reference/app_v3/`).

| Direction | Look | Type |
|---|---|---|
| А · ХРОМ | Pearl white, ribbed glass (the logo's own texture), the chrome mark as the hero, lime → violet only in accents | Geologica |
| Б · НУАР | Deep black with the logo's iridescence running through it, wide white type, lime for numbers | Unbounded |
| В · КИСЛОТА | Lime and violet fields from the logo, huge condensed type, grid, stickers, tickers | Roboto Flex condensed |

```bash
python3 tools/build_style.py        # logo matte, UI pieces, the safe and shield mattes -> assets/style/
node tools/style_frames.mjs         # src/style/frames.html -> out/style/A1..C3.png
node tools/style_board.mjs          # -> renders/style/board.jpg
```

## The brand look: ХРОМ (chosen 2026-11-03)

The boss picked direction А · ХРОМ from the style frames. Every new film is made in it:

| | Rule |
|---|---|
| Field | **Plain white** (Andrew, 2026-11-04: «вместо полосок лучше просто белый фон»). The pearl flutes and iridescent bands of the first ХРОМ frames are retired; `LG.F.white = 1` draws a #ffffff canvas, and the glass still reads by its rim, specular line and shadow. |
| Glass | Liquid glass, like the app's own tab bar: clear lenses (rim refraction, chromatic edges, a thin specular line), frosted slabs under UI, shapes that melt into each other and pinch apart. |
| Type | Superseded by the incpt.io row below (the first ХРОМ cuts used Geologica 800 uppercase). |
| Mark | The official chrome render (`assets/style/logo_chrome.png`), never redrawn, **never under glass**: no lens, slab or chip may refract or bend it. Where a lens sits behind it, the logo is drawn in front (`front: true` on the `LG` texture); otherwise it is a plain DOM image with a soft drop shadow. |
| Kit | `src/chrome.js`: `WText`, glass `chip`, `LiquidBody` (one glass body flowing through states that split, merge and jiggle), `liquidIntro` (drops melting into a lens), `chromeEnd` (lens + logo on it + title + tagline + glass pill + fine print), `glassWipe`. |
| Motion signature | The INCPT look in motion, also in `src/chrome.js`. The logo is a boomerang, so the motion is built on that:<br>• **arcs:** things fly in on boomerang arcs, spin, are caught with a small wobble and are thrown out again (`arcAt`, `flyEl`);<br>• **rib shutter:** chrome ribs at the logo's −28°, shaded like its tubes and tinted in its iridescence, fan across the frame and hide every big cut (`RibShutter`);<br>• **letter slams:** headlines slam in letter by letter, from big and blurred to sharp (`KText`);<br>• **numbers:** every number counts up to its value (`countTo`);<br>• **glints:** four-point glints flash on the chrome (`Glints`);<br>• **beat:** the frame pulses on the kick. |
| Icons | Flat line icons in the app's own icon language: a tinted rounded square with a thin glyph in the app's green, violet or blue. No 3D or chrome badges. |
| Brand, as on incpt.io | Taken from the site (screenshot of 2026-11-04), as CSS variables in `src/index.html`:<br>• **Wordmark:** INCPT in Poppins SemiBold, uppercase, +0.06 em tracking, navy.<br>• **Type:** text in Poppins; it has no Cyrillic, so Russian falls back to Montserrat, its closest geometric match. Headlines are sentence case, weight 600.<br>• **Colours:** navy `#132440` text, grey `#5c6270` secondary, canvas `#faf9f5`.<br>• **Gradients:** accent words in the site's text gradient `#a4c34f → #6fafa3 → #5ba7c4 → #7d97ce → #968cd3`; the button gradient is `#6aa94e → #4c9abb → #6577c1`. |
| Pacing | Premium but never static: one idea per scene and a change of motion on every beat or two, so the eye always has something new. Calm films (welcome) let the glass carry the cuts; promo films use the motion signature. |
| Music | Energetic, never a lullaby (the calm piano bed was rejected as sleepy). `tools/sound.py` has two styles for it. Both have a hook, a breakdown and build into a second drop, a moment of silence before each drop, a groove that keeps going under the end card, and the INCPT sound logo (a four-note «ta-DA-da-DAA» on the end card):<br>• `pulse`: bass house for promo cuts (120–128 BPM; four-on-the-floor, offbeat stabs, syncopated mid bass, vocal chops, a stutter edit into the CTA);<br>• `liquid`: liquid drum & bass at twice the film's tempo (90 BPM film → 180 BPM; two-step drums, reese bass, Rhodes), so every cut still lands on the beat.<br>Scenes place the sections with `META.build`, `META.drop2` and `META.stutter`. Mixed for phones: nothing under 32 Hz, a presence lift above 3 kHz, a limiter, about −13 LUFS. |
| Music, now | The synthesized beds read as sleepy (calm) or strange (pulse, liquid), so films now use original generated tracks (vidIQ, royalty-free), cut to the picture's beat grid with `tools/music_edit.py`. Serious and precise: a steady pulse, deep hits, clear sections. |

## Welcome reel in liquid glass (RU, 9:16)

`renders/welcome/incpt_welcome.mp4` (+ `_preview.mp4`, `cover_welcome.jpg`, `captions.md`), 1080×1920, 27 s, 90 BPM, on an original generated track
(vidIQ, `assets/music/welcome_a.mp3`). The track is cut on the picture's bars (`assets/music/welcome_edit.json`):
- take 1's piano intro;
- take 2's full beat from the drop at 5.33 s;
- take 1's riser, whose final hit lands on the end card at 22.0 s.
The first film in the new brand: direction А (pearl, ribbed glass, the chrome mark, Geologica) in Apple's liquid-glass
language, which the app's own tab bar and buttons already use. No Higgsfield credits: everything is drawn by the engine.

One glass body flows through the whole film and changes shape for every idea:

| Time | On screen | The glass |
|---|---|---|
| 0.0 | «Добро пожаловать в INCPT · Криптокошелёк и карты в Telegram» | five drops drift in and melt into a lens; the logo lands on it, sharp and unbent; two droplets pinch off |
| 5.3 | «КРИПТА И КАРТЫ В ОДНОМ МЕСТЕ» | the lens flows into a frosted slab; the phone rises onto it; Получить / Отправить / Обменять float off in glass chips |
| 9.3 | «14 МОНЕТ. ОДИН КОШЕЛЁК.» | a frosted column; the 14 coin rows of the wallet roll through it like a wheel |
| 12.7 | «КАРТА INCPT · Виртуальная и металлическая» | a glass case under the holographic card; a glass capsule sweeps over it and bends the foil |
| 16.0 | «LIQUID · MONTHLY · MAXIMUM · 20–100 % годовых в стейкинге» (all three plans, the range from the team) | a glass sphere; the safe from the app's own staking screen rests on it (not a generated one, never bent by the glass) |
| 19.3 | «И ЭТО ТОЛЬКО НАЧАЛО»: eSIM, Бизнес-лаунж, Фаст-лайн, Real-World Assets — «скоро» | the sphere splits into four tiles (they stay joined, then pinch apart) |
| 22.0 | INCPT · Криптокошелёк и карты в Telegram · «Открыть в Telegram» | the tiles run back together into the lens; the logo rests on it |

How the glass is made (`src/glass.js`):
- **WebGL pass (`LG`).** One full-screen shader per frame draws three things:
  - the pearl field: two iridescent bands at −28° seen through 30 px flutes;
  - textured quads with contact shadows (the logo, the safe);
  - up to ten rounded rects joined by a smooth union, so the glass melts and splits like liquid.
  - The glass bends the field at its rim (the profile of a lens edge), splits the bend per colour channel, and adds a thin specular line, a soft drop shadow and a slow sheen.
- **CSS pass (`glassEl`).** Glass over DOM content (the chips over the phone, the capsule over the card) is a backdrop filter: a displacement map built for the element's exact size, split per colour channel, plus a light blur and a gradient rim.

```bash
node tools/render.mjs sheet 0:27:0.5 --reel welcome          # contact sheet -> out/welcome/
node tools/render.mjs video --workers 4 --reel welcome        # -> out/welcome/seg/
python3 tools/sound.py out/welcome
bash tools/finalize.sh renders/welcome/incpt_welcome.mp4 out/welcome
```

## Token presale reel, readable cut (RU, 9:16) — current

`renders/presale5/incpt_presale.mp4` (+ `_preview.mp4`, `cover_presale.jpg`, `captions.md`), 1080×1920, 38 s, 120 BPM,
in the incpt.io brand. The 26 s strict cut read as rushed and uniform. This one gives every message 3–6 s after it has
fully appeared, and changes the kind of shot every time. Scene code: `src/scenes_presale5.js`; music:
`assets/music/presale5_edit.json`. The same generated track is cut longer: take 1's calm cinematic middle carries the
valuation, and its riser leads back into take 2's drive.

| Time | Shot |
|---|---|
| 0.0 | focus pull onto the mark · «Пресейл токена» |
| 3.0 | the mark folds into the site's lock-up, the wordmark slides out from behind it · «Основной токен экосистемы INCEPTION» |
| 6.0 | drop: a macro of the coin page, the camera pulls back to the whole phone · «Уже в INCPT Wallet»; $0.50 +1.00% and the coin's header lift off; the camera dives through the screen |
| 12.0 | out of the dive, the page's rule as a fraction: «последняя подтверждённая оценка компании / фиксированное количество valuation units» |
| 15.5 | the words give way to the page's example, counting up: $50M / 100M INCPT = $0.50 |
| 20.0 | the drive returns: «ЦЕНА ПРЕСЕЙЛА», 0.40 rolls in on an odometer and locks on the accent · USDT · «Покупка от $50,000»; the real presale button rises |
| 26.0 | the real TRC-20 · TRON pill is laid on the canvas · «Переводы другим пользователям — бесплатно» · «Обмен откроется после листинга» |
| 30.0 | back in the app: the phone rises, one tap on the presale button · «Купить на пресейле» |
| 34.0 | the lock-up in focus · «Пресейл INCEPTION Coin» · presale.incpt.fi · the risk line |

```bash
node tools/render.mjs video --workers 4 --reel presale5
python3 tools/sound.py out/presale5
MAXRATE=12 bash tools/finalize.sh renders/presale5/incpt_presale.mp4 out/presale5
```

## Token presale reel, strict cut (RU, 9:16)

Superseded by the readable cut above (too rushed: about 2 s per message).

`renders/presale4/incpt_presale.mp4` (+ `_preview.mp4`, `cover_presale.jpg`, `captions.md`), 1080×1920, 26 s, 120 BPM.
The boss wanted it serious, clear and uneven in rhythm, not playful. So this cut follows the INCPT reel DNA (the
`incpt-motion-reels` skill) inside the ХРОМ look:
- **Real UI.** The real coin page sits in the titanium phone, and real pieces of it lift off wider than the phone.
- **Type.** Words come one by one, 100 ms apart, with one message per frame.
- **Cuts and moves.** Cuts fall only on bar downbeats, and moves land on the beat's accents (+0.75 s, +1.5 s).
- **Holds and camera.** Every hold drifts slowly in 3D; the camera either stands or commits.
- **Rhythm.** Phone shots alternate with type-only frames and a macro of the chart.
- **No decoration.** There are no glints, spins, bounces or decorative wipes, and the logo is never under glass.
Scene code: `src/scenes_presale4.js`.

| Time | On screen |
|---|---|
| 0.0 | the chrome mark lands on the boom · ПРЕСЕЙЛ ТОКЕНА |
| 2.0 | INCPT · Основной токен экосистемы INCEPTION (on the ticking pulse) |
| 4.0 | drop: the phone rises with the coin page · УЖЕ В INCPT WALLET; the INCEPTION Coin header lifts off |
| 6.0 | macro: the real 7-day chart draws itself; $0.50 +1.00% lands on the accent |
| 8.0 | СТОИМОСТЬ — ОТ ОЦЕНКИ КОМПАНИИ: the formula, then the three example lines, one per accent |
| 10.0 | $50M ÷ 100M INCPT = $0.50, one part per accent (the full beat comes in) |
| 12.0 | ЦЕНА ПРЕСЕЙЛА: the presale button lifts off |
| 14.0 | 0.40 USDT counts up and locks on the accent · ПОКУПКА ОТ $50,000 |
| 16.0 | СЕТЬ TRC-20 · TRON (the pill lifts off) · ПЕРЕВОДЫ БЕСПЛАТНО (the note about free transfers and the listing) |
| 20.0 | КУПИТЬ НА ПРЕСЕЙЛЕ: the real button alone on the canvas, one tap on its star |
| 22.0 | end card: the mark, INCEPTION COIN, Токен экосистемы INCEPTION, presale.incpt.fi, the risk line |

**Music.** The track is an original, royalty-free one generated in vidIQ (`assets/music/presale_a.mp3`, 25 vidIQ credits;
no Higgsfield credits). The generator returned two takes of the same prompt, D minor and G minor, both at 120 BPM.
`tools/music_edit.py` cuts them on downbeats with 25 ms equal-power crossfades
(`assets/music/presale_edit.json`):
- take 1's boom and ticking pulse for the hook (0–4 s);
- take 2's driving beat from the drop (4–22 s);
- take 1's closing hits for the end card.
The scene names the edit in `META.musicEdit`, and `tools/sound.py` lays the scene's few cues (whooshes, one tap) over it at
`META.sfxGain`.

```bash
node tools/render.mjs video --workers 4 --reel presale4
python3 tools/sound.py out/presale4
MAXRATE=12 bash tools/finalize.sh renders/presale4/incpt_presale.mp4 out/presale4
```

## Token presale reel with the motion signature (RU, 9:16)

Superseded by the strict cut above: the boss found the boomerang arcs, rib shutter, letter slams and glints too playful,
and the synthesized bass-house track strange.

`renders/presale3/incpt_presale.mp4` (+ `_preview.mp4`, `cover_presale.jpg`, `captions.md`), 1080×1920, 27 s, 120 BPM `pulse` track (key +2).
The presale cut in ХРОМ, rebuilt on the motion signature. The logo is never under glass: it flies in as a boomerang
and is caught. Scene code: `src/scenes_presale3.js`.

| Time | On screen | Motion |
|---|---|---|
| 0.0 | Пресейл токена · INCPT · Основной токен экосистемы INCEPTION | the logo flies in on a boomerang arc and is caught; letters slam in; glints |
| 4.0 | INCEPTION Coin уже в INCPT Wallet · $0.50 +1.00% · TRC-20 · TRON · Купить на пресейле | rib shutter; the phone swings in on an arc; three glass chips are thrown in one per beat |
| 8.0 | Стоимость — от оценки компании: $50M ÷ 100M INCPT = $0.50 | the glass slab splits into three rows; the numbers count up; ÷ and = spin in |
| 12.0 | Цена пресейла 0.40 USDT · Покупка от $50,000 | the rows melt into one ticket; the price counts 0.00 → 0.40 and lands with a punch |
| 16.0 | Переводы бесплатно · TRC-20 · TRON · Обмен откроется после листинга | rib shutter; two tiles flip in |
| 19.5 | Купить на пресейле | the tiles melt into a glass button; a tap on the star |
| 21.5 | INCEPTION COIN · presale.incpt.fi · Не является инвестиционной рекомендацией | rib shutter; the logo boomerangs back and is caught; glass pill |

```bash
node tools/render.mjs video --workers 4 --reel presale3
python3 tools/sound.py out/presale3
MAXRATE=12 bash tools/finalize.sh renders/presale3/incpt_presale.mp4 out/presale3
```

## Token presale reel in ХРОМ (RU, 9:16)

`renders/presale2/incpt_presale.mp4` (+ `_preview.mp4`, `cover_presale.jpg`, `captions.md`), 1080×1920, 27 s, 96 BPM `calm` track.
Rebuilt from scratch in the welcome reel's language (a first pass that only reskinned the old cut was rejected and removed).
Superseded by the motion-signature cut above (`renders/presale3/`); in this render the logo still sits inside the lens and is bent by it, which the boss rejected (the source is fixed, the render is kept for reference).
One liquid-glass body (`LiquidBody` in `src/chrome.js`) flows through the film:

| Time | On screen | The glass |
|---|---|---|
| 0.0 | Пресейл токена · INCPT · Основной токен экосистемы INCEPTION | drops melt into a lens, the chrome mark surfaces inside it like a coin |
| 5.0 | INCEPTION Coin уже в INCPT Wallet | a frosted slab; the phone with the coin page rises onto it; glass chips: $0.50 +1.00%, TRC-20 · TRON, Купить на пресейле |
| 9.4 | Стоимость — от оценки компании | the slab splits into three rows: $50M ÷ 100M INCPT = $0.50 (the page's example), glass ÷ and = between them |
| 13.75 | Купить на пресейле | the rows run together into one ticket: «Цена пресейла 0.40 USDT · Покупка от $50,000» |
| 18.1 | Переводы бесплатно | the ticket splits into two tiles: Сеть TRC-20 · TRON / Бесплатно другим пользователям; «Обмен откроется после листинга» |
| 21.25 | INCEPTION COIN · Токен экосистемы INCEPTION | the coin lens again, the glass pill «Пресейл · presale.incpt.fi», the risk line |

```bash
node tools/render.mjs video --workers 4 --reel presale2
python3 tools/sound.py out/presale2
MAXRATE=12 bash tools/finalize.sh renders/presale2/incpt_presale.mp4 out/presale2
```

## Token presale reel (RU, 9:16)

`renders/presale/incpt_presale.mp4` (+ `_preview.mp4`), 1080×1920, 27 s, with a cover and a ready post text (`captions.md`).

The promo's editing language on the INCEPTION Coin page of INCPT Wallet, to the 120 BPM drive track (key +2).
Every fact is on that page; nothing is added beyond one line of risk disclosure on the end card.

| Time | Headline | Picture |
|---|---|---|
| 0.0 | ПРЕСЕЙЛ · ТОКЕНА · INCPT · В INCPT WALLET | One word per beat; the presale button, the coin header, the price and the TRC-20 pill fly in, then fall into one point |
| 4.0 | INCEPTION COIN | Drop. The phone rises with the chart already off the screen; the 7-day line draws in |
| 6.0 | ТОКЕН ЭКОСИСТЕМЫ INCEPTION | The chart lands; the coin header and «$0.50 +1.00%» lift, one per beat |
| 8.0 | СТОИМОСТЬ — ОТ ОЦЕНКИ КОМПАНИИ | «О монете»: the Reference Value formula, then its example line by line ($50M · 100M INCPT · $0.50) |
| 12.0 | ЦЕНА ПРЕСЕЙЛА 0.40 USDT | «Купить на пресейле» leaves the screen, wider than the phone |
| 14.0 | ПОКУПКА ОТ $50,000 | The button holds and turns |
| 16.0 | СЕТЬ TRC-20 · TRON | The network pill lifts |
| 17.5 | ПЕРЕВОДЫ БЕСПЛАТНО | The note «INCPT можно бесплатно отправлять…» and «Отправить» lift |
| 19.0 | КУПИТЬ НА ПРЕСЕЙЛЕ | Tap on the presale button; it flies at the camera into the end card |
| 21.0 | INCEPTION COIN · ТОКЕН ЭКОСИСТЕМЫ INCEPTION | End card, «Пресейл presale.incpt.fi», «Не является инвестиционной рекомендацией» |

**Source.** Two native screenshots of the coin page (1206×2622, lossless, no AI pass) in git-ignored `reference/presale/`.
`tools/build_presale.py` makes everything from them; nothing in the UI is redrawn:

| Piece | How |
|---|---|
| One long page | The top shot, then the scrolled one, 2506 px lower (matched on «История» and the card under it) |
| What the fixed parts hid in between | Rebuilt from measurements: the presale button's last rows and its tinted shadow (fitted: blur 32 px, offset 17.6 px, the button's own colour), «История» in Inter 600 (calibrated on «Статистика»: 266 vs 264 px), the «Пока нет операций» card |
| Telegram header | Alpha-black layer over a white band, so the page scrolls away under it instead of running into the clock |
| Frosted bottom buttons | Two versions: tinted while the presale button sits behind them, white otherwise |
| Chart | Clean base (labels, dates, the dashed grid rebuilt from its 18 px period) + the plot, revealed left to right |
| Cut-outs | Kept at the shots' full resolution, so a piece lifted to 1.3–1.7× the phone still maps about 1:1 to source pixels |
| Status bar | The silent-mode bell next to the clock removed (device state, not the app) |

```bash
python3 tools/build_presale.py
node tools/render.mjs video --workers 3 --reel presale      # -> out/presale/
python3 tools/sound.py out/presale
MAXRATE=12 bash tools/finalize.sh renders/presale/incpt_presale.mp4 out/presale
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
src/vec.js                  vector pieces for the Instagram reels: 3D coins, cards, rows, swap panels, chips
tools/build_ig.py           Instagram manifest (promo + how-to cut-outs) and the five coin icons
src/scenes_presale.js       token presale reel on the INCEPTION Coin page (?reel=presale)
tools/build_presale.py      coin page from two native screenshots: stitched page, overlays, hi-res cut-outs
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
