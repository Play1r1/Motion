"""App tour tutorial ("Знакомство с INCPT Wallet"): assets from the shared screen library.

Source: assets/app/*.jpg (1206x2622 iOS screenshots, personal data already swapped by
tools/import_app.py). Everything is resized to our 920x2000 phone screen; UI is never redrawn.

    python3 tools/build_tour.py   -> assets/tour/build/* + assets/manifest_tour.json

Built here:
  - one status bar for every state (the screenshots were taken a minute apart, battery 28 -> 26 %)
  - scrolling pages for Home and Profile, stitched from two screenshots each
  - the Telegram header, the tab bar (per state) and the sheet's black bottom corners as overlays
  - cut-outs of the pieces that lift off, each with a clean slot patch for the place it leaves
  - the cards carousel: both cards as cut-outs over a clean band, so a swipe can move them
  - round icon badges of every tab in its active state (for the step card)
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import sdf_rrect, to_img, with_shadow  # noqa: E402

APP = os.path.join(ROOT, "assets", "app")
OUT = os.path.join(ROOT, "assets", "tour", "build")
os.makedirs(OUT, exist_ok=True)
SW, SH = 920, 2000
HY = 302                     # the Telegram header ends here; web content scrolls below it
STATUS = 130                 # status-bar rows (time, battery) taken from one screenshot for all


def load(n):
    im = Image.open(os.path.join(APP, f"{n}.jpg")).convert("RGB").resize((SW, SH), Image.LANCZOS)
    return np.asarray(im).astype(np.float32)


NAMES = ["home", "home_s1", "cards", "cards_add", "wallet", "stake", "profile", "profile_s1"]
S = {n: load(n) for n in NAMES}
for n in NAMES:
    S[n][:STATUS] = S["home"][:STATUS]

manifest = {"screens": {}, "cutouts": {}, "slots": {}, "rects": {}, "overlays": {}, "icons": {}, "headerY": HY}


def rel(name):
    return f"tour/build/{name}"


def save_rgba(name, rgb, a):
    to_img(rgb, a).save(os.path.join(OUT, name + ".png"), compress_level=3)
    return rel(name + ".png")


def save_rgb(name, rgb, q=94):
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name + ".jpg"), quality=q, subsampling=0)
    return rel(name + ".jpg")


# ------------------------------------------------------------------ static screens
for n in ["cards", "cards_add", "wallet", "stake"]:
    manifest["screens"]["tr_" + n] = save_rgb("tr_" + n, S[n])


# ------------------------------------------------------------------ scrolling pages
def offset(a, b, guess, rows=(1400, 1600)):
    """Scroll distance between two screenshots of the same page (a[y] == b[y - d])."""
    best, bd = None, 1e9
    for d in range(guess - 30, guess + 31):
        e = np.abs(a[rows[0]:rows[1], 30:890] - b[rows[0] - d:rows[1] - d, 30:890]).mean()
        if e < bd:
            best, bd = d, e
    return best, bd


SEAM = 1600                  # above the tab bar and its shadow in the first screenshot
pages = {}
for key, a, b, guess in [("home", "home", "home_s1", 1023), ("profile", "profile", "profile_s1", 1067)]:
    d, err = offset(S[a], S[b], guess)
    page = np.concatenate([S[a][:SEAM], S[b][SEAM - d:]], axis=0)
    pages[key] = page
    manifest["overlays"]["page_" + key] = {"src": save_rgb("page_" + key, page), "h": int(page.shape[0]), "scroll": int(d)}
    print(f"page {key}: scroll {d} (match err {err:.2f}), height {page.shape[0]}")

# ------------------------------------------------------------------ overlays
manifest["overlays"]["header"] = {"src": save_rgba("ov_header", S["home"][:HY], np.ones((HY, SW), np.float32)), "y": 0, "h": HY}

# the Telegram sheet's black bottom corners: black in every screenshot, whatever the content
CY = 1780
lum = np.max(np.stack([S[n][CY:].mean(2) for n in NAMES]), axis=0)
ca = np.clip((236 - lum) / 236, 0, 1)
ca[ca < 0.05] = 0
ca[:, 210:710] = 0
manifest["overlays"]["corners"] = {"src": save_rgba("ov_corners", np.zeros(ca.shape + (3,), np.float32), ca), "y": CY, "h": SH - CY}

# tab bar: a pill plus the round centre (wallet) button that rises above it
BAR_BOX = (0, 1700, SW, 1910)
PILL = (36, 1732, 883, 1887, 77)
CIRC = (459.5, 1805.5, 90.5)


def bar_alpha():
    x0, y0, x1, y1 = BAR_BOX
    a = np.zeros((y1 - y0, x1 - x0), np.float32)
    px0, py0, px1, py1, r = PILL
    a[py0 - y0:py1 - y0, px0 - x0:px1 - x0] = sdf_rrect(px1 - px0, py1 - py0, r)
    ys, xs = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    d = np.sqrt((xs + 0.5 - CIRC[0]) ** 2 + (ys + 0.5 - CIRC[1]) ** 2) - CIRC[2]
    return np.maximum(a, np.clip(0.5 - d, 0, 1))


BA = bar_alpha()
for key, src in [("bar_home", "home"), ("bar_home2", "home_s1"), ("bar_profile", "profile"), ("bar_profile2", "profile_s1")]:
    x0, y0, x1, y1 = BAR_BOX
    manifest["overlays"][key] = {"src": save_rgba("ov_" + key, S[src][y0:y1, x0:x1], BA), "y": y0, "h": y1 - y0}


# ------------------------------------------------------------------ cut-outs and slots
def cut(name, img, box, r=None, alpha=None, pad=90, blur=26, dy=22, op=0.26):
    """Alpha cut-out of a UI element (true pixels) with a contour shadow baked in."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    a = alpha if alpha is not None else sdf_rrect(w, h, r, inset=0.8)
    rgb, al = with_shadow(img[y0:y1, x0:x1], a, pad, blur, dy, op)
    manifest["cutouts"][name] = {"src": save_rgba(name, rgb, al), "box": [x0, y0, w, h], "pad": pad,
                                 "size": [w + 2 * pad, h + 2 * pad], "r": r or 0}


