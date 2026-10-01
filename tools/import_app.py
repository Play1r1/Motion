"""Import the team's screenshots of the new INCPT Wallet interface into assets/app, cleaned.

    python3 tools/import_app.py [reference/app_v2/new_ui.pdf]   -> assets/app/<name>.jpg (920x2000)
                                                                  + out/app_clean/sheet.jpg (before | after)

The PDF (kept in git-ignored reference/) holds 17 iOS screenshots that were run through an AI
editor to raise the balances. That pass left artefacts, and every fix here is deterministic (no AI):
  1. pages come out of the PDF losslessly and are scaled to the phone screen (920x2000)
  2. geometry: the fixed parts sit where the real app draws them
     - staking deposits (both variants): the tab bar sat 35 px low -> content and bar moved up
     - wallet top: the coin list was squeezed (row pitch 147 px instead of 176) and the tab bar
       dropped off the screen -> everything under the hero is rebuilt from the scrolled wallet page
       (true geometry, and the BTC row there agrees with 0.5 BTC = $41,996.01)
  3. de-ringing: the AI's sharpening put a halo around every glyph and icon -> removed
  4. JPEG mottling in flat areas smoothed (edges and textures untouched)
  5. one status bar (16:48, 27 %) and one Telegram header (Close / Back) shared by every page
  6. QR codes: the AI drew undecodable patterns with holes -> crisp QR with a harmless demo payload
  7. the big balances the AI redrew (a "1" with a foot, heavy halos) re-set in Inter, the app's font
"""
import glob
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import sdf_rrect  # noqa: E402

PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "reference", "app_v2", "new_ui.pdf")
TMP = os.path.join(ROOT, "out", "app_clean")
OUT = os.path.join(ROOT, "assets", "app")
os.makedirs(TMP, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
SW, SH = 920, 2000
HY = 302                     # Telegram header ends; web content below
TOP = 146                    # status bar + the Telegram chrome above the sheet's top edge

# PDF page order -> library name
PAGES = ["stake", "home_s1", "send", "receive_trc20", "send_pick", "receive_erc20", "stake_s1", "stake_s1_alt",
         "cards_s1", "cards", "home", "wallet_s1", "receive_pick", "swap_s1", "profile", "swap", "wallet"]
BACK = {"send", "receive_trc20", "receive_erc20", "swap_s1", "swap"}       # pages with "< Back" in the header

for f in glob.glob(os.path.join(TMP, "p-*")):
    os.remove(f)
subprocess.run(["pdfimages", "-j", PDF, os.path.join(TMP, "p")], check=True)
src = sorted(glob.glob(os.path.join(TMP, "p-*.jpg")))
assert len(src) == len(PAGES), f"expected {len(PAGES)} pages, got {len(src)}"
RAW = {n: np.asarray(Image.open(p).convert("RGB").resize((SW, SH), Image.LANCZOS)).astype(np.float32) for n, p in zip(PAGES, src)}
S = {n: a.copy() for n, a in RAW.items()}


# ------------------------------------------------------------------ tab bar (pill + round centre button)
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


BA = bar_alpha()[..., None]


def paste_bar(dst, src):
    """Lay the tab bar of `src` (true position) over `dst`."""
    x0, y0, x1, y1 = BAR_BOX
    dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - BA) + src[y0:y1, x0:x1] * BA


def vfill(a, y0, y1):
    """Fill rows y0..y1 with a smooth blend of the rows just outside (page background)."""
    top = np.median(a[y0 - 6:y0 - 1], axis=0)
    bot = np.median(a[y1 + 1:y1 + 6], axis=0)
    k = np.linspace(0, 1, y1 - y0)[:, None, None]
    patch = top[None] * (1 - k) + bot[None] * k
    a[y0:y1] = np.stack([ndimage.gaussian_filter(patch[..., c], (2, 6), mode="nearest") for c in range(3)], -1)


# ------------------------------------------------------------------ 2. geometry
# staking deposits: everything under the header moves up 35 px, the bar goes back to its place
for n in ("stake_s1", "stake_s1_alt"):
    a, o = S[n], RAW[n]
    a[HY:1930] = o[HY + 35:1965]           # content and the page's own bar (plain background behind it)
    k = np.linspace(0, 1, 30)[:, None, None]
    a[1915:1945] = o[1950:1980] * (1 - k) + o[1915:1945] * k   # blend into the screen's own bottom edge

# wallet top: the page's own hero (title + shield) above, the scrolled wallet page (true geometry) below
D = 503                      # wallet_s1 content sits 503 px higher (balance centre 325 -> 828)
w, ws = S["wallet"], RAW["wallet_s1"]
SEAM = 772                   # just above the balance; rows from here down come from wallet_s1
w[SEAM:SH] = 0
w[HY + D:SH] = ws[HY:SH - D]
vfill(w, SEAM, HY + D)       # the gap above wallet_s1's first content row (only background + the balance top)
paste_bar(w, ws)
# the sheet's black bottom corners (they belong to the screen, not to the page)
lum = np.max(np.stack([RAW[n][1780:].mean(2) for n in ("home", "cards", "profile", "wallet_s1")]), axis=0)
ca = np.clip((236 - lum) / 236, 0, 1)
ca[ca < 0.05] = 0
ca[:, 210:710] = 0
w[1780:] *= 1 - ca[..., None]


