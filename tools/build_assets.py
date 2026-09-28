"""Build every bitmap the reel needs from the real INCPT Wallet screenshots.

Outputs go to assets/build/ plus a manifest.json the renderer reads:
  * titanium phone frame (screen hole), edge/thickness layer, contact shadow
  * floating UI cut-outs (rounded alpha + shadow baked along the alpha contour)
  * a stitched scroll page (screens 1-3 are the same page scrolled by 1024/1300 px)

UI pixels are never redrawn: every cut-out is a crop of a screenshot.
"""
import json
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCR = os.path.join(ROOT, "assets", "screens")
OUT = os.path.join(ROOT, "assets", "build")
os.makedirs(OUT, exist_ok=True)

SW, SH = 920, 2000          # screenshot size
SS = 4                      # supersampling for masks

screens = {i: Image.open(os.path.join(SCR, f"{i}.jpg")).convert("RGB") for i in range(1, 6)}
manifest = {"screen": [SW, SH], "cutouts": {}, "phone": {}}


# ---------------------------------------------------------------- helpers
def sdf_rrect(w, h, r, ss=SS, inset=0.0):
    """Anti-aliased rounded-rect coverage mask (float 0..1) of size w x h."""
    ys, xs = np.mgrid[0:h * ss, 0:w * ss].astype(np.float32)
    xs = (xs + 0.5) / ss
    ys = (ys + 0.5) / ss
    cx, cy = w / 2, h / 2
    hx, hy = w / 2 - inset, h / 2 - inset
    qx = np.abs(xs - cx) - (hx - r)
    qy = np.abs(ys - cy) - (hy - r)
    ox = np.maximum(qx, 0)
    oy = np.maximum(qy, 0)
    d = np.sqrt(ox * ox + oy * oy) + np.minimum(np.maximum(qx, qy), 0) - r
    cov = np.clip(0.5 - d, 0, 1)
    cov = cov.reshape(h, ss, w, ss).mean(axis=(1, 3))
    return cov


