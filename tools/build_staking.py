"""Staking announcement: pull the app UI out of the prototype video and build its assets.

The prototype (assets/staking/source/prototype.mp4, 1080x1920) shows the staking screens
inside a flat phone drawing. Its screen area (x 210..870, y 450..1885 = 660x1435) is cut
out frame-exactly, cleaned (prototype island/bezel removed) and upscaled to our 920x2000
screen format. Nothing on the UI is redrawn: every pixel comes from the prototype.

    python3 tools/build_staking.py   -> assets/staking/build/* + assets/manifest_staking.json
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SRC = os.path.join(ROOT, "assets", "staking", "source", "prototype.mp4")
OUT = os.path.join(ROOT, "assets", "staking", "build")
os.makedirs(OUT, exist_ok=True)
FRAMES = os.path.join(OUT, "_frames")
os.makedirs(FRAMES, exist_ok=True)

SW, SH = 920, 2000
X0, Y0, CW, CH = 210, 450, 660, 1435          # screen rect inside the prototype frame
K = SW / CW                                   # 1.3939 upscale
BG = np.array([235, 238, 245], np.float32)    # prototype screen background

if not os.path.exists(os.path.join(FRAMES, "f_420.png")):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, os.path.join(FRAMES, "f_%03d.png")], check=True)


def frame(i):
    return np.asarray(Image.open(os.path.join(FRAMES, f"f_{i:03d}.png")).convert("RGB")).astype(np.float32)


def screen(i):
    """Frame i's screen, cleaned and upscaled to 920x2000 (float RGB)."""
    s = frame(i)[Y0:Y0 + CH, X0:X0 + CW].copy()
    # rows 0..74 hold only the prototype's island + bezel corners: rebuild as plain status-bar bg
    s[:75] = s[75:76].mean(axis=1, keepdims=True) * 0 + s[76, 20]
    s[:, :3] = s[:, 3:4]
    s[:, -3:] = s[:, -4:-3]
    im = Image.fromarray(np.clip(s, 0, 255).astype(np.uint8)).resize((SW, SH), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=1))
    return np.asarray(im).astype(np.float32)


manifest = {"screens": {}, "cutouts": {}, "slots": {}, "flip": {}}

# ------------------------------------------------------------------ screen states
STATES = {"stk_top": 60, "stk_amount": 150, "stk_amount600": 240, "stk_success": 400}
S = {}
for name, fi in STATES.items():
    S[name] = screen(fi)
    Image.fromarray(S[name].astype(np.uint8)).save(os.path.join(OUT, f"{name}.png"), compress_level=3)
    manifest["screens"][name] = f"staking/build/{name}.png"

from imgkit import sdf_rrect, to_img, with_shadow  # noqa: E402


def save(name, rgb, a):
    to_img(rgb, a).save(os.path.join(OUT, f"{name}.png"), compress_level=3)
    return f"staking/build/{name}.png"


def cut(name, state, box, r, pad=90, shape="rrect", inset=0.8, blur=26, dy=22, op=0.26, arr=None):
    """Alpha cut-out of a UI element (true pixels) with a contour shadow baked in."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    src = S[state] if arr is None else arr
    crop = src[y0:y1, x0:x1]
    if shape == "circle":
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
        d = np.sqrt((xx - w / 2) ** 2 + (yy - h / 2) ** 2) - (min(w, h) / 2 - inset)
        a = np.clip(0.5 - d, 0, 1)
    else:
        a = sdf_rrect(w, h, r, inset=inset)
    rgb, al = with_shadow(crop, a, pad, blur, dy, op)
    manifest["cutouts"][name] = {"src": save(name, rgb, al), "screen": state, "box": [x0, y0, w, h], "pad": pad,
                                 "size": [w + 2 * pad, h + 2 * pad], "r": r}


def slot(name, state, box, m=6):
    """Clean screen-background patch that hides an element's slot once it has lifted off."""
    arr = S[state]
    x0, y0, x1, y1 = box[0] - m, box[1] - m, box[2] + m, box[3] + m
    h = y1 - y0
    top, bot = arr[y0 - 3, x0:x1], arr[y1 + 2, x0:x1]
    k = np.linspace(0, 1, h)[:, None, None]
    patch = top[None] * (1 - k) + bot[None] * k
    patch = np.stack([ndimage.gaussian_filter(patch[..., c], (0, 4)) for c in range(3)], -1)
    ys, xs = np.mgrid[0:h, 0:x1 - x0]
    edge = np.minimum.reduce([xs, ys, x1 - x0 - 1 - xs, h - 1 - ys]).astype(np.float32)
    manifest["slots"][name] = {"src": save("slot_" + name, patch, np.clip(edge / 3.0, 0, 1)), "x": x0, "y": y0, "w": x1 - x0, "h": h}


