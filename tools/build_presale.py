"""Token presale reel: the INCEPTION Coin page -> phone page, fixed overlays, hi-res cut-outs.

    python3 tools/build_presale.py [top.png scrolled.png]   -> assets/presale/build/* + assets/manifest_presale.json

Source: two native iPhone screenshots of the coin page (1206x2622, lossless, no AI pass), kept in the
git-ignored reference/presale/. Nothing in the UI is redrawn. Work happens at the shots' own width;
the phone page is scaled to the 920 px screen, while cut-outs keep the full resolution, so a piece
lifted to 1.3x the phone still maps about 1:1 to source pixels (crisp, never upscaled).
  - one long page: the top shot, then the scrolled one (D = 2506 px lower: matched on the
    «История» heading and on the top edge of the card under it). What the fixed header and the
    bottom buttons hide in between is rebuilt from measurements: the presale button's last rows
    and its tinted shadow, the «История» heading (Inter 600, calibrated on «Статистика»), the
    «Пока нет операций» card (r 60, the card colour, its own text pixels)
  - fixed overlays: the Telegram header (status bar, Back, menu) as an alpha-black layer, so the
    page shows through it as in the app; the two frosted buttons, tinted (over the presale
    button) and white (page end), with the shadow measured on white
  - the chart gets a clean base (labels, dates, the dashed grid rebuilt from its 18 px period)
    plus the plot itself, so the line can draw in from the left
  - the silent-mode bell next to the clock is removed (device state, not the app)
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.special import erfc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import sdf_rrect, to_img, with_shadow  # noqa: E402

REF = os.path.join(ROOT, "reference", "presale")
SRC = sys.argv[1:3] if len(sys.argv) > 2 else [os.path.join(REF, "coin_top.png"), os.path.join(REF, "coin_scrolled.png")]
OUT = os.path.join(ROOT, "assets", "presale", "build")
TMP = os.path.join(ROOT, "out", "presale_tmp")
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

A = np.asarray(Image.open(SRC[0]).convert("RGB")).astype(np.float32)   # top of the page
B = np.asarray(Image.open(SRC[1]).convert("RGB")).astype(np.float32)   # scrolled to the end
HH, WW = A.shape[:2]
assert (WW, HH) == (1206, 2622), (WW, HH)
K = WW / 920                       # source px per screen px
D = 2506                           # scroll between the shots (source px)
BAR_Y = 2393                       # top of the fixed bottom buttons
M = {"screens": {}, "cutouts": {}, "slots": {}, "overlays": {}, "K": K}


def rel(n):
    return f"presale/build/{n}"


def save_rgba(name, rgb, a, size=None):
    im = to_img(rgb, a)
    if size:                                          # premultiplied, so edges keep their colour
        im = im.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    im.save(os.path.join(OUT, name + ".png"), compress_level=3)
    return rel(name + ".png")


def save_rgb(name, rgb, size=None):
    im = Image.fromarray(np.clip(rgb + 0.5, 0, 255).astype(np.uint8))
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".jpg"), quality=94, subsampling=0)
    return rel(name + ".jpg")


def lum(img):
    return img.mean(2)


def bbox(img, x0, y0, x1, y1, thr):
    r = lum(img[y0:y1, x0:x1]) < thr
    ys, xs = np.where(r.any(1))[0], np.where(r.any(0))[0]
    return x0 + xs[0], y0 + ys[0], x0 + xs[-1] + 1, y0 + ys[-1] + 1


def rrect_at(h, w, box, r):
    """Coverage of a rounded rect with fractional edges (x0, y0, x1, y1) on an h x w canvas."""
    x0, y0, x1, y1 = box
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    out = np.zeros((h, w), np.float32)
    for oy in (0.125, 0.375, 0.625, 0.875):           # 4x4 supersampling
        for ox in (0.125, 0.375, 0.625, 0.875):
            px, py = xs + ox, ys + oy
            qx = np.abs(px - (x0 + x1) / 2) - ((x1 - x0) / 2 - r)
            qy = np.abs(py - (y0 + y1) / 2) - ((y1 - y0) / 2 - r)
            d = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2) + np.minimum(np.maximum(qx, qy), 0) - r
            out += (d <= 0)
    return out / 16


# ------------------------------------------------------------------ 0. the clock's silent-mode bell
bx0, by0, bx1, by1 = bbox(A, 272, 60, 340, 135, 200)
A[by0 - 3:by1 + 3, bx0 - 3:bx1 + 3] = 255
print(f"bell removed at x {bx0}..{bx1}, y {by0}..{by1}")

# ------------------------------------------------------------------ 1. the long page (source px)
PH = D + HH
P = np.full((PH, WW, 3), 255, np.float32)
HEAD = 336                                            # header rows: the page there is plain white
P[HEAD:BAR_Y] = A[HEAD:BAR_Y]

# presale button: rounded rect (measured), its last rows hidden under the bottom buttons
BTN = (48.75, 2209.75, 1156.25, 2400.75)
BTN_R = 62
y0r, y1r = 2330, 2530                                  # rebuilt band (shadow < 0.5/255 below)
band = P[y0r:y1r]
m = rrect_at(y1r - y0r, WW, (BTN[0], BTN[1] - y0r, BTN[2], BTN[3] - y0r), BTN_R)
# tinted shadow under the button: blurred button shape, offset down; colour = the button's own
sig, sdy, sop = 32.0, 17.6, 0.146
ys = np.arange(y0r, y1r, dtype=np.float32)[:, None] + 0.5
xs = np.arange(WW, dtype=np.float32)[None, :] + 0.5
fy = 0.5 * (erfc((BTN[1] + sdy - ys) / (sig * 2 ** 0.5)) - erfc((BTN[3] + sdy - ys) / (sig * 2 ** 0.5)))
fx = 0.5 * (erfc((BTN[0] - xs) / (sig * 2 ** 0.5)) - erfc((BTN[2] - xs) / (sig * 2 ** 0.5)))
sh = (sop * fy * fx)[..., None]
# button colour per column, from a row clear of the label (smoothed: the shadow is a blur anyway)
bcol = ndimage.gaussian_filter1d(A[2378, np.clip(np.arange(WW), 70, 1135)], 12, axis=0)[None]
synth = 255 * (1 - sh) + bcol * sh
fill = A[2386, np.clip(np.arange(WW), 70, 1135)][None]
synth = synth * (1 - m[..., None]) + fill * m[..., None]
w = np.clip((ys - 2352) / 40, 0, 1)[..., None]                   # blend into the real pixels above
real = band.copy()
real[BAR_Y - y0r:] = synth[BAR_Y - y0r:]
keep = m[..., None] > 0.999                                       # the button itself stays real above BAR_Y
P[y0r:y1r] = np.where(keep & (ys[..., None] < BAR_Y), real, real * (1 - w) + synth * w)
# the screen's black bottom corners begin at the very edges a little above the buttons
edge = (lum(A[y0r:BAR_Y]) < 248) & (m[:BAR_Y - y0r] < 0.01) & ((xs < 24) | (xs > WW - 24))
P[y0r:BAR_Y] = np.where(edge[..., None], synth[:BAR_Y - y0r], P[y0r:BAR_Y])

# «История»: Inter 600 at the size that reproduces «Статистика» (264 x 35 px)
spec = [{"text": "История", "size": 47, "weight": 600, "color": "#121212", "file": os.path.join(TMP, "istoriya.png")},
        {"text": "Статистика", "size": 47, "weight": 600, "color": "#121212", "file": os.path.join(TMP, "statistika.png")}]
with open(os.path.join(TMP, "spec.json"), "w") as f:
    json.dump(spec, f)
subprocess.run(["node", os.path.join(ROOT, "tools", "textpng.mjs"), os.path.join(TMP, "spec.json")], check=True, cwd=ROOT)
T = np.asarray(Image.open(spec[0]["file"])).astype(np.float32)
ta = T[..., 3] / 255
tys, txs = np.where(ta.any(1))[0], np.where(ta.any(0))[0]
# the «И» stem: left edge at x 52, bottom row 2538 in the top shot (2538 - D = 32 in the scrolled one)
ix0 = txs[0]
ib = np.where(ta[:, ix0:ix0 + 6].max(1) > 0.5)[0][-1]
ox, oy = 52 - ix0, 2538 - ib
th, tw_ = ta.shape
reg = P[oy:oy + th, ox:ox + tw_]
P[oy:oy + th, ox:ox + tw_] = reg * (1 - ta[..., None]) + T[..., :3] * ta[..., None]
S = np.asarray(Image.open(spec[1]["file"]))[..., 3] > 110
sx = np.where(S.any(0))[0]
print(f"История placed at ({ox}, {oy}); Inter «Статистика» width {sx[-1] - sx[0] + 1} px (screenshot 264)")

# «Пока нет операций» card: x 48..1158, top 88 (scrolled shot), bottom measured
cb = 88 + int(np.where(lum(B[88:300, 600:601])[:, 0] > 250)[0][0])
CARD = (48.0, 88.0 + D, 1158.0, cb + D)
ccol = B[150, 600]
cy0, cy1 = int(CARD[1]) - 4, int(CARD[3]) + 4
cm = rrect_at(cy1 - cy0, WW, (CARD[0], CARD[1] - cy0, CARD[2], CARD[3] - cy0), 60)[..., None]
P[cy0:cy1] = P[cy0:cy1] * (1 - cm) + ccol * cm
P[150 + D:206 + D, 410:796] = B[150:206, 410:796]                 # its text, clear of the overlays
print(f"card «Пока нет операций» y {CARD[1]:.0f}..{CARD[3]:.0f} colour {ccol}")
# the rest of the scrolled shot (clear of the header from row 281); the page end stays white
P[D + 281:D + BAR_Y] = B[281:BAR_Y]
P[cy1:D + 281] = 255                                              # white between the card and «Статистика»

PAGE_H = int(round(PH / K))
M["page"] = {"src": save_rgb("page_coin", P, (920, PAGE_H)), "h": PAGE_H, "scrollEnd": D / K, "D": D}
# a check strip around the seam: top shot | rebuilt page, and the scrolled shot's first rows
chk = np.concatenate([P[2300:2800], np.full((10, WW, 3), 255.0) * [1, 0, 0], np.concatenate([B[0:300], P[D:D + 300]], 1)[:, ::2]], 0)
Image.fromarray(np.clip(chk, 0, 255).astype(np.uint8)).save(os.path.join(TMP, "seam_check.png"))

# ------------------------------------------------------------------ 2. screens
M["screens"]["ps_coin"] = save_rgb("ps_coin", A, (920, 2000))

# ------------------------------------------------------------------ 3. fixed overlays (screen px)
# glyphs as alpha-black over a white band that fades out under the buttons, so the page scrolls
# away cleanly instead of running into the clock
hdr = A[:HEAD]
ha = np.clip(1 - lum(hdr) / 255, 0, 1)
ha[ha < 0.012] = 0
yb = np.clip((np.arange(HEAD, dtype=np.float32) - 285) / 50, 0, 1)
band = (1 - yb * yb * (3 - 2 * yb))[:, None] * np.ones((1, WW), np.float32)
oa = ha + band * (1 - ha)
orgb = (255 * band * (1 - ha) / np.maximum(oa, 1e-4))[..., None] * np.ones(3, np.float32)
M["overlays"]["header"] = {"src": save_rgba("ov_header", orgb, oa, (920, round(HEAD / K))), "y": 0, "h": HEAD / K}
# bottom buttons: frosted pills (r = h/2). Shadow + the screen's black corners from the scrolled
# shot (pills on white); the pill itself from the top shot (tinted by the presale button) or the
# scrolled one (white)
BY0 = 2330
PILLS = {"recv": (47.0, 2393.5, 591.5, 2561.0), "send": (614.5, 2393.5, 1158.0, 2561.0)}
reg = B[BY0:]
sa = np.clip(1 - lum(reg) / 255, 0, 1)
sa[sa < 0.008] = 0
for k, box in PILLS.items():
    pm = rrect_at(HH - BY0, WW, (box[0], box[1] - BY0, box[2], box[3] - BY0), (box[3] - box[1]) / 2)
    for ver, src in (("a", A), ("b", B)):
        half = np.zeros(WW, bool)
        half[:603] = k == "recv"
        half[603:] = k == "send"
        al = np.maximum(sa * (1 - pm), pm) * half[None]
        rgb = np.where(pm[..., None] > 0, src[BY0:], 0)               # alpha-black outside the pill
        M["overlays"][f"bar_{k}_{ver}"] = {"src": save_rgba(f"ov_bar_{k}_{ver}", rgb, al, (920, round((HH - BY0) / K))), "y": BY0 / K, "h": (HH - BY0) / K}

# ------------------------------------------------------------------ 4. hi-res cut-outs
def cut(name, src, box, r, pad=90, blur=26, dy=22, op=0.26, alpha=None, fixed=False):
    """box in source px (page coordinates unless fixed); stored in screen px."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    a = alpha if alpha is not None else sdf_rrect(w, h, r, inset=0.8)
    p = int(round(pad * K))
    rgb, al = with_shadow(src[y0:y1, x0:x1], a, p, blur * K, int(round(dy * K)), op)
    M["cutouts"][name] = {"src": save_rgba(name, rgb, al), "box": [x0 / K, y0 / K, w / K, h / K], "pad": p / K,
                          "size": [(w + 2 * p) / K, (h + 2 * p) / K], "r": r / K, "fixed": fixed}


