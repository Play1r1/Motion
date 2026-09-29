"""Top-up tutorial: pull the app UI out of the team's beta video and build its assets.

The beta (assets/topup/source/beta.mp4, 1280x1280) shows the INCPT Wallet screens in a static
phone drawing; its screen is x 412..867, y 172..1162 (456x991). The content is cut out frame-exactly,
shifted down 12 px so the status bar lines up with our Dynamic Island, the beta's island / recording
outline is painted out, and the result is upscaled to our 920x2000 screen. UI pixels are never redrawn.

    python3 tools/build_topup.py   -> assets/topup/build/* + assets/manifest_topup.json
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
from imgkit import sdf_rrect, to_img, with_shadow  # noqa: E402

SRC = os.path.join(ROOT, "assets", "topup", "source", "beta.mp4")
OUT = os.path.join(ROOT, "assets", "topup", "build")
FRAMES = os.path.join(OUT, "_frames")
os.makedirs(FRAMES, exist_ok=True)
if not os.path.exists(os.path.join(FRAMES, "f_545.png")):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, os.path.join(FRAMES, "f_%03d.png")], check=True)

SW, SH = 920, 2000
X0, X1 = 414, 866            # screen columns in the beta frame (inside the drawn bezel)
CH = round((X1 - X0) * SH / SW)
T = 70                       # rows from our screen top to the Telegram sheet's top edge (status band)
ISLAND_BOTTOM = 231          # the beta's island is part of its (static) phone drawing


def frame(i):
    return np.asarray(Image.open(os.path.join(FRAMES, f"f_{i:03d}.png")).convert("RGB")).astype(np.float32)


def sheet_top(f):
    """The beta's app content drifts a little between frames; the Telegram sheet's top edge
    (black status band -> light sheet) is the anchor every state is aligned to."""
    col = np.concatenate([f[:, 470:530], f[:, 745:800]], axis=1).mean(axis=(1, 2))
    for y in range(190, 320):
        if col[y] > 95 and col[y - 3] < 60:
            return y
    raise RuntimeError("sheet top not found")


def screen(i):
    f = frame(i)
    st = sheet_top(f)
    y0 = st - T
    s = f[y0:y0 + CH, X0:X1].copy()
    # status band: black, except the real time (left) and status icons (right)
    band = s[:T - 1]
    keep = np.zeros(band.shape[:2], bool)
    tr = T - 37                                              # status-bar text centre row
    keep[tr - 12:tr + 12, :98] = True
    keep[tr - 12:tr + 12, 334:] = True
    band[~keep] = 0
    band[band.mean(axis=2) < 70] = 0                         # bezel shading around the glyphs
    # the beta's island can hang over the sheet's top edge: extend the sheet colour up under it
    over = ISLAND_BOTTOM - st
    if over > -2:
        s[T - 1:T + over + 3, 146:306] = s[T + over + 5:T + over + 6, 146:306]
    im = Image.fromarray(np.clip(s, 0, 255).astype(np.uint8)).resize((SW, SH), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.8, percent=60, threshold=1))
    return np.asarray(im).astype(np.float32)


manifest = {"screens": {}, "cutouts": {}, "slots": {}, "rects": {}}
STATES = {"tu_home": 30, "tu_wallet": 85, "tu_sheet": 155, "tu_qr": 470}
S = {name: screen(fi) for name, fi in STATES.items()}
# one clean status bar for every state (the home frame's time is clipped by the beta's bezel)
BAND = int((T - 2) * SW / (X1 - X0))
for name in S:
    S[name][:BAND] = S["tu_wallet"][:BAND]
    Image.fromarray(S[name].astype(np.uint8)).save(os.path.join(OUT, f"{name}.png"), compress_level=3)
    manifest["screens"][name] = f"topup/build/{name}.png"

if "--states" in sys.argv:
    print("states only")
    sys.exit(0)


def save(name, rgb, a):
    to_img(rgb, a).save(os.path.join(OUT, f"{name}.png"), compress_level=3)
    return f"topup/build/{name}.png"


def cut(name, state, box, r, pad=90, inset=0.8, blur=26, dy=22, op=0.26):
    """Alpha cut-out of a UI element (true pixels) with a contour shadow baked in."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    a = sdf_rrect(w, h, r, inset=inset)
    rgb, al = with_shadow(S[state][y0:y1, x0:x1], a, pad, blur, dy, op)
    manifest["cutouts"][name] = {"src": save(name, rgb, al), "screen": state, "box": [x0, y0, w, h], "pad": pad,
                                 "size": [w + 2 * pad, h + 2 * pad], "r": r}