# ------------------------------------------------------------------ top screen
cut("stk_chip_today", "stk_top", (295, 821, 626, 885), 32)
cut("stk_panel_top", "stk_top", (75, 1022, 846, 1273), 34, pad=110, blur=34, dy=28, op=0.28)
slot("top_chip", "stk_top", (295, 821, 626, 885), m=8)
slot("top_safe", "stk_top", (296, 292, 624, 626), m=4)

# the safe: free-form matte against the flat screen background
sx0, sy0, sx1, sy1 = 280, 280, 640, 640
reg = S["stk_top"][sy0:sy1, sx0:sx1]
bgc = np.median(np.concatenate([reg[:6].reshape(-1, 3), reg[-6:].reshape(-1, 3), reg[:, :6].reshape(-1, 3)]), axis=0)
dist = np.sqrt(((reg - bgc) ** 2).sum(axis=2))
core = ndimage.binary_fill_holes(dist > 18)
core = ndimage.binary_opening(core, iterations=2)
lab, n = ndimage.label(core)
core = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
core = ndimage.binary_erosion(core, iterations=1)
lum, lbg = reg.mean(axis=2), bgc.mean()
a = np.clip((dist - 6) / 26, 0, 1) * (lum < lbg + 2)          # the pale glow halo counts as background
a = np.where(core, 1.0, a * ndimage.binary_dilation(core, iterations=2))
# below the body only the dark feet belong to the safe; the pale floor shadow between them is
# the prototype's background. The cut row is where the core stops being mostly dark body.
dark = lum < 125
ys_ = np.where(core.any(axis=1))[0]
cut_row = ys_.max()
while cut_row > ys_.min() and (dark[cut_row - 1] & core[cut_row - 1]).sum() / max(1, core[cut_row - 1].sum()) < 0.55:
    cut_row -= 1          # walk up from the bottom until rows are mostly dark body again
below = np.zeros_like(core)
below[cut_row:] = True
feet = ndimage.binary_dilation(dark & core & below, iterations=1)
a = np.where(below, a * feet, a)
a = ndimage.gaussian_filter(a, 0.8)
fg = np.clip((reg - (1 - a[..., None]) * bgc) / np.maximum(a, 0.05)[..., None], 0, 255)
rgb, al = with_shadow(fg, a, 120, 34, 30, 0.34)
manifest["cutouts"]["stk_safe"] = {"src": save("stk_safe", rgb, al), "screen": "stk_top", "box": [sx0, sy0, sx1 - sx0, sy1 - sy0],
                                   "pad": 120, "size": [sx1 - sx0 + 240, sy1 - sy0 + 240], "r": 0}

# ------------------------------------------------------------------ amount screen
PANEL = (75, 390, 846, 641)
cut("stk_chip500", "stk_amount", (468, 674, 649, 755), 26)
cut("stk_profit130", "stk_amount", (75, 783, 846, 872), 26)
cut("stk_profit780", "stk_amount600", (75, 783, 846, 872), 26)
cut("stk_button", "stk_amount600", (75, 900, 846, 998), 49)
slot("amt_panel", "stk_amount", PANEL, m=8)
slot("amt_chip500", "stk_amount", (468, 674, 649, 755), m=6)
slot("amt_profit", "stk_amount", (75, 783, 846, 872), m=6)
slot("amt_button", "stk_amount600", (75, 900, 846, 998), m=6)

# counter flip-book: the amount panel from every prototype frame the number changes on
flip = []
for fi in [150] + list(range(167, 186)):
    name = f"stk_panel_{fi:03d}"
    cut(name, "stk_amount", PANEL, 34, pad=110, blur=34, dy=28, op=0.28, arr=screen(fi))
    flip.append(name)
manifest["flip"]["amount"] = flip

# ------------------------------------------------------------------ success screen
cut("stk_check", "stk_success", (332, 310, 588, 566), 0, shape="circle", pad=90, blur=30, dy=24, op=0.22)
cut("stk_card600", "stk_success", (74, 766, 847, 1248), 36, pad=120, blur=40, dy=34, op=0.28)
ROWS = [(70, 1300, 640, 1366), (70, 1378, 580, 1444), (70, 1456, 600, 1522)]
for i, b in enumerate(ROWS):
    cut(f"stk_row{i}", "stk_success", b, 33)
    slot(f"succ_row{i}", "stk_success", b, m=4)
slot("succ_check", "stk_success", (332, 310, 588, 566), m=6)
slot("succ_card", "stk_success", (74, 766, 847, 1260), m=6)

with open(os.path.join(ROOT, "assets", "manifest_staking.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print("staking assets ok:", len(manifest["cutouts"]), "cutouts,", len(manifest["slots"]), "slots,", len(flip), "flip frames")