def slot(name, img, box, m=6, fy=3):
    """Clean background for the place an element leaves: rows above and below, blended."""
    x0, y0, x1, y1 = box[0] - m, box[1] - m, box[2] + m, box[3] + m
    h = y1 - y0
    top = np.median(img[y0 - 6:y0 - 1, x0:x1], axis=0)
    bot = np.median(img[y1 + 1:y1 + 6, x0:x1], axis=0)
    k = np.linspace(0, 1, h)[:, None, None]
    patch = top[None] * (1 - k) + bot[None] * k
    patch = np.stack([ndimage.gaussian_filter(patch[..., c], (fy, 6), mode="nearest") for c in range(3)], -1)
    ys, xs = np.mgrid[0:h, 0:x1 - x0]
    edge = np.minimum.reduce([xs, ys, x1 - x0 - 1 - xs, h - 1 - ys]).astype(np.float32)
    manifest["slots"][name] = {"src": save_rgba("slot_" + name, patch, np.clip(edge / 3.0, 0, 1)), "x": x0, "y": y0, "w": x1 - x0, "h": h}


def rect(name, box, r):
    """Highlight target (920x2000 screen coords; page targets are given at the scroll they are shown at)."""
    x0, y0, x1, y1 = box
    manifest["rects"][name] = [x0, y0, x1 - x0, y1 - y0, r]


x0, y0, x1, y1 = BAR_BOX
cut("tr_tabbar", S["home"], BAR_BOX, alpha=BA, pad=80, blur=24, dy=18, op=0.24)

BAL = (232, 518, 688, 826)
cut("tr_balance", pages["home"], BAL, 52)
slot("balance", pages["home"], BAL, m=4)

ACT = (52, 950, 868, 1162)
cut("tr_actions", S["cards"], ACT, 56)
slot("actions", S["cards"], ACT, m=4)