def slot(name, box, col, feather=4.0):
    """Clean surface where a piece leaves (screen px, page coordinates)."""
    x0, y0, x1, y1 = [v / K for v in box]
    X0, Y0 = int(np.floor(x0)), int(np.floor(y0))
    w, h = int(np.ceil(x1)) - X0, int(np.ceil(y1)) - Y0
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    e = np.minimum.reduce([xx + 0.5, yy + 0.5, w - xx - 0.5, h - yy - 0.5])
    M["slots"][name] = {"src": save_rgba("slot_" + name, np.zeros((h, w, 3), np.float32) + col, np.clip(e / feather, 0, 1)), "x": X0, "y": Y0, "w": w, "h": h}


def plate(name, src, tight, m=(28, 22), r=36, col=(255, 255, 255), **kw):
    x0, y0, x1, y1 = tight
    box = (x0 - m[0], y0 - m[1], x1 + m[0], y1 + m[1])
    cut(name, src, box, r, **kw)
    slot(name, (box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2), col)
    return box


WHITE = np.array([255, 255, 255], np.float32)
# price row: $0.50 and the +1.00 % chip
plate("ps_price", P, bbox(P, 40, 530, 640, 680, 240), m=(30, 24), r=40, pad=80)
# coin header: logo, INCEPTION Coin, INCPT
plate("ps_head", P, bbox(P, 60, 360, 700, 520, 235), m=(30, 22), r=40, pad=80)
# chart: labels + plot + dates on a white plate; the plot again on its own for the draw-in
CH = (40, 682, 1192, 1168)                            # even margins around labels and line
cut("ps_chart", P, CH, 48, pad=90)
slot("ps_chart", (CH[0] - 2, CH[1] - 2, CH[2] + 2, CH[3] + 2), WHITE)
PLOT = (226, 690, 1162, 1086)
base = P.copy()
pl = base[PLOT[1]:PLOT[3], PLOT[0]:PLOT[2]]
pl[:] = 255
gx = np.arange(PLOT[0], PLOT[2])
tmpl = A[:, 239 + ((gx - 239) % 18)]                                # 18 px dash period, phase kept
for gy in (708, 827, 946, 1065):
    rows = [y for y in range(gy - 3, gy + 6) if lum(A[y:y + 1, 239:247]).min() < 236 or lum(A[y:y + 1, 257:265]).min() < 236]
    for y in rows:
        pl[y - PLOT[1]] = tmpl[708 + (y - rows[0])]
