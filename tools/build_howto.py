"""How-to series (new interface): shared assets for every tutorial reel (howto_*).

    python3 tools/build_howto.py   -> assets/howto/build/* + assets/manifest_howto.json

Source: assets/app/*.jpg (920x2000, cleaned by tools/import_app.py). UI pixels are never redrawn.
  - headers (Close / Back), the tab bar of every tab state, the sheet's black screen corners
  - scrolling pages stitched from a top and a scrolled screenshot (the scrolled shot's own tab bar
    is never baked into the page: the bar is a fixed overlay)
  - the coin sheets as panels that slide up over the dimmed wallet
  - cut-outs (with clean slots) and highlight rects for each tutorial; boxes are snapped to the
    element's real edges
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
OUT = os.path.join(ROOT, "assets", "howto", "build")
os.makedirs(OUT, exist_ok=True)
SW, SH, HY = 920, 2000, 302
NAMES = json.load(open(os.path.join(APP, "pages.json")))["pages"]
S = {n: np.asarray(Image.open(os.path.join(APP, f"{n}.jpg")).convert("RGB")).astype(np.float32) for n in NAMES}
M = {"screens": {n: f"app/{n}.jpg" for n in NAMES}, "cutouts": {}, "slots": {}, "overlays": {}, "pages": {},
     "sheets": {}, "rects": {}, "headerY": HY}


def rel(n):
    return f"howto/build/{n}"


def save_rgba(name, rgb, a):
    to_img(rgb, a).save(os.path.join(OUT, name + ".png"), compress_level=3)
    return rel(name + ".png")


def save_rgb(name, rgb):
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name + ".jpg"), quality=94, subsampling=0)
    return rel(name + ".jpg")


# ------------------------------------------------------------------ fixed overlays
M["overlays"]["hdr_close"] = {"src": save_rgba("ov_hdr_close", S["home"][:HY], np.ones((HY, SW), np.float32)), "y": 0, "h": HY}
M["overlays"]["hdr_back"] = {"src": save_rgba("ov_hdr_back", S["send"][:HY], np.ones((HY, SW), np.float32)), "y": 0, "h": HY}
lum = np.max(np.stack([S[n][1780:].mean(2) for n in ("home", "cards", "wallet_s1", "profile")]), axis=0)
ca = np.clip((236 - lum) / 236, 0, 1)
ca[ca < 0.05] = 0
ca[:, 210:710] = 0
ca[:1895 - 1780] = 0                        # only the rounded screen corners (the bar's icons sit higher)
M["overlays"]["corners"] = {"src": save_rgba("ov_corners", np.zeros(ca.shape + (3,), np.float32), ca), "y": 1780, "h": SH - 1780}

BAR_BOX = (0, 1700, SW, 1910)
PILL = (36, 1732, 883, 1887, 77)
CIRC = (459.5, 1805.5, 90.5)
bx0, by0, bx1, by1 = BAR_BOX
ba = np.zeros((by1 - by0, bx1 - bx0), np.float32)
ba[PILL[1] - by0:PILL[3] - by0, PILL[0]:PILL[2]] = sdf_rrect(PILL[2] - PILL[0], PILL[3] - PILL[1], PILL[4])
yy, xx = np.mgrid[by0:by1, bx0:bx1].astype(np.float32)
ba = np.maximum(ba, np.clip(0.5 - (np.sqrt((xx + 0.5 - CIRC[0]) ** 2 + (yy + 0.5 - CIRC[1]) ** 2) - CIRC[2]), 0, 1))
for key, src in [("bar_home", "home"), ("bar_cards", "cards"), ("bar_wallet", "wallet_s1"), ("bar_stake", "stake"), ("bar_profile", "profile")]:
    M["overlays"][key] = {"src": save_rgba("ov_" + key, S[src][by0:by1], ba), "y": by0, "h": by1 - by0}


# ------------------------------------------------------------------ scrolling pages
def stitch(name, top, scrolled, d, seam, bar=True):
    """Page = top screen above `seam`, the scrolled screen below (page row p = scrolled row p - d).
    Tab-bar screens: the scrolled shot's bar rows are skipped and its bottom strip stretched under
    the fixed bar; if the two shots do not overlap below the header, the gap is interpolated."""
    T, B = S[top], S[scrolled]
    end = 1730 if bar else SH
    parts = [T[:seam]]
    p = seam
    if seam - d < HY:                                       # no overlap: interpolate the hidden rows
        g1 = d + HY
        k = np.linspace(0, 1, g1 - seam)[:, None, None]
        gap = T[seam - 1][None] * (1 - k) + B[HY][None] * k
        parts.append(np.stack([ndimage.gaussian_filter(gap[..., c], (2, 3), mode="nearest") for c in range(3)], -1))
        p = g1
    parts.append(B[p - d:end])
    if bar:
        strip = B[1892:SH]
        parts.append(np.asarray(Image.fromarray(strip.astype(np.uint8)).resize((SW, 270), Image.BILINEAR)).astype(np.float32))
    page = np.concatenate(parts, axis=0)
    M["pages"][name] = {"src": save_rgb(name, page), "h": int(page.shape[0]), "scroll": d}
    return page


PG = {
    "page_wallet": stitch("page_wallet", "wallet", "wallet_s1", 503, 805),
    "page_swap": stitch("page_swap", "swap", "swap_s1", 298, 1300, bar=False),
    "page_stake": stitch("page_stake", "stake", "stake_s1", 1531, 1700),
    "page_cards": stitch("page_cards", "cards", "cards_s1", 450, 1600),
    "page_home": stitch("page_home", "home", "home_s1", 1299, 1600),
}

# ------------------------------------------------------------------ coin sheets (slide up over the dimmed wallet)
SHEET_Y = 800
for key, src in [("sheet_receive", "receive_pick"), ("sheet_send", "send_pick")]:
    a = S[src][SHEET_Y:].copy()
    a[:12] = np.median(a[12:18], axis=0)[None]              # the cleaned top rows carried a ghost of the balance
    al = sdf_rrect(SW, SH - SHEET_Y + 120, 44)[:SH - SHEET_Y]
    M["sheets"][key] = {"src": save_rgba(key, a, al), "y": SHEET_Y, "h": SH - SHEET_Y, "dim": 0.325}


# ------------------------------------------------------------------ cut-outs, slots, rects
def refine(img, box, s=10):
    """Snap each side of a box to the strongest luminance edge within +-s px."""
    L = img.mean(2)
    x0, y0, x1, y1 = box
    gy = np.abs(np.diff(L, axis=0))
    gx = np.abs(np.diff(L, axis=1))
    mx = slice(x0 + (x1 - x0) // 4, x1 - (x1 - x0) // 4)
    my = slice(y0 + (y1 - y0) // 4, y1 - (y1 - y0) // 4)
    top = y0 - s + int(np.argmax(gy[y0 - s:y0 + s, mx].mean(1))) + 1
    bot = y1 - s + int(np.argmax(gy[y1 - s:y1 + s, mx].mean(1))) + 1
    lft = x0 - s + int(np.argmax(gx[my, x0 - s:x0 + s].mean(0))) + 1
    rgt = x1 - s + int(np.argmax(gx[my, x1 - s:x1 + s].mean(0))) + 1
    return (lft, top, rgt, bot)


def cut(name, img, box, r, pad=90, blur=26, dy=22, op=0.26, snap=True):
    if snap:
        box = refine(img, box)
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    rgb, al = with_shadow(img[y0:y1, x0:x1], sdf_rrect(w, h, r, inset=0.8), pad, blur, dy, op)
    M["cutouts"][name] = {"src": save_rgba(name, rgb, al), "box": [x0, y0, w, h], "pad": pad, "size": [w + 2 * pad, h + 2 * pad], "r": r}
    return box


def slot(name, img, box, m=6, fy=3):
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


def piece(name, scr, box, r, m=5, **kw):
    """Cut-out + its slot + a highlight rect of the same name."""
    b = cut(name, S[scr], box, r, **kw)
    slot(name, S[scr], b, m=m)
    rect(name, b, r)
    return b


def rect(name, box, r):
    x0, y0, x1, y1 = box
    M["rects"][name] = [int(x0), int(y0), int(x1 - x0), int(y1 - y0), int(r)]


# tab bar targets (same on every tab screen)
for n, cx in {"home": 114.5, "cards": 270, "stake": 650, "profile": 805}.items():
    rect("tab_" + n, (cx - 64, 1744, cx + 64, 1872), 64)
rect("tab_wallet", (368, 1714, 551, 1897), 92)

# ---- wallet (top screen) actions
for n, x0, x1 in [("recv", 47, 309), ("swap", 329, 591), ("send", 611, 873)]:
    piece("w_" + n, "wallet", (x0, 1059, x1, 1187), 64, pad=70, blur=22, dy=18)

# ---- coin sheet rows (receive and send sheets share the layout)
ROWS = [("usdt", 1003, 1178), ("usdc", 1178, 1353), ("btc", 1353, 1530), ("eth", 1530, 1706), ("trx", 1706, 1882)]
for n, a, b in ROWS:
    rect("sheet_" + n, (37, a, 883, b), 30)

# ---- receive (TRC-20 / ERC-20)
tog = piece("rc_toggle", "receive_trc20", (288, 1135, 632, 1222), 44, pad=70, blur=20, dy=16, snap=False)   # the grey track, not the knob
cut("rc_toggle_erc", S["receive_erc20"], tog, 44, pad=70, blur=20, dy=16, snap=False)
rect("rc_trc", (tog[0] + 8, tog[1] + 8, tog[0] + 166, tog[3] - 8), 34)
rect("rc_erc", (tog[0] + 178, tog[1] + 8, tog[2] - 8, tog[3] - 8), 34)
adr = piece("rc_addr", "receive_trc20", (37, 1338, 883, 1510), 44)
cut("rc_addr_erc", S["receive_erc20"], adr, 44, snap=False)
rect("rc_copy", (793, 1396, 853, 1456), 30)
piece("rc_tgid", "receive_trc20", (37, 1608, 883, 1733), 40)
rect("rc_qr", (167, 494, 751, 1080), 48)
rect("rc_share", (37, 1866, 883, 1996), 64)
WARN = (90, 1772, 830, 1870)
cut("rc_warn", S["receive_trc20"], WARN, 30, snap=False)
cut("rc_warn_erc", S["receive_erc20"], WARN, 30, snap=False)
slot("rc_warn", S["receive_trc20"], WARN, m=2, fy=6)
rect("rc_warn", WARN, 30)

# ---- swap (rects at scroll 0 are swap.jpg coords; at scroll 298 swap_s1.jpg coords)
rect("sw_give_coin", (80, 713, 345, 812), 50)
rect("sw_get_coin", (80, 1066, 320, 1165), 50)
rect("sw_flip", (409, 848, 511, 950), 51)
rect("sw_amount", (600, 676, 860, 856), 30)
for n, x0, x1 in [("sw_25", 43, 237), ("sw_50", 256, 450), ("sw_75", 469, 663), ("sw_max", 682, 877)]:
    rect(n, (x0, 1276, x1, 1370), 30)
piece("sw_table", "swap_s1", (43, 1110, 877, 1540), 44)
rect("sw_button", (42, 1775, 878, 1898), 60)

# ---- send
tg = piece("sd_toggle", "send", (38, 838, 382, 925), 44, pad=70, blur=20, dy=16, snap=False)
piece("sd_addr", "send", (37, 952, 883, 1062), 55)
rect("sd_scan", (790, 974, 864, 1042), 37)
rect("sd_avail", (192, 506, 738, 568), 30)
rect("sd_max", (625, 511, 734, 564), 26)
rect("sd_button", (37, 1098, 883, 1226), 64)
rect("sd_keypad", (37, 1325, 883, 1955), 44)

# ---- staking (stake.jpg at scroll 0; the deposit card from stake_s1 at scroll 1531)
rect("st_total", (200, 740, 720, 1004), 40)
piece("st_amount", "stake", (83, 1137, 837, 1403), 44)
for n, x0, x1 in [("st_50", 83, 258), ("st_100", 276, 450), ("st_500", 468, 642), ("st_max", 660, 836)]:
    rect(n, (x0, 1432, x1, 1502), 35)
piece("st_year", "stake", (83, 1532, 837, 1628), 30)
rect("st_apy", (636, 1062, 848, 1110), 16)
# «Открыть стейкинг»: in every screenshot the tab bar hides the button's lower half and the middle
# of its label. It is rebuilt whole so it can lift above the bar: the top 40 rows and the grey are the
# screenshot's, the bottom edge is their mirror, the label is re-set in Inter (the app's font) at the
# measured size (ink 305..614, «О» cap top at 1699) and centred where the visible half puts it.
BT0, BH, BX0, BX1 = 1657, 112, 83, 837


def stake_button():
    import subprocess
    T = S["stake"]
    grey = np.median(T[BT0 + 10:BT0 + 38, BX0 + 30:BX1 - 30].reshape(-1, 3), axis=0)
    b = np.zeros((BH, BX1 - BX0, 3), np.float32) + grey
    top = T[BT0:BT0 + 40, BX0:BX1].copy()
    light = top.mean(2) > grey.mean() + 12               # page background in the corners, AI marks
    top[light] = grey
    b[:40] = top
    b[BH - 40:] = top[::-1]
    spec = os.path.join(OUT, "_btn.json")
    items = [{"text": "Открыть стейкинг", "size": s_, "weight": 600, "color": "#f3f3f6", "file": os.path.join(OUT, f"_btn_{s_}.png")} for s_ in (32, 33, 34, 35)]
    json.dump(items, open(spec, "w"))
    subprocess.run(["node", os.path.join(ROOT, "tools", "textpng.mjs"), spec], check=True, cwd=ROOT)
    best = None
    for it in items:
        t = np.asarray(Image.open(it["file"]).convert("RGBA")).astype(np.float32)
        ys, xs = np.where(t[..., 3] > 100)
        w = xs.max() - xs.min() + 1
        if best is None or abs(w - 310) < abs(best[0] - 310):
            best = (w, t, ys.min(), xs.min())
        os.remove(it["file"])
    os.remove(spec)
    w, t, ty, tx = best
    oy, ox = 1699 - BT0 - ty, 305 - BX0 - tx
    A = t[..., 3:] / 255
    h, ww = A.shape[:2]
    y0, x0 = max(0, oy), max(0, ox)
    sub = (slice(y0 - oy, min(h, BH - oy)), slice(x0 - ox, min(ww, BX1 - BX0 - ox)))
    reg = b[y0:y0 + sub[0].stop - sub[0].start, x0:x0 + sub[1].stop - sub[1].start]
    reg[:] = reg * (1 - A[sub]) + t[sub][..., :3] * A[sub]
    return b


btn = stake_button()
rgb, al = with_shadow(btn, sdf_rrect(BX1 - BX0, BH, 34, inset=0.8), 80, 24, 18, 0.24)
M["cutouts"]["st_btn"] = {"src": save_rgba("st_btn", rgb, al), "box": [BX0, BT0, BX1 - BX0, BH], "pad": 80, "size": [BX1 - BX0 + 160, BH + 160], "r": 34}
bgc = np.median(S["stake"][1640:1652, BX0:BX1], axis=0)
patch = np.repeat(bgc[None], 1736 - 1649, axis=0)
M["slots"]["st_btn"] = {"src": save_rgba("slot_st_btn", patch, np.ones(patch.shape[:2], np.float32)), "x": BX0, "y": 1649, "w": BX1 - BX0, "h": 1736 - 1649}
rect("st_btn", (BX0, BT0, BX1, BT0 + BH), 34)
piece("st_deposit", "stake_s1", (47, 673, 873, 905), 44)

# ---- cards (cards.jpg at scroll 0; the add-card tile from cards_s1 at scroll 450)
rect("cd_balance", (236, 810, 684, 955), 40)
rect("cd_today", (200, 983, 719, 1051), 34)
piece("cd_card", "cards", (47, 1078, 873, 1601), 50)
rect("cd_add", (47, 1185, 873, 1705), 50)

# ---- profile
rect("pf_head", (250, 405, 670, 850), 60)
piece("pf_ids", "profile", (37, 920, 883, 1232), 48)
rect("pf_tgid", (37, 925, 883, 1077), 40)
rect("pf_email", (37, 1078, 883, 1228), 40)
piece("pf_sec", "profile", (37, 1270, 883, 1726), 48, snap=False)
rect("pf_pin", (708, 1324, 802, 1382), 29)
rect("pf_bio", (708, 1472, 802, 1530), 29)
rect("pf_seed", (37, 1578, 883, 1724), 40)

with open(os.path.join(ROOT, "assets", "manifest_howto.json"), "w") as f:
    json.dump(M, f, indent=1)
print("howto assets ok:", len(M["cutouts"]), "cutouts,", len(M["slots"]), "slots,", len(M["rects"]), "rects,", len(M["pages"]), "pages")
for k in ("rc_toggle", "rc_addr", "rc_tgid", "w_recv"):
    print(k, M["cutouts"][k]["box"])
