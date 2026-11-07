"""Cut-outs for the Instagram films (f_*): real UI pieces the promo build does not have yet.

    python3 tools/build_films.py   -> assets/promo/build/pr_deposit.png, pr_tabs.png (+ manifest_promo.json entries)

Same treatment as tools/build_promo.py: rounded alpha and a contour shadow; UI pixels are never redrawn.
  - pr_deposit: «Ваши депозиты» card (Liquid Vault, 20,000.00 USDT, Депозит активен, Прогноз сегодня ≈ $14.42)
    from the cleaned staking screen (assets/app/stake_s1.jpg)
  - pr_fees, pr_pct_*: the swap screen's fee lines and its 25% / 50% / 75% / Макс chips (assets/app/swap.jpg)
  - pr_tabs: the Liquid / Monthly / Maximum control; on the cleaned screen it sits under the header, so it
    comes from the team's screenshot (reference/app_v3/stake_s1.png, 850 px wide, scaled to the 920 grid)
"""
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from imgkit import sdf_rrect, to_img, with_shadow  # noqa: E402

OUT = os.path.join(ROOT, "assets", "promo", "build")
MAN = os.path.join(ROOT, "assets", "manifest_promo.json")
M = json.load(open(MAN))


def cut(name, img, box, r, pad=90, blur=26, dy=22, op=0.26):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    rgb, al = with_shadow(img[y0:y1, x0:x1], sdf_rrect(w, h, r, inset=0.8), pad, blur, dy, op)
    to_img(rgb, al).save(os.path.join(OUT, name + ".png"), compress_level=3)
    M["cutouts"][name] = {"src": f"promo/build/{name}.png", "box": [x0, y0, w, h], "pad": pad, "size": [w + 2 * pad, h + 2 * pad], "r": r}


stake_s1 = np.asarray(Image.open(os.path.join(ROOT, "assets", "app", "stake_s1.jpg")).convert("RGB")).astype(np.float32)
cut("pr_deposit", stake_s1, (47, 673, 873, 908), 44)
ref = Image.open(os.path.join(ROOT, "reference", "app_v3", "stake_s1.png")).convert("RGB")
ref = ref.resize((920, round(ref.height * 920 / ref.width)), Image.LANCZOS)
cut("pr_tabs", np.asarray(ref).astype(np.float32), (84, 320, 836, 461), 34)
swap = np.asarray(Image.open(os.path.join(ROOT, "assets", "app", "swap.jpg")).convert("RGB")).astype(np.float32)
cut("pr_fees", swap, (44, 1410, 876, 1836), 44)                       # Курс / Комиссия сети / Комиссия обмена «В курсе» / Вы получите
for n, (x0, x1) in zip(("25", "50", "75", "max"), ((44, 236), (256, 452), (472, 664), (684, 876))):
    cut(f"pr_pct_{n}", swap, (x0, 1272, x1, 1368), 30, pad=60, blur=20, dy=16, op=0.2)
json.dump(M, open(MAN, "w"), indent=1, ensure_ascii=False)
print("cut-outs: pr_deposit, pr_tabs, pr_fees, pr_pct_*")
