"""Import the team's app screenshots (a PDF straight from iOS) into the shared screen library.

    python3 tools/import_app.py reference/app/IMG_2489.pdf   -> assets/app/<name>.jpg (1206x2622)

Pages are taken out of the PDF without re-encoding. Personal data is swapped for neutral demo data
before anything is written: on the profile the @username line is removed and the Telegram ID becomes
1234567890, re-set in the app's own font (Inter) on a background rebuilt from the rows around it.
The raw PDF stays in reference/ (git-ignored).
"""
import glob
import json
import os
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "reference", "app", "IMG_2489.pdf")
TMP = os.path.join(ROOT, "out", "_app_import")
OUT = os.path.join(ROOT, "assets", "app")
os.makedirs(TMP, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

# PDF page order -> library name. "receive" (QR page) is left out until it gets a demo address + QR.
PAGES = ["send", "home", "home_s1", "home_s2", "cards", "cards_add", "card_mc", "card_visa",
         "stake", "profile", "profile_s1", "wallet", "wallet_recv", None]
DEMO_ID = "1234567890"

for f in glob.glob(os.path.join(TMP, "p-*")):
    os.remove(f)
subprocess.run(["pdfimages", "-j", PDF, os.path.join(TMP, "p")], check=True)
src = sorted(glob.glob(os.path.join(TMP, "p-*.jpg")))
assert len(src) == len(PAGES), f"expected {len(PAGES)} pages, got {len(src)}"


def erase(a, x0, y0, x1, y1, m=12, feather=6):
    """Rebuild the background under a text box from bands above and below it. The margin clears
    the JPEG ringing around the glyphs; the patch is smoothed sideways and feathered into the page."""
    x0, y0, x1, y1 = x0 - m, y0 - m, x1 + m, y1 + m
    top = np.median(a[y0 - 8:y0 - 1, x0:x1], axis=0)
    bot = np.median(a[y1 + 1:y1 + 8, x0:x1], axis=0)
    k = np.linspace(0, 1, y1 - y0)[:, None, None]
    patch = top[None] * (1 - k) + bot[None] * k
    patch = np.stack([ndimage.gaussian_filter(patch[..., c], (2, 10), mode="nearest") for c in range(3)], -1)
    ys, xs = np.mgrid[0:y1 - y0, 0:x1 - x0]
    edge = np.minimum.reduce([xs, ys, x1 - x0 - 1 - xs, y1 - y0 - 1 - ys]).astype(np.float32)
    al = np.clip(edge / feather, 0, 1)[..., None]
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - al) + patch * al


def text_pngs(items):
    spec = os.path.join(TMP, "text.json")
    for i, it in enumerate(items):
        it["file"] = os.path.join(TMP, f"text_{i}.png")
    with open(spec, "w") as f:
        json.dump(items, f)
    subprocess.run(["node", os.path.join(ROOT, "tools", "textpng.mjs"), spec], check=True, cwd=ROOT)
    out = []
    for it in items:
        t = np.asarray(Image.open(it["file"]).convert("RGBA")).astype(np.float32)
        ys, xs = np.where(t[..., 3] > 40)
        out.append(t[ys.min():ys.max() + 1, xs.min():xs.max() + 1])   # ink box
    return out


def stamp(a, t, x, y):
    """Alpha-composite an ink-box text image with its top-left ink corner at (x, y)."""
    h, w = t.shape[:2]
    al = t[..., 3:] / 255
    a[y:y + h, x:x + w] = a[y:y + h, x:x + w] * (1 - al) + t[..., :3] * al


def mask_profile(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    # measured on the 1206x2622 page: ink boxes of the @username line, the "Telegram ID: …" line
    # and the Telegram ID row value; the font sizes reproduce the measured ink widths
    erase(a, 467, 992, 739, 1034)
    erase(a, 372, 1067, 832, 1105)
    erase(a, 831, 1297, 1047, 1330)
    line, val = text_pngs([
        {"text": f"Telegram ID: {DEMO_ID}", "size": 39.1, "weight": 400, "color": "#75767f"},
        {"text": DEMO_ID, "size": 39.1, "weight": 400, "color": "#5779cd"},
    ])
    # without a username the ID line moves up into its place (centred on the name)
    stamp(a, line, int(round(601.5 - line.shape[1] / 2)), 994)
    stamp(a, val, 1046 - val.shape[1] + 1, 1297)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "profile.jpg"), quality=95, subsampling=0)


for name, p in zip(PAGES, src):
    if name is None:
        continue
    if name == "profile":
        mask_profile(p)
    else:
        shutil.copyfile(p, os.path.join(OUT, f"{name}.jpg"))
print("app library:", sorted(os.listdir(OUT)))