# ------------------------------------------------------------------ 3./4. de-ringing + flat-area smoothing
def background(I, core, sigma=7):
    """Colour of the surface under/around glyphs: normalized convolution that ignores them."""
    M = 1 - ndimage.binary_dilation(core, iterations=2).astype(np.float32)
    wgt = ndimage.gaussian_filter(M, sigma)
    out = np.stack([ndimage.gaussian_filter(I[..., c] * M, sigma) for c in range(3)], -1) / np.maximum(wgt, 1e-3)[..., None]
    return out, wgt


def dering(I):
    L = I.mean(2)
    clo = ndimage.grey_closing(L, size=(27, 27))       # dark strokes thinner than 27 px removed
    opn = ndimage.grey_opening(L, size=(27, 27))       # light strokes removed
    core = ((clo - L) > 50) | ((L - opn) > 50)
    bg, wgt = background(I, core)
    Lb = bg.mean(2)
    neutral = (I.max(2) - I.min(2)) < 50           # text and line icons; coloured shapes (card logos) are left alone
    out = I.copy()
    # dark glyphs on a light surface, light glyphs on a dark one (a light gap between two dark
    # shapes is not a glyph)
    for cm, dark in (((Lb - L > 50) & (Lb > 150) & neutral, True), ((L - Lb > 50) & (Lb < 110) & neutral, False)):
        lab, n = ndimage.label(cm)
        if n == 0:
            continue
        area = ndimage.sum(np.ones_like(L), lab, index=np.arange(1, n + 1))
        keep = np.zeros(n + 1, bool)
        for i, (s, ar) in enumerate(zip(ndimage.find_objects(lab), area)):
            keep[i + 1] = ar < 6000 and s[0].stop - s[0].start < 140 and s[1].stop - s[1].start < 300
        tc = keep[lab]                                   # glyphs and line icons, not cards or pictures
        b1 = ndimage.binary_dilation(tc, iterations=2) & ~tc & (wgt > 0.3)
        b2 = ndimage.binary_dilation(tc, iterations=7) & ~ndimage.binary_dilation(tc, iterations=2) & (wgt > 0.3)
        out[b1] = np.minimum(out[b1], bg[b1]) if dark else np.maximum(out[b1], bg[b1])   # overshoot next to the edge
        flat = b2 & (np.abs(out - bg).max(2) < 34)                                         # the ring further out
        out[flat] = bg[flat]
    # flat areas: smooth the JPEG mottling, leave every edge and texture alone
    L = out.mean(2)
    sd = np.sqrt(np.maximum(ndimage.uniform_filter(L * L, 7) - ndimage.uniform_filter(L, 7) ** 2, 0))
    g = np.hypot(ndimage.sobel(L, 0), ndimage.sobel(L, 1))
    calm = (sd < 1.8) & ~ndimage.binary_dilation(g > 24, iterations=3)
    m = ndimage.gaussian_filter(calm.astype(np.float32), 1.5)[..., None]
    sm = np.stack([ndimage.gaussian_filter(out[..., c], 1.4) for c in range(3)], -1)
    return out * (1 - m) + sm * m


for n in PAGES:
    S[n] = dering(S[n])
    print("clean", n)

# ------------------------------------------------------------------ 5. one status bar, one header
# (status bar 16:48 / 27 % from the scrolled wallet; header from pages whose content stays clear of it)
STATUS_SRC = S["wallet_s1"][:TOP].copy()
HDR = {False: S["home"][TOP:HY].copy(), True: S["send"][TOP:HY].copy()}
for n in PAGES:
    S[n][:TOP] = STATUS_SRC
    S[n][TOP:HY] = HDR[n in BACK]


# ------------------------------------------------------------------ 6. QR codes
def qr(a, x0, y0, payload, n=29, size=476):
    """A crisp, valid QR in place of the AI's pattern; the payload is a harmless demo text, so a
    viewer who scans the screen gets no address to send money to."""
    import segno
    m = np.array([[1 if v else 0 for v in row] for row in segno.make(payload, version=3, error="m", micro=False).matrix], np.float32)
    assert m.shape == (n, n)
    white = np.median(a[y0 - 14:y0 - 6, x0 + 60:x0 + size - 60].reshape(-1, 3), axis=0)
    ss = 4
    big = np.kron(m, np.ones((1, 1)))
    ys, xs = np.mgrid[0:size * ss, 0:size * ss].astype(np.float32)
    cell = size / n
    cov = big[np.clip((ys / ss / cell).astype(int), 0, n - 1), np.clip((xs / ss / cell).astype(int), 0, n - 1)]
    cov = cov.reshape(size, ss, size, ss).mean(axis=(1, 3))[..., None]
    pad = 18
    a[y0 - pad:y0 + size + pad, x0 - pad:x0 + size + pad] = white
    ink = np.array([17, 17, 19], np.float32)
    a[y0:y0 + size, x0:x0 + size] = white * (1 - cov) + ink * cov