def sdf_rrect_field(w, h, r, cx, cy, hw, hh):
    """Signed distance (px) to a rounded rect centred at cx,cy (full-res grid)."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    xs += 0.5
    ys += 0.5
    qx = np.abs(xs - cx) - (hw - r)
    qy = np.abs(ys - cy) - (hh - r)
    ox = np.maximum(qx, 0)
    oy = np.maximum(qy, 0)
    return np.sqrt(ox * ox + oy * oy) + np.minimum(np.maximum(qx, qy), 0) - r


def to_img(rgb, a):
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def contour_shadow(alpha, pad, blur, dy, color, opacity):
    """Shadow that follows the alpha contour (no rectangular layer shadows)."""
    h, w = alpha.shape
    big = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    big[pad + dy:pad + dy + h, pad:pad + w] = alpha
    im = Image.fromarray((big * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(im).astype(np.float32) / 255 * opacity
    rgb = np.zeros((h + 2 * pad, w + 2 * pad, 3), np.float32) + np.array(color, np.float32)
    return rgb, a


def over(dst_rgb, dst_a, src_rgb, src_a):
    out_a = src_a + dst_a * (1 - src_a)
    safe = np.where(out_a > 1e-6, out_a, 1)
    out_rgb = (src_rgb * src_a[..., None] + dst_rgb * dst_a[..., None] * (1 - src_a[..., None])) / safe[..., None]
    return out_rgb, out_a


# ---------------------------------------------------------------- cut-outs
SHADOW_COL = (22, 48, 104)


def paint_corners(scr, box, crop, r, zone=120, tol=34):
    """The real UI element has rounder (continuous) corners than our mask: in the corner
    wedges the crop still shows screen background. Detect those pixels by comparing with
    the background sampled just outside each corner, then paint them in from the element."""
    import cv2
    h, w = crop.shape[:2]
    x0, y0, x1, y1 = box
    full = np.asarray(screens[scr]).astype(np.float32)
    ours = sdf_rrect(w, h, r, ss=2) > 0.0
    ys, xs = np.mgrid[0:h, 0:w]
    hole = np.zeros((h, w), bool)
    for cx, cy, sx, sy in [(0, 0, -1, -1), (w, 0, 1, -1), (0, h, -1, 1), (w, h, 1, 1)]:
        bgc = full[int(np.clip(y0 + cy + sy * 5, 0, SH - 1)), int(np.clip(x0 + cx + sx * 5, 0, SW - 1))]
        zone_m = (np.abs(xs - cx) < zone) & (np.abs(ys - cy) < zone)
        near_bg = np.sqrt(((crop - bgc) ** 2).sum(axis=2)) < tol
        # only the part connected to the very corner (never interior highlights)
        cand = (zone_m & near_bg).astype(np.uint8)
        n, lab = cv2.connectedComponents(cand)
        seed = lab[min(max(cy - (cy > 0), 0), h - 1), min(max(cx - (cx > 0), 0), w - 1)]
        if seed > 0:
            hole |= lab == seed
    # the card proper, minus its pale anti-aliased rim (also along the straight edges)
    real = ~hole
    real[:, :1] = real[:, -1:] = False
    real[:1, :] = real[-1:, :] = False
    interior = ndimage.binary_erosion(real, iterations=5)
    # every pixel outside the interior takes the colour of the nearest interior pixel,
    # so the corners continue the card's own saturated foil instead of a washed-out blend
    _, (iy, ix) = ndimage.distance_transform_edt(~interior, return_indices=True)
    filled = crop[iy, ix]
    soft = np.stack([ndimage.gaussian_filter(filled[..., c], 2.0) for c in range(3)], -1)
    out = np.where(interior[..., None], crop, soft)
    return out.astype(np.float32)


def cutout(name, scr, box, r, pad=90, shadow=True, inset=0.6, sh_blur=26, sh_dy=22, sh_op=0.26, true_r=None):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    crop = np.asarray(screens[scr].crop(box)).astype(np.float32)
    if true_r:
        crop = paint_corners(scr, box, crop, r)
    a = sdf_rrect(w, h, r, inset=inset)
    if shadow:
        s_rgb, s_a = contour_shadow(a, pad, sh_blur, sh_dy, SHADOW_COL, sh_op)
        # a second, tight contact shadow for weight
        c_rgb, c_a = contour_shadow(a, pad, 6, 4, SHADOW_COL, 0.10)
        s_rgb, s_a = over(s_rgb, s_a, c_rgb, c_a)
        e_rgb = np.zeros_like(s_rgb)
        e_a = np.zeros_like(s_a)
        e_rgb[pad:pad + h, pad:pad + w] = crop
        e_a[pad:pad + h, pad:pad + w] = a
        rgb, al = over(s_rgb, s_a, e_rgb, e_a)
    else:
        pad = 0
        rgb, al = crop, a
    img = to_img(rgb, al)
    img.save(os.path.join(OUT, f"{name}.png"), optimize=False, compress_level=3)
    manifest["cutouts"][name] = {
        "src": f"build/{name}.png", "screen": scr, "box": [x0, y0, w, h], "pad": pad,
        "size": [img.width, img.height], "r": r,
    }


# Screen 1 – home
cutout("today_pill", 1, (310, 741, 610, 811), 35)
cutout("btn_receive", 1, (36, 875, 449, 1004), 64)
cutout("btn_send", 1, (471, 875, 884, 1004), 64)
cutout("defi_row", 1, (37, 1121, 883, 1273), 44)
cutout("tabbar", 1, (36, 1731, 884, 1887), 77, shadow=False)
cutout("tab_center", 1, (370, 1716, 550, 1896), 90, shadow=False)
# Screen 3 – operations list (all five rows fully visible)
ops = [("op_ae", 701), ("op_apple_out", 907), ("op_higgs", 1113), ("op_apple_in", 1319), ("op_topup", 1525)]
for n, y in ops:
    cutout(n, 3, (37, y, 883, y + 182), 48)
# Screen 4 – my cards
cutout("card_main", 4, (68, 396, 851, 892), 52, pad=120, inset=1.2, sh_blur=40, sh_dy=34, sh_op=0.30, true_r=82)
for n, x in [("btn_topup", 68), ("btn_withdraw", 270), ("btn_details", 471), ("btn_settings", 673)]:
    cutout(n, 4, (x, 965, x + 178, 1093), 64)
# Screen 5 – card issue sheet
cutout("card_issue", 5, (36, 511, 810, 1002), 52, pad=120, inset=1.2, sh_blur=40, sh_dy=34, sh_op=0.30, true_r=82)
cutout("btn_issue", 5, (36, 1671, 884, 1799), 64, inset=1.0)
cutout("row_applepay", 5, (0, 1308, 920, 1402), 47)
cutout("row_googlepay", 5, (0, 1420, 920, 1514), 47)
cutout("title_oneclick", 5, (124, 1080, 796, 1160), 40)
cutout("fee_row", 5, (37, 1547, 883, 1668), 40)

# Telegram header ("Close · INCPT Wallet · mini app · ...") as a floating chip.
hdr = np.asarray(screens[1].crop((0, 160, SW, 300))).astype(np.float32)
hdr_bg = np.asarray(screens[1]).astype(np.float32)[180, 460]
# black sheet corners: walk down each edge column while pixels stay dark (text is never reached)
sheet = np.ones(hdr.shape[:2], np.float32)
lum_ = hdr.mean(axis=2)
for x in list(range(0, 150)) + list(range(SW - 150, SW)):
    for y in range(hdr.shape[0]):
        if lum_[y, x] > 200:
            sheet[y:y + 2, x] = 0          # swallow the anti-aliased lip as well
            break
        sheet[y, x] = 0
sheet = sheet[..., None]
hdr = hdr * sheet + hdr_bg * (1 - sheet)
hw_, hh_ = SW, 140
ha = sdf_rrect(hw_, hh_, 46, inset=0.6)
s_rgb, s_a = contour_shadow(ha, 90, 26, 22, SHADOW_COL, 0.26)
e_rgb = np.zeros_like(s_rgb); e_a = np.zeros_like(s_a)
e_rgb[90:90 + hh_, 90:90 + hw_] = hdr; e_a[90:90 + hh_, 90:90 + hw_] = ha
rgb_, al_ = over(s_rgb, s_a, e_rgb, e_a)
to_img(rgb_, al_).save(os.path.join(OUT, "tg_header.png"))
manifest["cutouts"]["tg_header"] = {"src": "build/tg_header.png", "screen": 1, "box": [0, 160, SW, 140], "pad": 90,
                                    "size": [SW + 180, 140 + 180], "r": 46}

# ---------------------------------------------------------------- empty slots
# When a UI element lifts off the phone, its slot must not keep a copy of it: these patches
# rebuild the screen background behind each element (vertical blend of the rows just above
# and below, or a flat sample), and sit on the screen under the lifted cut-out.
manifest["slots"] = {}


def slot(key, scr, box, m=5, mode="vlerp", sample=None):
    arr = np.asarray(screens[scr]).astype(np.float32)
    x0, y0, x1, y1 = box
    x0, y0, x1, y1 = max(0, x0 - m), max(0, y0 - m), min(SW, x1 + m), min(SH, y1 + m)
    h = y1 - y0
    if mode == "vlerp":
        top = arr[y0 - 2, x0:x1]
        bot = arr[min(SH - 1, y1 + 1), x0:x1]
        k = np.linspace(0, 1, h)[:, None, None]
        patch = top[None] * (1 - k) + bot[None] * k
        patch = np.stack([ndimage.gaussian_filter(patch[..., c], (0, 3)) for c in range(3)], -1)
    else:
        patch = np.zeros((h, x1 - x0, 3), np.float32) + arr[sample[1], sample[0]]
    # feather the patch edge so it melts into the screenshot
    ys, xs = np.mgrid[0:h, 0:x1 - x0]
    edge = np.minimum.reduce([xs, ys, x1 - x0 - 1 - xs, h - 1 - ys]).astype(np.float32)
    a = np.clip(edge / 3.0, 0, 1)
    to_img(patch, a).save(os.path.join(OUT, f"slot_{key}.png"))
    manifest["slots"][key] = {"src": f"build/slot_{key}.png", "x": x0, "y": y0, "w": x1 - x0, "h": h}


slot("s1_buttons", 1, (20, 856, 900, 1044), m=0)      # both pills + their soft shadows
slot("s5_card", 5, (36, 511, 810, 1002), m=5, mode="const", sample=(20, 700))
slot("s5_title", 5, (124, 1080, 796, 1160), m=3, mode="const", sample=(100, 1120))
slot("s5_applepay", 5, (0, 1308, 920, 1402), m=2, mode="const", sample=(460, 1300))
slot("s5_googlepay", 5, (0, 1420, 920, 1514), m=2, mode="const", sample=(460, 1300))
slot("s4_card", 4, (68, 396, 851, 892), m=5)
slot("s4_op_ae", 4, (37, 1354, 883, 1533), m=4, mode="const", sample=(460, 1542))
slot("s4_op_apple", 4, (37, 1551, 883, 1728), m=3, mode="const", sample=(460, 1542))

# ---------------------------------------------------------------- stitched scroll page
# page_y = screen_y - 300 + scroll ; s1 scroll 0, s2 scroll 1024, s3 scroll 1300
HEAD = 300
PAGE_H = 3000
page = np.zeros((PAGE_H, SW, 3), np.float32)
wsum = np.zeros((PAGE_H, 1, 1), np.float32)
bg = np.asarray(screens[3]).astype(np.float32)[1513, 460]   # page colour between rows


def put(scr, scroll, y_lo, y_hi, feather=60):
    """Place rows [y_lo,y_hi) of page space from screen `scr` with feathered weights."""
    arr = np.asarray(screens[scr]).astype(np.float32)
    for py in range(y_lo, y_hi):
        sy = py + HEAD - scroll
        if sy < HEAD or sy >= 1716:
            continue
        w = min(1.0, (py - y_lo + 1) / feather if y_lo > 0 else 1.0, (y_hi - py) / feather if y_hi < 2716 else 1.0)
        page[py] += arr[sy] * w
        wsum[py] += w


put(1, 0, 0, 1260)
put(2, 1024, 1200, 1760)
put(3, 1300, 1700, 2716)
filled = wsum[:, 0, 0] > 1e-3
page[filled] /= wsum[filled]
page[~filled] = bg
Image.fromarray(page.astype(np.uint8)).save(os.path.join(OUT, "page_home.jpg"), quality=95)
# fixed header (status bar + Telegram header) and bottom sheet corners from screen 1
screens[1].crop((0, 0, SW, HEAD)).save(os.path.join(OUT, "header.png"))
bot = np.asarray(screens[1].crop((0, 1880, SW, SH))).astype(np.float32)
dark = np.clip((60 - bot.mean(axis=2)) / 50, 0, 1)
# only keep the corner regions (black outside the sheet), never UI text
mask = np.zeros_like(dark)
mask[:, :170] = 1
mask[:, -170:] = 1
to_img(np.zeros_like(bot), dark * mask).save(os.path.join(OUT, "sheet_corners.png"))
manifest["page"] = {"src": "build/page_home.jpg", "h": PAGE_H, "head": HEAD, "maxScroll": 1300}

# ---------------------------------------------------------------- phone frame
# screen 920x2000, radius 92; black bezel 22; titanium band 13; side buttons.
RS, BZ, TI = 92, 22, 13
MARGIN = 8                       # room for side buttons
BW, BH = SW + 2 * (BZ + TI), SH + 2 * (BZ + TI)
FW, FH = BW + 2 * MARGIN, BH + 2 * 2
ox, oy = MARGIN, 2               # body origin inside frame image
cxb, cyb = ox + BW / 2, oy + BH / 2

ss = 2
W2, H2 = FW * ss, FH * ss


def field(r, hw, hh):
    return sdf_rrect_field(W2, H2, r * ss, cxb * ss, cyb * ss, hw * ss, hh * ss) / ss


d_body = field(RS + BZ + TI, BW / 2, BH / 2)
d_bezel = field(RS + BZ, BW / 2 - TI, BH / 2 - TI)
d_screen = field(RS, SW / 2 - 2, SH / 2 - 2)   # bezel overlaps the screen by 2 px

ys, xs = np.mgrid[0:H2, 0:W2].astype(np.float32)
xs = (xs + 0.5) / ss
ys = (ys + 0.5) / ss
ang = np.arctan2(ys - cyb, xs - cxb)
# titanium: light from top-left, soft anisotropic banding, bright lips on both edges
t_band = np.clip(-d_body / TI, 0, 1)                    # 0 at outer edge -> 1 at bezel
light = 0.5 + 0.5 * np.cos(ang - np.deg2rad(-135))
base = 150 + 55 * light
lip_out = np.exp(-((t_band - 0.10) / 0.08) ** 2)
lip_in = np.exp(-((t_band - 0.86) / 0.07) ** 2)
groove = np.exp(-((t_band - 0.5) / 0.22) ** 2)
lum = base + 60 * lip_out + 35 * lip_in - 22 * groove
ti_rgb = np.dstack([lum * 1.00, lum * 0.985, lum * 0.955])
# antenna bands
for ay in (0.085, 0.915):
    band = np.abs(ys - (oy + BH * ay)) < 2.2
    ti_rgb[band & (np.abs(xs - cxb) > BW / 2 - TI - 1)] *= 0.72
for ax in (0.2,):
    band = np.abs(xs - (ox + BW * ax)) < 2.2
    ti_rgb[band & (np.abs(ys - cyb) > BH / 2 - TI - 1)] *= 0.72
bezel_rgb = np.zeros_like(ti_rgb) + 6
# subtle gloss on the bezel's inner lip
bez_t = np.clip(-d_bezel / BZ, 0, 1)
bezel_rgb += 26 * np.exp(-((bez_t - 0.93) / 0.05) ** 2)[..., None]

cov_body = np.clip(0.5 - d_body, 0, 1)
cov_bezel = np.clip(0.5 - d_bezel, 0, 1)
cov_screen = np.clip(0.5 - d_screen, 0, 1)

rgb = ti_rgb * (1 - cov_bezel[..., None]) + bezel_rgb * cov_bezel[..., None]
alpha = cov_body * (1 - cov_screen)

# side buttons (titanium pills sticking out of the band)
btn_rgb = np.zeros_like(rgb)
btn_a = np.zeros_like(alpha)


def side_button(left, y0, y1):
    global btn_rgb, btn_a
    x0 = ox - 5 if left else ox + BW - 1
    hw, hh = 3.2, (y1 - y0) / 2
    d = sdf_rrect_field(W2, H2, 2.8 * ss, (x0 + 3) * ss, (oy + (y0 + y1) / 2) * ss, hw * ss, hh * ss) / ss
    cov = np.clip(0.5 - d, 0, 1)
    shade = 175 + 45 * np.cos((xs - (x0 + 3)) / 3.2 * np.pi / 2) ** 2 * (1 if left else 0.8)
    col = np.dstack([shade, shade * 0.985, shade * 0.955])
    btn_rgb = btn_rgb * (1 - cov[..., None]) + col * cov[..., None]
    btn_a = np.maximum(btn_a, cov)


side_button(True, 300, 372)       # action button
side_button(True, 470, 610)       # volume up
side_button(True, 650, 790)       # volume down
side_button(False, 540, 800)      # side button
rgb, alpha = over(btn_rgb, btn_a, rgb, alpha)

frame = to_img(rgb, alpha).convert("RGBa").resize((FW, FH), Image.LANCZOS).convert("RGBA")
frame.save(os.path.join(OUT, "phone_frame.png"))

# dynamic island (drawn above the screenshot; the status bar there is black anyway)
di_w, di_h = 292, 86
di = sdf_rrect(di_w, di_h, di_h / 2)
di_rgb = np.zeros((di_h, di_w, 3), np.float32) + 2
yy, xx = np.mgrid[0:di_h, 0:di_w]
lens = np.exp(-(((xx - (di_w - 62)) ** 2 + (yy - di_h / 2) ** 2) / (2 * 9.0 ** 2)))
di_rgb += np.dstack([lens * 18, lens * 22, lens * 38])
to_img(di_rgb, di).save(os.path.join(OUT, "dynamic_island.png"))

# edge (thickness) layer: body silhouette in darker titanium
edge_cov = cov_body
edge_lum = 95 + 50 * light
edge = to_img(np.dstack([edge_lum, edge_lum * 0.98, edge_lum * 0.95]), edge_cov).convert("RGBa").resize((FW, FH), Image.LANCZOS).convert("RGBA")
edge.save(os.path.join(OUT, "phone_edge.png"))

# contact shadow for the whole phone
body_small = np.asarray(Image.fromarray((cov_body * 255).astype(np.uint8)).resize((FW, FH), Image.LANCZOS)).astype(np.float32) / 255
s_rgb, s_a = contour_shadow(body_small, 160, 48, 40, SHADOW_COL, 0.34)
c_rgb, c_a = contour_shadow(body_small, 160, 12, 10, SHADOW_COL, 0.16)
s_rgb, s_a = over(s_rgb, s_a, c_rgb, c_a)
to_img(s_rgb, s_a).save(os.path.join(OUT, "phone_shadow.png"))

manifest["phone"] = {
    "frame": "build/phone_frame.png", "edge": "build/phone_edge.png", "shadow": "build/phone_shadow.png",
    "island": "build/dynamic_island.png", "islandSize": [di_w, di_h], "islandTop": 26,
    "size": [FW, FH], "screenOffset": [ox + BZ + TI, oy + BZ + TI], "screenRadius": RS, "shadowPad": 160,
}

# ---------------------------------------------------------------- brand logo (holographic boomerang)

src = np.asarray(Image.open(os.path.join(ROOT, "assets", "brand", "logo_source.jpg")).convert("RGB")).astype(np.float32)
dist = 255 - src.min(axis=2)                      # how far from paper white
lab, _ = ndimage.label(dist < 14)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bgm = np.isin(lab, border[border > 0])
fg = ndimage.binary_fill_holes(~bgm)
# anti-aliased edge: inside a thin band, alpha follows the distance from white
edge = fg & ~ndimage.binary_erosion(fg, iterations=3)
la = fg.astype(np.float32)
la[edge] = np.clip(dist[edge] / 34.0, 0, 1)
la = ndimage.gaussian_filter(la, 0.6) * fg + ndimage.gaussian_filter(la, 0.6) * ~fg * (ndimage.distance_transform_edt(~fg) < 2)
la = np.clip(la, 0, 1)
safe = np.maximum(la, 0.05)[..., None]
col = np.clip((src - (1 - la[..., None]) * 255) / safe, 0, 255)     # remove the white fringe
ys_, xs_ = np.where(la > 0.01)
PADL = 24
y0_, y1_, x0_, x1_ = ys_.min() - PADL, ys_.max() + PADL, xs_.min() - PADL, xs_.max() + PADL
logo = to_img(col[y0_:y1_, x0_:x1_], la[y0_:y1_, x0_:x1_])
logo.save(os.path.join(OUT, "logo.png"))
la_c = la[y0_:y1_, x0_:x1_]
s_rgb, s_a = contour_shadow(la_c, 140, 36, 30, SHADOW_COL, 0.36)
c_rgb, c_a = contour_shadow(la_c, 140, 8, 6, SHADOW_COL, 0.14)
s_rgb, s_a = over(s_rgb, s_a, c_rgb, c_a)
to_img(s_rgb, s_a).save(os.path.join(OUT, "logo_shadow.png"))
manifest["logo"] = {"src": "build/logo.png", "shadow": "build/logo_shadow.png", "size": [logo.width, logo.height], "shadowPad": 140}

with open(os.path.join(ROOT, "assets", "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print("assets ok", len(manifest["cutouts"]), "cutouts; phone", FW, FH)
