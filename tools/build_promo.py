"""Product promo (new interface): cut-outs, mattes and pages from the cleaned screen library.

    python3 tools/build_promo.py   -> assets/promo/build/* + assets/manifest_promo.json

Source: assets/app/*.jpg (920x2000, cleaned by tools/import_app.py). UI pixels are never redrawn:
  - UI pieces are cut out with rounded alpha and a contour shadow; each gets a clean slot patch
  - the three 3D illustrations (shield, card holder, safe) get a real matte, pulled against the
    page's own smooth background, so they can leave the screen as objects
  - scrolling pages (wallet, home) are stitched from the top and the scrolled screenshot
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import sdf_rrect, to_img, with_shadow  # noqa: E402

APP = os.path.join(ROOT, "assets", "app")
OUT = os.path.join(ROOT, "assets", "promo", "build")
os.makedirs(OUT, exist_ok=True)
SW, SH, HY = 920, 2000, 302
S = {n: np.asarray(Image.open(os.path.join(APP, f"{n}.jpg")).convert("RGB")).astype(np.float32)
     for n in ["home", "home_s1", "wallet", "wallet_s1", "swap", "cards", "stake"]}
M = {"screens": {}, "cutouts": {}, "slots": {}, "overlays": {}, "headerY": HY}


def rel(n):
    return f"promo/build/{n}"


def save_rgba(name, rgb, a):
    to_img(rgb, a).save(os.path.join(OUT, name + ".png"), compress_level=3)
    return rel(name + ".png")


def save_rgb(name, rgb):
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name + ".jpg"), quality=94, subsampling=0)
    return rel(name + ".jpg")


def cut(name, img, box, r, pad=90, blur=26, dy=22, op=0.26, alpha=None):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    a = alpha if alpha is not None else sdf_rrect(w, h, r, inset=0.8)
    rgb, al = with_shadow(img[y0:y1, x0:x1], a, pad, blur, dy, op)
    M["cutouts"][name] = {"src": save_rgba(name, rgb, al), "box": [x0, y0, w, h], "pad": pad, "size": [w + 2 * pad, h + 2 * pad], "r": r}


def slot(name, img, box, m=6, fy=3):
    """Clean surface for the place an element leaves: rows above and below, blended."""
    x0, y0, x1, y1 = box[0] - m, box[1] - m, box[2] + m, box[3] + m
    h = y1 - y0
    top = np.median(img[y0 - 6:y0 - 1, x0:x1], axis=0)
    bot = np.median(img[y1 + 1:y1 + 6, x0:x1], axis=0)
    k = np.linspace(0, 1, h)[:, None, None]
    patch = top[None] * (1 - k) + bot[None] * k
    patch = np.stack([ndimage.gaussian_filter(patch[..., c], (fy, 6), mode="nearest") for c in range(3)], -1)
    ys, xs = np.mgrid[0:h, 0:x1 - x0]
    edge = np.minimum.reduce([xs, ys, x1 - x0 - 1 - xs, h - 1 - ys]).astype(np.float32)
    M["slots"][name] = {"src": save_rgba("slot_" + name, patch, np.clip(edge / 3.0, 0, 1)), "x": x0, "y": y0, "w": x1 - x0, "h": h}


def polygon_mask(shape, pts, ox, oy, ss=4, round_px=6):
    """Anti-aliased polygon coverage (screen-coordinate points) with its corners rounded."""
    h, w = shape
    im = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(im).polygon([((x - ox) * ss, (y - oy) * ss) for x, y in pts], fill=255)
    im = im.filter(ImageFilter.GaussianBlur(round_px * ss / 2)).point(lambda v: 255 if v >= 128 else 0)
    return np.asarray(im.resize((w, h), Image.BOX)).astype(np.float32) / 255


def matte(name, img, box, pad=70, thr=(7, 34), lift_floor=0.22, solid=None):
    """3D illustration on a soft gradient: background from the surroundings (normalized
    convolution with the object masked out), alpha from the colour distance to it, colours
    de-contaminated at the edge. The slot is that background itself.
    solid: polygons (screen px) that are object for sure: pale, reflective parts whose colour
    is too close to the page for a colour matte (the iridescent cards in the holder)."""
    x0, y0, x1, y1 = box
    E = 40
    reg = img[y0 - E:y1 + E, x0 - E:x1 + E]
    ring = np.ones(reg.shape[:2], bool)
    ring[E:-E, E:-E] = False
    ref = np.median(reg[ring], axis=0)
    obj = np.abs(reg - ref).max(2) > 18
    force = np.zeros(reg.shape[:2], np.float32)
    for poly in solid or []:
        force = np.maximum(force, polygon_mask(reg.shape[:2], poly, x0 - E, y0 - E))
    obj = ndimage.binary_dilation(obj | (force > 0), iterations=8)
    keep = (~obj).astype(np.float32)
    w = ndimage.gaussian_filter(keep, 30)
    bg = np.stack([ndimage.gaussian_filter(reg[..., c] * keep, 30) for c in range(3)], -1) / np.maximum(w, 1e-3)[..., None]
    d = np.abs(reg - bg).max(2)
    a = np.clip((d - thr[0]) / (thr[1] - thr[0]), 0, 1)
    a = np.maximum(a, ndimage.binary_fill_holes(a > 0.5).astype(np.float32))   # reflections inside the object stay opaque
    a = np.where(a < lift_floor, 0, a)                      # drop the faint cast shadow: it stays on the page
    a = ndimage.gaussian_filter(a, 0.7)
    a = np.maximum(a, force)
    fg = (reg - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 0.05)
    fg = np.where(a[..., None] > 0.05, fg, reg)
    core = (slice(E, -E), slice(E, -E))
    rgb, al = with_shadow(np.clip(fg[core], 0, 255), a[core], pad, 30, 26, 0.30)
    M["cutouts"][name] = {"src": save_rgba(name, rgb, al), "box": [x0, y0, x1 - x0, y1 - y0], "pad": pad, "size": [x1 - x0 + 2 * pad, y1 - y0 + 2 * pad], "r": 0}
    # slot: the background where the object was
    M["slots"][name] = {"src": save_rgba("slot_" + name, bg[core], np.ones((y1 - y0, x1 - x0), np.float32)), "x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0}


# ------------------------------------------------------------------ screens
for n in ["home", "wallet", "wallet_s1", "swap", "cards", "stake", "home_s1"]:
    M["screens"]["pr_" + n] = save_rgb("pr_" + n, S[n])


# ------------------------------------------------------------------ scrolling pages
def offset(a, b, guess, rows, xs=(40, 880)):
    best, bd = None, 1e9
    for d in range(guess - 25, guess + 26):
        e = np.abs(a[rows[0]:rows[1], xs[0]:xs[1]] - b[rows[0] - d:rows[1] - d, xs[0]:xs[1]]).mean()
        if e < bd:
            best, bd = d, e
    return best, bd


# wallet: top screen down to just under the balance, then the scrolled screen (same layout, 503 px lower)
WD = 503


def page_tail(src):
    """What lies under the fixed tab bar at the page's end: the scrolled shot down to the bar's
    top, then its own bottom strip (below the bar) stretched to fill the rest of the screen, so
    the scrolled page never runs out above the screen's bottom edge."""
    B = S[src]
    strip = np.asarray(Image.fromarray(B[1892:SH].astype(np.uint8)).resize((SW, 270), Image.BILINEAR)).astype(np.float32)
    return [B[:1730], strip]


