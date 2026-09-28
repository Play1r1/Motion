# INCPT Wallet — motion reel

A 27.5 s, 1080×1920 @ 30 fps promo reel for the INCPT Wallet Telegram mini app (AI crypto wallet and crypto cards). It is cut in the editing language of the Tangem 6.1 "Address Book" reel:
- light brand-blue canvas with a drifting dot grid
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

## Pipeline

```
assets/screens/*.jpg        real app screenshots (source of truth — never redrawn)
tools/build_assets.py       phone mockup, alpha cut-outs with contour shadows, stitched scroll page
src/engine.js               seekable timeline: easing, 3D nodes, phone, tap, headlines, background
src/scenes.js               the edit (all timing lives here, beat = 0.625 s)
tools/render.mjs            headless Chromium → sub-frame motion blur → ffmpeg (parallel workers)
tools/sound.py              procedural 96 BPM bed + SFX placed from the timeline's cue list
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
