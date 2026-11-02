"""Style frames for the new INCPT brand: the logo and UI pieces they are built from.

    python3 tools/build_style.py   -> assets/style/*.png

Sources (git-ignored reference/app_v3/): the new chrome logo render (logo.jpg, on white) and the
new interface (home, cards, wallet, staking at 850x1850; profile pages native at 1206x2622).
  - the logo is matted from its white background: silhouette from the dark chrome edge, holes
    filled (white highlights inside stay opaque), edge colours de-contaminated from the white
  - UI pieces are cut with rounded alpha and no baked shadow (each style lights them its own way)
  - the 3D illustrations (safe, shield) are matted against the page's own soft gradient
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import sdf_rrect, to_img  # noqa: E402

REF = os.path.join(ROOT, "reference", "app_v3")
OUT = os.path.join(ROOT, "assets", "style")
os.makedirs(OUT, exist_ok=True)


def load(n):
    return np.asarray(Image.open(os.path.join(REF, n)).convert("RGB")).astype(np.float32)


def save(name, rgb, a):
    to_img(rgb, a).save(os.path.join(OUT, name + ".png"), compress_level=3)
    print(f"{name}: {a.shape[1]}x{a.shape[0]}")


# ------------------------------------------------------------------ logo
L = load("logo.jpg")
lum = L.mean(2)
dark = lum < 238
fill = ndimage.binary_fill_holes(ndimage.binary_closing(dark, iterations=3))
lab, n = ndimage.label(fill)
fill = lab == (np.argmax(ndimage.sum(fill, lab, range(1, n + 1))) + 1)       # the mark only, no specks
core = ndimage.binary_erosion(fill, iterations=3)
edge = np.clip((252 - lum) / 30, 0, 1)                                       # soft edge from the chrome rim
a = np.where(core, 1.0, np.where(ndimage.binary_dilation(fill, iterations=2), edge, 0)).astype(np.float32)
a = ndimage.gaussian_filter(a, 0.6)
a = np.where(core, 1, a)
fg = (L - (1 - a[..., None]) * 255) / np.maximum(a[..., None], 0.06)
ys, xs = np.where(a > 0.01)
P = 40
y0, y1, x0, x1 = ys.min() - P, ys.max() + P, xs.min() - P, xs.max() + P
save("logo_chrome", np.clip(fg[y0:y1, x0:x1], 0, 255), a[y0:y1, x0:x1])


# ------------------------------------------------------------------ UI pieces
def piece(name, src, box, r):
    x0, y0, x1, y1 = box
    save(name, src[y0:y1, x0:x1], sdf_rrect(x1 - x0, y1 - y0, r, inset=0.6))


CARDS, WAL, WAL1, WAL2 = load("cards.png"), load("wallet.png"), load("wallet_s1.png"), load("wallet_s2.png")
# Bitcoin's row sits under the header's buttons in the scrolled shot: its top band is plain plate,
# and the coin's disc is round, so its hidden top rows mirror the bottom ones
WAL1[153:198, 43:808] = np.median(WAL1[300:310, 300:500].reshape(-1, 3), 0)
for y in range(180, 198):
    WAL1[y, 75:172] = WAL1[2 * 235 - y, 75:172]
# INCEPTION Coin's row: the tab bar's centre button reaches into its bottom rows
WAL[1634:1652, 43:808] = np.median(WAL[1620:1630, 600:780].reshape(-1, 3), 0)
PR1, PR2 = load("profile_s1.png"), load("profile_s2.png")
piece("card_holo", CARDS, (43, 930, 807, 1414), 44)
# coin rows: one plate each (the list's own 163 px pitch)
COINS = [("usdt", WAL, 1166), ("usdc", WAL, 1327), ("incpt", WAL, 1490), ("btc", WAL1, 151), ("eth", WAL1, 314),
         ("trx", WAL1, 477), ("sol", WAL1, 639), ("hype", WAL1, 802), ("ton", WAL1, 965), ("xmr", WAL1, 1128),
         ("zec", WAL1, 1290), ("bnb", WAL1, 1453), ("doge", WAL2, 1295), ("xrp", WAL2, 1458)]
for n, src, y in COINS:
    piece("coin_" + n, src, (43, y + 2, 808, y + 161), 38)
# profile: the new services and finance rows (native shots)
for n, y0, y1 in [("ref", 312, 518), ("esim", 520, 722), ("lounge", 725, 926), ("fastline", 929, 1130), ("rwa", 1133, 1340)]:
    piece("svc_" + n, PR2, (48, y0, 1158, y1), 52)
for n, y0, y1 in [("iban", 1234, 1440), ("aml", 1443, 1647), ("analytics", 1650, 1853), ("statement", 1856, 2062)]:
    piece("fin_" + n, PR1, (48, y0, 1158, y1), 52)


# ------------------------------------------------------------------ 3D illustrations
def matte(name, img, box, thr=(8, 36)):
    x0, y0, x1, y1 = box
    E = 40
    reg = img[y0 - E:y1 + E, x0 - E:x1 + E]
    ring = np.ones(reg.shape[:2], bool)
    ring[E:-E, E:-E] = False
    ref = np.median(reg[ring], axis=0)
    obj = ndimage.binary_dilation(np.abs(reg - ref).max(2) > 16, iterations=8)
    keep = (~obj).astype(np.float32)
    w = ndimage.gaussian_filter(keep, 30)
    bg = np.stack([ndimage.gaussian_filter(reg[..., c] * keep, 30) for c in range(3)], -1) / np.maximum(w, 1e-3)[..., None]
    d = np.abs(reg - bg).max(2)
    a = np.clip((d - thr[0]) / (thr[1] - thr[0]), 0, 1)
    a = np.maximum(a, ndimage.binary_fill_holes(a > 0.5).astype(np.float32))
    a = np.where(a < 0.22, 0, a)
    a = ndimage.gaussian_filter(a, 0.7)
    fg = (reg - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 0.05)
    fg = np.where(a[..., None] > 0.05, fg, reg)
    save(name, np.clip(fg[E:-E, E:-E], 0, 255), a[E:-E, E:-E])


matte("safe", load("stake.png"), (296, 322, 556, 582))
matte("shield", WAL, (270, 340, 600, 575))

# the home screen for the phone mockup (920 x 2000, the mockup's screen)
Image.open(os.path.join(REF, "home.png")).convert("RGB").resize((920, 2000), Image.LANCZOS).save(os.path.join(OUT, "screen_home.jpg"), quality=94, subsampling=0)