qr(S["receive_trc20"], 222, 549, "INCPT WALLET DEMO TRC-20")
qr(S["receive_erc20"], 222, 550, "INCPT WALLET DEMO ERC-20")


# ------------------------------------------------------------------ 7. big balances re-set in Inter
def text_pngs(items):
    spec = os.path.join(TMP, "text.json")
    for i, it in enumerate(items):
        it["file"] = os.path.join(TMP, f"text_{i}.png")
    with open(spec, "w") as f:
        json.dump(items, f)
    subprocess.run(["node", os.path.join(ROOT, "tools", "textpng.mjs"), spec], check=True, cwd=ROOT)
    return [np.asarray(Image.open(it["file"]).convert("RGBA")).astype(np.float32) for it in items]


def erase(a, x0, y0, x1, y1, feather=5, top=None):
    """Rebuild the surface under a text box from bands above and below it (feathered in)."""
    t = np.median(a[y0 - 7:y0 - 1, x0:x1], axis=0) if top is None else top
    b = np.median(a[y1 + 1:y1 + 7, x0:x1], axis=0)
    k = np.linspace(0, 1, y1 - y0)[:, None, None]
    patch = t[None] * (1 - k) + b[None] * k
    patch = np.stack([ndimage.gaussian_filter(patch[..., c], (2, 8), mode="nearest") for c in range(3)], -1)
    ys, xs = np.mgrid[0:y1 - y0, 0:x1 - x0]
    edge = np.minimum.reduce([xs, ys, x1 - x0 - 1 - xs, y1 - y0 - 1 - ys]).astype(np.float32)
    al = np.clip(edge / feather, 0, 1)[..., None]
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - al) + patch * al


def stamp(a, t, cx, cy, clip_top=0):
    """Composite a rendered text so the centre of its ink box lands on (cx, cy)."""
    al = t[..., 3]
    ys, xs = np.where(al > 128)
    ox = int(round(cx - (xs.min() + xs.max() + 1) / 2))
    oy = int(round(cy - (ys.min() + ys.max() + 1) / 2))
    h, w = al.shape
    y_lo = max(0, clip_top - oy)
    sub = t[y_lo:]
    A = sub[..., 3:] / 255
    a[oy + y_lo:oy + h, ox:ox + w] = a[oy + y_lo:oy + h, ox:ox + w] * (1 - A) + sub[..., :3] * A


# The AI drew these with a slab-footed "1" and heavy halos. The app sets them in Inter 600,
# slightly tight; sizes and centres reproduce the measured ink boxes (home 571x101 px).
BAL = {"text": "$148,450.75", "weight": 600, "track": -0.022, "color": "#0e0e12"}
home_t, wal_t = text_pngs([dict(BAL, size=100.0), dict(BAL, text="$103,450.75", size=72.3)])
erase(S["home"], 140, 604, 727, 719)
stamp(S["home"], home_t, 433, 661)
erase(S["wallet_s1"], 220, HY, 649, 375, top=np.median(S["wallet_s1"][376:382, 220:649], axis=0))
stamp(S["wallet_s1"], wal_t, 434, 366 - 36.5, clip_top=HY)
erase(S["wallet"], 210, 752, 660, 876)
stamp(S["wallet"], wal_t, 434, 366 - 36.5 + D)

# ------------------------------------------------------------------ save + before/after sheet
np.save(os.path.join(TMP, "stage1.npy"), np.stack([S[n] for n in PAGES]).astype(np.uint8))
for n in PAGES:
    Image.fromarray(np.clip(S[n], 0, 255).astype(np.uint8)).save(os.path.join(OUT, f"{n}.jpg"), quality=95, subsampling=0)
tiles = []
for n in PAGES:
    pair = np.concatenate([RAW[n], np.full((SH, 12, 3), 255, np.float32), S[n]], axis=1)
    tiles.append(Image.fromarray(np.clip(pair, 0, 255).astype(np.uint8)).resize((464, 500)))
sheet = Image.new("RGB", (464 * 6 + 50, 500 * 3 + 20), "white")
for i, t in enumerate(tiles):
    sheet.paste(t, ((i % 6) * 474, (i // 6) * 510))
sheet.save(os.path.join(TMP, "sheet.jpg"), quality=88)
with open(os.path.join(OUT, "pages.json"), "w") as f:
    json.dump({"size": [SW, SH], "headerY": HY, "pages": PAGES, "back": sorted(BACK)}, f, indent=1)
print("app library:", len(PAGES), "pages ->", OUT)