c = M["cutouts"]["ps_chart"]
cut("ps_chart_base", base, CH, 48, pad=90)
M["cutouts"]["ps_chart"]["plot"] = {"src": save_rgb("ps_chart_plot", P[PLOT[1]:PLOT[3], PLOT[0]:PLOT[2]]),
                                    "x": (PLOT[0] - CH[0]) / K + c["pad"], "y": (PLOT[1] - CH[1]) / K + c["pad"],
                                    "w": (PLOT[2] - PLOT[0]) / K, "h": (PLOT[3] - PLOT[1]) / K}
# network pill: TRC-20 · TRON (black, fully rounded)
nx0, ny0, nx1, ny1 = bbox(P, 30, 1860, 520, 2030, 60)
cut("ps_net", P, (nx0 - 1, ny0 - 1, nx1 + 1, ny1 + 1), (ny1 - ny0 + 2) / 2, pad=70, blur=22, dy=18)
slot("ps_net", (nx0 - 4, ny0 - 4, nx1 + 4, ny1 + 4), WHITE)
# the note under it (free transfers, exchange after listing)
plate("ps_note", P, bbox(P, 30, 2030, 1180, 2160, 200), m=(30, 22), r=36, pad=80)
# the presale button (whole: rows under the bottom buttons rebuilt above)
bxa, bya = int(np.floor(BTN[0])), int(np.floor(BTN[1]))
bxb, byb = int(np.ceil(BTN[2])), int(np.ceil(BTN[3]))
ba = rrect_at(byb - bya, bxb - bxa, (BTN[0] - bxa, BTN[1] - bya, BTN[2] - bxa, BTN[3] - bya), BTN_R)
cut("ps_presale", P, (bxa, bya, bxb, byb), BTN_R, pad=100, blur=30, dy=26, op=0.3, alpha=ba)
slot("ps_presale", (0, 2152, WW, 2425), WHITE, feather=10)      # down under the bottom buttons
# «О монете»: the valuation formula and the example (scrolled shot, page coordinates)
GREY = ccol
fx0, fy0, fx1, fy1 = bbox(P, 80, D + 1780, 1120, D + 1950, 150)
plate("ps_formula", P, (fx0, fy0, fx1, fy1), m=(34, 26), r=36, col=GREY, pad=80)
lines = []
rows = np.where((lum(P[D + 1960:D + 2250, 80:1120]) < 150).any(1))[0] + D + 1960
grp = np.split(rows, np.where(np.diff(rows) > 6)[0] + 1)
for g in grp:
    lx0, _, lx1, _ = bbox(P, 70, g[0], 1130, g[-1] + 1, 150)
    lines.append((lx0, g[0], lx1, g[-1] + 1))
print("example lines:", [(int(l[1] - D), int(l[3] - D)) for l in lines])
assert len(lines) == 4, lines                                    # «Пример» + three bullets
for i, l in enumerate(lines[1:]):
    plate(f"ps_ex{i + 1}", P, l, m=(30, 20), r=32, col=GREY, pad=70, blur=22, dy=18)
# «Отправить»: the fixed bottom button, white version
b = PILLS["send"]
sx0, sy0, sx1, sy1 = int(np.floor(b[0])), int(np.floor(b[1])), int(np.ceil(b[2])), int(np.ceil(b[3]))
pa = rrect_at(sy1 - sy0, sx1 - sx0, (b[0] - sx0, b[1] - sy0, b[2] - sx0, b[3] - sy0), (b[3] - b[1]) / 2)
cut("ps_send", B, (sx0, sy0, sx1, sy1), 0, pad=80, alpha=pa, fixed=True)

with open(os.path.join(ROOT, "assets", "manifest_presale.json"), "w") as f:
    json.dump(M, f, indent=1)
print("presale assets ok:", len(M["cutouts"]), "cutouts,", len(M["slots"]), "slots, page", PAGE_H, "px")