def rect(name, box, r):
    """Highlight target on a screen (920x2000 coords): the ring and the dimming hole use it."""
    x0, y0, x1, y1 = box
    manifest["rects"][name] = [x0, y0, x1 - x0, y1 - y0, r]


def slot(name, state, box, m=6):
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


# ------------------------------------------------------------------ layout facts
manifest["headerY"] = 302            # Telegram header ends; the web content (and the sheet's dim) starts here
manifest["dim"] = 0.345              # the sheet's backdrop is the page at 0.655 brightness
SHEET_Y = 996

# the "Пополнение криптовалюты" sheet: rounded top corners, slides up over the dimmed page
hh = SH - SHEET_Y
a = sdf_rrect(SW, hh + 120, 40)[:hh]
save("tu_sheet_panel", S["tu_sheet"][SHEET_Y:], a)
manifest["sheet"] = {"src": "topup/build/tu_sheet_panel.png", "y": SHEET_Y, "h": hh}

# highlight targets (screen coords)
rect("home_tab", (361, 1769, 559, 1966), 99)
rect("recv", (24, 787, 448, 911), 62)
ROWS = [("row_tether", 1205, 1385), ("row_usdc", 1385, 1565), ("row_eth", 1565, 1746), ("row_btc", 1746, 1927)]
for n, y0, y1 in ROWS:
    rect(n, (25, y0, 895, y1), 36)
rect("toggle", (283, 1158, 637, 1249), 46)
rect("trc", (289, 1165, 455, 1242), 38)
rect("qr", (160, 500, 760, 1102), 52)
rect("addr", (23, 1366, 895, 1546), 44)
rect("copy", (800, 1426, 862, 1488), 31)
rect("warn", (70, 1590, 850, 1694), 34)

# lifted pieces (with clean slots underneath, so nothing is ever shown twice)
cut("tu_toggle", "tu_qr", (283, 1158, 637, 1249), 46)
cut("tu_addr", "tu_qr", (23, 1366, 895, 1546), 44)
cut("tu_warn", "tu_qr", (70, 1590, 850, 1694), 34)
slot("qr_toggle", "tu_qr", (283, 1158, 637, 1249), m=6)
slot("qr_addr", "tu_qr", (23, 1366, 895, 1546), m=6)
slot("qr_warn", "tu_qr", (70, 1590, 850, 1694), m=4)

# the pointer is the INCPT logo; its tip is the rightmost point of the boomerang
lg = np.asarray(Image.open(os.path.join(ROOT, "assets", "build", "logo.png")))[..., 3].astype(np.float32) / 255
ys, xs = np.where(lg > 0.5)
k = np.argmax(xs)
tip_y = int(np.median(ys[xs >= xs[k] - 2]))
manifest["pointer"] = {"src": "build/logo.png", "shadow": "build/logo_shadow.png", "size": [lg.shape[1], lg.shape[0]],
                       "tip": [int(xs[k]), tip_y], "shadowPad": 140}

with open(os.path.join(ROOT, "assets", "manifest_topup.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print("topup assets ok:", len(manifest["cutouts"]), "cutouts,", len(manifest["rects"]), "rects")