tail = page_tail("wallet_s1")
page = np.concatenate([S["wallet"][:805], tail[0][805 - WD:], tail[1]], axis=0)
M["overlays"]["page_wallet"] = {"src": save_rgb("page_wallet", page), "h": int(page.shape[0]), "scroll": WD}
# home: top screen, then the scrolled screen with the operations
hd, err = offset(S["home"], S["home_s1"], 1300, (1610, 1700), xs=(40, 660))   # matched on the card
SEAM = 1600
tail = page_tail("home_s1")
page = np.concatenate([S["home"][:SEAM], tail[0][SEAM - hd:], tail[1]], axis=0)
M["overlays"]["page_home"] = {"src": save_rgb("page_home", page), "h": int(page.shape[0]), "scroll": int(hd)}
print(f"home scroll {hd} (err {err:.2f}); pages ok")

# tab bars (per state) for the scrolling pages, and the sheet's black bottom corners
BAR_BOX = (0, 1700, SW, 1910)
PILL = (36, 1732, 883, 1887, 77)
CIRC = (459.5, 1805.5, 90.5)
bx0, by0, bx1, by1 = BAR_BOX
ba = np.zeros((by1 - by0, bx1 - bx0), np.float32)
ba[PILL[1] - by0:PILL[3] - by0, PILL[0]:PILL[2]] = sdf_rrect(PILL[2] - PILL[0], PILL[3] - PILL[1], PILL[4])
yy, xx = np.mgrid[by0:by1, bx0:bx1].astype(np.float32)
ba = np.maximum(ba, np.clip(0.5 - (np.sqrt((xx + 0.5 - CIRC[0]) ** 2 + (yy + 0.5 - CIRC[1]) ** 2) - CIRC[2]), 0, 1))
for key, src in [("bar_home", "home"), ("bar_home2", "home_s1"), ("bar_wallet", "wallet_s1")]:
    M["overlays"][key] = {"src": save_rgba("ov_" + key, S[src][by0:by1], ba), "y": by0, "h": by1 - by0}
lum = np.max(np.stack([S[n][1780:].mean(2) for n in ("home", "cards", "wallet_s1")]), axis=0)
ca = np.clip((236 - lum) / 236, 0, 1)
ca[ca < 0.05] = 0
ca[:, 210:710] = 0
M["overlays"]["corners"] = {"src": save_rgba("ov_corners", np.zeros(ca.shape + (3,), np.float32), ca), "y": 1780, "h": SH - 1780}
M["overlays"]["header"] = {"src": save_rgba("ov_header", S["home"][:HY], np.ones((HY, SW), np.float32)), "y": 0, "h": HY}

