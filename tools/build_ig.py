"""Instagram reels (ig_*): one manifest from the promo and how-to assets, plus coin icons.

    python3 tools/build_promo.py && python3 tools/build_howto.py && python3 tools/build_ig.py
        -> assets/ig/build/* + assets/manifest_ig.json

Everything is a real piece of the new interface (assets/app): the promo and how-to cut-outs are
reused as they are; the five coin icons are cut from the «Пополнение криптовалюты» sheet as
discs with a contour shadow, so they can fly as objects.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import to_img, with_shadow  # noqa: E402

OUT = os.path.join(ROOT, "assets", "ig", "build")
os.makedirs(OUT, exist_ok=True)
M = {"cutouts": {}, "slots": {}, "screens": {}}
for name in ("promo", "howto"):
    m = json.load(open(os.path.join(ROOT, "assets", f"manifest_{name}.json")))
    M["cutouts"].update(m.get("cutouts", {}))
    M["slots"].update(m.get("slots", {}))

# coin icons: discs of radius 49.6 (inside the icon's light rim) around the measured centres (sheet rows, 920x2000 coords)
S = np.asarray(Image.open(os.path.join(ROOT, "assets", "app", "receive_pick.jpg")).convert("RGB")).astype(np.float32)
COINS = {"usdt": (123.5, 1090.0), "usdc": (124.0, 1266.5), "btc": (123.5, 1442.5), "eth": (123.5, 1619.0), "trx": (123.5, 1795.5)}
R, SS = 49.6, 4
for n, (cx, cy) in COINS.items():
    x0, y0 = int(cx - 54), int(cy - 54)
    w = h = 108
    ys, xs = np.mgrid[0:h * SS, 0:w * SS].astype(np.float32)
    d = np.sqrt(((xs + 0.5) / SS + x0 - cx) ** 2 + ((ys + 0.5) / SS + y0 - cy) ** 2)
    a = (d <= R).astype(np.float32).reshape(h, SS, w, SS).mean(axis=(1, 3))
    rgb, al = with_shadow(S[y0:y0 + h, x0:x0 + w], a, 60, 16, 12, 0.3)
    to_img(rgb, al).save(os.path.join(OUT, f"coin_{n}.png"), compress_level=3)
    M["cutouts"]["coin_" + n] = {"src": f"ig/build/coin_{n}.png", "box": [x0, y0, w, h], "pad": 60, "size": [w + 120, h + 120], "r": 54}

with open(os.path.join(ROOT, "assets", "manifest_ig.json"), "w") as f:
    json.dump(M, f, indent=1)
print("ig assets ok:", len(M["cutouts"]), "cutouts")
