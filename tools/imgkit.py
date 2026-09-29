"""Shared bitmap helpers: anti-aliased rounded-rect masks, contour shadows, compositing."""
import numpy as np
from PIL import Image, ImageFilter

SHADOW_COL = (22, 48, 104)


def sdf_rrect(w, h, r, ss=4, inset=0.0):
    """Anti-aliased rounded-rect coverage mask (float 0..1) of size w x h."""
    ys, xs = np.mgrid[0:h * ss, 0:w * ss].astype(np.float32)
    xs = (xs + 0.5) / ss
    ys = (ys + 0.5) / ss
    hx, hy = w / 2 - inset, h / 2 - inset
    qx = np.abs(xs - w / 2) - (hx - r)
    qy = np.abs(ys - h / 2) - (hy - r)
    d = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2) + np.minimum(np.maximum(qx, qy), 0) - r
    return np.clip(0.5 - d, 0, 1).reshape(h, ss, w, ss).mean(axis=(1, 3))


def to_img(rgb, a):
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8), "RGBA")


def contour_shadow(alpha, pad, blur, dy, color=SHADOW_COL, opacity=0.26):
    """Shadow that follows the alpha contour (never a rectangular layer shadow)."""
    h, w = alpha.shape
    big = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    big[pad + dy:pad + dy + h, pad:pad + w] = alpha
    im = Image.fromarray((big * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(im).astype(np.float32) / 255 * opacity
    return np.zeros((h + 2 * pad, w + 2 * pad, 3), np.float32) + np.array(color, np.float32), a


def over(dst_rgb, dst_a, src_rgb, src_a):
    out_a = src_a + dst_a * (1 - src_a)
    safe = np.where(out_a > 1e-6, out_a, 1)
    out_rgb = (src_rgb * src_a[..., None] + dst_rgb * dst_a[..., None] * (1 - src_a[..., None])) / safe[..., None]
    return out_rgb, out_a


def with_shadow(rgb, a, pad=90, blur=26, dy=22, opacity=0.26):
    """Element (rgb, alpha) on a transparent canvas with a contour shadow + tight contact shadow."""
    s_rgb, s_a = contour_shadow(a, pad, blur, dy, opacity=opacity)
    c_rgb, c_a = contour_shadow(a, pad, 6, 4, opacity=0.10)
    s_rgb, s_a = over(s_rgb, s_a, c_rgb, c_a)
    h, w = a.shape
    e_rgb = np.zeros_like(s_rgb)
    e_a = np.zeros_like(s_a)
    e_rgb[pad:pad + h, pad:pad + w] = rgb
    e_a[pad:pad + h, pad:pad + w] = a
    return over(s_rgb, s_a, e_rgb, e_a)