# ------------------------------------------------------------------ hook / home
COIN_ROWS = [("usdt", 834, 1001), ("usdc", 1006, 1178), ("btc", 1183, 1355), ("eth", 1360, 1531), ("trx", 1536, 1702)]
for n, a, b in COIN_ROWS:
    cut("pr_row_" + n, S["wallet_s1"], (48, a, 872, b), 30, pad=80)
    slot("row_" + n, S["wallet_s1"], (48, a, 872, b), m=2)
cut("pr_card", S["cards"], (47, 1078, 873, 1601), 50, pad=90)
slot("card", S["cards"], (47, 1078, 873, 1601), m=4)
cut("pr_balance", S["home"], (128, 518, 812, 824), 56)
slot("balance", S["home"], (128, 518, 812, 824), m=4)

# ------------------------------------------------------------------ wallet: shield + actions
matte("pr_shield", S["wallet"], (292, 440, 648, 700))
for n, x0, x1 in [("recv", 47, 309), ("swap", 329, 591), ("send", 611, 873)]:
    cut("pr_btn_" + n, S["wallet_s1"], (x0, 556, x1, 684), 64, pad=70, blur=22, dy=18)
    slot("btn_" + n, S["wallet_s1"], (x0, 556, x1, 684), m=4)

# ------------------------------------------------------------------ swap
# the round arrows button sits on the seam between the panels: take it out of the panels' pixels
# (their edges are horizontal there, so each row is rebuilt from the columns either side of it)
SWP = S["swap"].copy()
for ya, yb, ea, eb in ((830, 895, 830, 884), (919, 992, 930, 992)):    # (patch rows, rows away from the panel edge)
    lft = np.median(SWP[ya:yb, 376:386], axis=1)
    rgt = np.median(SWP[ya:yb, 534:544], axis=1)
    k = np.linspace(0, 1, 534 - 386)[None, :, None]
    patch = lft[:, None] * (1 - k) + rgt[:, None] * k
    # away from the panel's edge the surface is flat: smooth the row-to-row streaks of the JPEG
    sm = np.stack([ndimage.gaussian_filter(patch[..., c], (4, 2), mode="nearest") for c in range(3)], -1)
    patch[ea - ya:eb - ya] = sm[ea - ya:eb - ya]
    SWP[ya:yb, 386:534] = patch
cut("pr_give", SWP, (43, 557, 877, 894), 46)
cut("pr_get", SWP, (43, 920, 877, 1238), 46)
yy, xx = np.mgrid[848:950, 409:511].astype(np.float32)
circ = np.clip(0.5 - (np.sqrt((xx + 0.5 - 460) ** 2 + (yy + 0.5 - 899) ** 2) - 49.5), 0, 1)
cut("pr_swapbtn", S["swap"], (409, 848, 511, 950), 0, pad=50, blur=14, dy=10, op=0.22, alpha=circ)
slot("swap_panels", S["swap"], (43, 557, 877, 1238), m=6, fy=12)

# ------------------------------------------------------------------ cards
# the two cards (measured edges): back card 320..608, top edge 492 -> 462; front card top edge
# 544 -> 500 up to x 632; both go down into the holder, which the colour matte already holds
CARDS = [(320, 492.5), (608, 461.5), (609.5, 503), (632, 499.5), (633, 585), (320, 600)]
matte("pr_holder", S["cards"], (276, 452, 660, 782), solid=[CARDS])
cut("pr_today", S["cards"], (200, 983, 719, 1051), 34, pad=60, blur=18, dy=12, op=0.2)
slot("today", S["cards"], (200, 983, 719, 1051), m=4)
OPS = [("starbucks", 700, 886), ("topup", 907, 1091), ("topcard", 1113, 1298), ("usdt", 1320, 1504), ("nike", 1527, 1711)]
for n, a, b in OPS:
    cut("pr_op_" + n, S["home_s1"], (37, a, 883, b), 44, pad=80)

# ------------------------------------------------------------------ staking
matte("pr_safe", S["stake"], (322, 418, 604, 702))
cut("pr_apy", S["stake"], (636, 1060, 848, 1112), 14, pad=50, blur=14, dy=10, op=0.2)
slot("apy", S["stake"], (636, 1060, 848, 1112), m=3)
cut("pr_forecast", S["stake"], (238, 926, 680, 998), 36, pad=60, blur=18, dy=12, op=0.2)
slot("forecast", S["stake"], (238, 926, 680, 998), m=4)
cut("pr_staked", S["stake"], (226, 748, 694, 902), 40, pad=70)
slot("staked", S["stake"], (226, 748, 694, 902), m=4)

with open(os.path.join(ROOT, "assets", "manifest_promo.json"), "w") as f:
    json.dump(M, f, indent=1)
print("promo assets ok:", len(M["cutouts"]), "cutouts,", len(M["slots"]), "slots")
