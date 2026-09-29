# INCPT Wallet — motion reel

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

## Pipeline

```
assets/screens/*.jpg        real app screenshots (source of truth — never redrawn)
tools/build_assets.py       phone mockup, alpha cut-outs with contour shadows, stitched scroll page
src/engine.js               seekable timeline: easing, 3D nodes, phone, tap, headlines, background
src/common.js               shared helpers + brand end card
src/scenes.js               reel 1 edit (all timing lives here, beat = 0.625 s)
src/scenes_staking.js       reel 2 edit (?reel=staking)
src/scenes_topup.js         reel 3 edit, 1:1 (?reel=topup)
tools/render.mjs            headless Chromium → sub-frame motion blur → ffmpeg (parallel workers)
tools/sound.py              procedural music (96 BPM tech / 80 BPM calm) + SFX placed from the timeline's cue list
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