SOON = (186, 888, 734, 1277)
cut("tr_soon", S["stake"], SOON, 46)
slot("soon", S["stake"], SOON, m=6, fy=10)

SEC = (37, 1271, 883, 1733)
cut("tr_secure", pages["profile"], SEC, 48)
slot("secure", pages["profile"], SEC, m=4)

# cards carousel: card #2 and the "add card" tile, one card pitch apart, over a clean band
CARD = (69, 397, 851, 892)
cut("tr_card2", S["cards"], CARD, 56, pad=60, blur=22, dy=16, op=0.2)
cut("tr_cardadd", S["cards_add"], CARD, 56, pad=60, blur=22, dy=16, op=0.0)
BAND = (0, 380, SW, 952)               # starts below the descenders of «Мои карты»
bx0, by0, bx1, by1 = BAND
top = np.median(S["cards"][by0 - 6:by0 - 1], axis=0)
bot = np.median(S["cards"][by1 + 1:by1 + 6], axis=0)
k = np.linspace(0, 1, by1 - by0)[:, None, None]
band = top[None] * (1 - k) + bot[None] * k
band = np.stack([ndimage.gaussian_filter(band[..., c], (3, 8), mode="nearest") for c in range(3)], -1)
manifest["overlays"]["card_band"] = {"src": save_rgb("ov_card_band", band), "y": by0, "h": by1 - by0}
manifest["cardPitch"] = 809

# ------------------------------------------------------------------ tab icons (active state) for the step card
for key, src, (cx, cy, r) in [("home", "home", (114.5, 1808, 64)), ("cards", "cards", (270, 1808, 64)),
                              ("wallet", "wallet", (459.5, 1805.5, 91)), ("stake", "stake", (650, 1808, 64)),
                              ("profile", "profile", (805, 1808, 64))]:
    R = int(r + 10)
    ix0, iy0 = int(round(cx - R)), int(round(cy - R))
    crop = S[src][iy0:iy0 + 2 * R, ix0:ix0 + 2 * R]
    ys, xs = np.mgrid[0:2 * R, 0:2 * R].astype(np.float32)
    d = np.sqrt((xs + ix0 + 0.5 - cx) ** 2 + (ys + iy0 + 0.5 - cy) ** 2) - r
    manifest["icons"][key] = save_rgba("icon_" + key, crop, np.clip(0.5 - d, 0, 1))

# ------------------------------------------------------------------ highlight targets
TAB = {"home": 114.5, "cards": 270, "stake": 650, "profile": 805}
for n, cx in TAB.items():
    rect("tab_" + n, (cx - 64, 1744, cx + 64, 1872), 64)
rect("tab_wallet", (368, 1714, 551, 1897), 92)
rect("tabbar", (36, 1714, 883, 1897), 77)
rect("balance", BAL, 52)
rect("buttons", (30, 869, 890, 1008), 69)
HS = 700                                         # home page scroll for the "below" beat
manifest["homeScroll"] = HS
rect("defi", (37, 1122 - HS, 883, 1272 - HS), 42)
rect("card", (37, 1437 - HS, 666, 1834 - HS), 44)
rect("ops", (30, 1905 - HS, 890, 1712), 44)
rect("actions", ACT, 56)
rect("addcard", CARD, 56)
rect("assets", (37, 1062, 883, 1730), 44)
for n, a, b in [("usdt", 1064, 1238), ("usdc", 1240, 1412), ("eth", 1414, 1586), ("btc", 1588, 1730)]:
    rect("row_" + n, (37, a, 883, b), 40)
rect("soon", SOON, 46)
rect("idcard", (37, 921, 883, 1233), 48)
rect("secure", SEC, 48)
PS = int(manifest["overlays"]["page_profile"]["scroll"])
rect("lang", (37, 703, 883, 868), 48)            # at profile scroll PS
rect("settings", (37, 904, 883, 1516), 48)

with open(os.path.join(ROOT, "assets", "manifest_tour.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print("tour assets ok:", len(manifest["cutouts"]), "cutouts,", len(manifest["slots"]), "slots,", len(manifest["rects"]), "rects")
