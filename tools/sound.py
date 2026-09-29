"""Procedural soundtrack for the INCPT reel: a 96 BPM minimal-tech bed plus sound design
driven by the cue list the timeline exports (out/cues.json).

    python3 tools/sound.py [out/<reel>]   -> <dir>/soundtrack.wav (48 kHz stereo)

Everything is synthesised here, so there is nothing to license.
"""
import json
import os
import sys

import numpy as np
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
DROP = 5.0                       # first downbeat of the groove
END_CARD = 22.2                  # groove stops, final chord rings out
rng = np.random.default_rng(7)

OUTD = os.path.join(ROOT, sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, "out")
cues = json.load(open(os.path.join(OUTD, "cues.json")))
DROP = cues.get("meta", {}).get("drop", DROP)
END_CARD = cues.get("meta", {}).get("end", END_CARD)
DUR = cues["duration"] + 0.05
N = int(DUR * SR)
music = np.zeros((N, 2))
kicks = np.zeros((N, 2))
sfx = np.zeros((N, 2))


# ------------------------------------------------------------------ helpers
def t_(d):
    return np.arange(int(d * SR)) / SR


def env_exp(d, tau, attack=0.002):
    t = t_(d)
    a = np.minimum(1, t / attack) if attack > 0 else 1
    return a * np.exp(-t / tau)


def place(buf, x, at, gain=1.0, pan=0.0):
    """Add mono or stereo x into buf at time `at` with constant-power pan."""
    i = int(at * SR)
    if i >= len(buf):
        return
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l, x * r], 1) * np.sqrt(2)
    j = min(len(buf), i + len(x))
    if i < 0:
        x = x[-i:]
        i = 0
    buf[i:j] += x[: j - i] * gain


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def saw(freq, d, detune=0.0):
    t = t_(d)
    ph = (freq * (1 + detune)) * t + rng.random()
    return 2 * (ph % 1) - 1


def note(n):          # MIDI -> Hz
    return 440 * 2 ** ((n - 69) / 12)


def reverb_ir(d=2.2, damp=3.2):
    t = t_(d)
    ir = rng.standard_normal((len(t), 2)) * np.exp(-t * damp)[:, None]
    ir = np.stack([lp(ir[:, 0], 6000), lp(ir[:, 1], 5500)], 1)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0))


IR = reverb_ir()


def reverb(x, wet=0.25):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    y = np.stack([signal.fftconvolve(x[:, c], IR[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet


# ------------------------------------------------------------------ instruments
def kick():
    d = 0.5
    t = t_(d)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(d, 0.22, 0.001)
    click = hp(rng.standard_normal(len(t)), 2500) * env_exp(d, 0.004, 0.0005) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9


def clap():
    d = 0.4
    x = np.zeros(int(d * SR))
    for k, off in enumerate([0, 0.011, 0.022]):
        b = bp(rng.standard_normal(int(0.3 * SR)), 900, 3200) * env_exp(0.3, 0.012 if k < 2 else 0.11, 0.0005)
        i = int(off * SR)
        x[i:i + len(b)] += b[: len(x) - i]
    return x * 0.7


def hat(open_=False):
    d = 0.25 if open_ else 0.08
    x = hp(rng.standard_normal(int(d * SR)), 7000, 4) * env_exp(d, 0.06 if open_ else 0.014, 0.0005)
    return x * 0.5


def pluck(freqs, d=0.55, bright=1.0):
    t = t_(d)
    x = sum(saw(f, d, dt) for f in freqs for dt in (-0.004, 0.004)) / (2 * len(freqs))
    # sweep a low-pass from bright to dark (block-wise for speed)
    out = np.zeros_like(x)
    blk = 480
    zi = None
    for s in range(0, len(x), blk):
        fc = 600 + 5200 * bright * np.exp(-s / SR / 0.09)
        b, a = signal.butter(2, min(fc, 18000), fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        out[s:s + blk], zi = signal.lfilter(b, a, x[s:s + blk], zi=zi)
    return out * env_exp(d, 0.22, 0.003) * 0.9


def pad(freqs, d, cutoff=1400):
    x = sum(saw(f, d, dt) for f in freqs for dt in (-0.006, 0.0, 0.006)) / (3 * len(freqs))
    x = lp(x, cutoff, 2)
    t = t_(d)
    e = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4)
    return x * e * 0.5


def sub(freq, d):
    t = t_(d)
    e = np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.05)
    return np.tanh(np.sin(2 * np.pi * freq * t) * 1.3) * e * 0.55


# F minor: i - VI - III - VII  (Fm, Db, Ab, Eb)
CHORDS = [[53, 56, 60, 63], [49, 53, 56, 60], [56, 60, 63, 67], [51, 55, 58, 62]]
ROOTS = [29, 25, 32, 27]

# ------------------------------------------------------------------ arrangement
# intro: pad + ticking hats, filter opening toward the drop
for b in range(max(1, round(DROP / BAR))):
    ch = CHORDS[b % 4]
    place(music, reverb(pad([note(n) for n in ch], BAR + 0.3, 800 + 600 * b), 0.35), b * BAR, 0.85)
for k in range(int(DROP / (BEAT / 2))):
    tt = k * BEAT / 2
    place(music, hat(), tt, 0.10 + 0.20 * tt / DROP, pan=0.25)

# groove
n_bars = int(np.ceil((END_CARD - DROP) / BAR))
side = np.ones(N)                       # sidechain envelope from the kick
PLUCK_RHY = [0, 0.75, 1.5, 2.5, 3.0]    # beats within a bar
for b in range(n_bars):
    t0 = DROP + b * BAR
    ch = CHORDS[b % 4]
    for beat in range(4):
        tb = t0 + beat * BEAT
        if tb >= END_CARD:
            break
        place(kicks, kick(), tb, 0.95)
        i = int(tb * SR)
        dk = int(0.28 * SR)
        side[i:i + dk] = np.minimum(side[i:i + dk], 1 - 0.6 * np.exp(-np.arange(min(dk, N - i)) / SR / 0.09))
        if beat in (1, 3):
            place(music, reverb(clap(), 0.3), tb, 0.55)
        for h in range(4):
            th = tb + h * BEAT / 4
            if th < END_CARD:
                place(music, hat(open_=(h == 2 and beat % 2 == 1)), th, 0.16 if h % 2 else 0.24, pan=0.3)
    for rb in PLUCK_RHY:
        tp = t0 + rb * BEAT
        if tp < END_CARD:
            place(music, reverb(pluck([note(n + 12) for n in ch], 0.5, 0.8 + 0.2 * (rb == 0)), 0.3), tp, 0.34, pan=-0.2)
    d = min(BAR, END_CARD - t0)
    place(music, sub(note(ROOTS[b % 4] + 12), d), t0, 0.9)
    place(music, reverb(pad([note(n) for n in ch], d + 0.2, 1600), 0.3), t0, 0.28)

music *= side[:, None] ** 0.8     # sidechain: the bed breathes around the kick
music += kicks

# end card: final Fm(add9) chord rings out
fin = [note(n) for n in (41, 53, 56, 60, 63, 67)]
place(music, reverb(pad(fin, 5.4, 2600), 0.5), END_CARD + 0.4, 2.0)
place(music, reverb(pluck([note(n + 12) for n in (53, 56, 60, 67)], 1.2, 1.0), 0.5), END_CARD + 0.42, 0.6)
# soft pulse keeps the end card alive: muted plucks on the beat, fading
for k in range(1, 7):
    place(music, reverb(pluck([note(n + 12) for n in (53, 60, 63)], 0.35, 0.5), 0.45), END_CARD + 0.42 + k * BEAT, 0.5 * 0.88 ** k, pan=(-0.3 if k % 2 else 0.3))
place(music, sub(note(29), 2.2) * np.exp(-t_(2.2) / 0.9), END_CARD + 0.42, 0.9)


# ------------------------------------------------------------------ sound design
def whoosh(d=0.45, up=False):
    n = int(d * SR)
    x = rng.standard_normal(n)
    t = np.arange(n) / n
    f = (250 + 3200 * t ** 1.5) if up else (2600 - 2000 * t ** 0.7)
    out = np.zeros(n)
    blk = 256
    zi = np.zeros((2, 2))
    for s in range(0, n, blk):
        fc = f[s]
        sos = signal.butter(2, [max(60, fc * 0.55), min(20000, fc * 1.6)], btype="band", fs=SR, output="sos")
        out[s:s + blk], zi = signal.sosfilt(sos, x[s:s + blk], zi=zi)
    e = np.sin(np.pi * np.clip(t / 0.62, 0, 1) * 0.5) ** 2 * np.clip((1 - t) / 0.38, 0, 1) ** 1.5
    return out * e * 1.4


def tick():
    d = 0.03
    t = t_(d)
    return (np.sin(2 * np.pi * 2400 * t) * 0.5 + hp(rng.standard_normal(len(t)), 3000) * 0.3) * env_exp(d, 0.006, 0.0005)


def tap():
    d = 0.12
    t = t_(d)
    body = np.sin(2 * np.pi * (700 + 500 * np.exp(-t / 0.01)) * t) * env_exp(d, 0.03, 0.0008)
    click = hp(rng.standard_normal(len(t)), 4000) * env_exp(d, 0.003, 0.0003) * 0.4
    return body + click


def pop(pitch=1.0):
    d = 0.14
    t = t_(d)
    f = (380 + 700 * (1 - np.exp(-t / 0.02))) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, 0.035, 0.002) * 0.8


def impact(soft=False):
    d = 2.4
    t = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * env_exp(d, 0.55 if not soft else 0.8, 0.002)
    noise = lp(rng.standard_normal(len(t)), 1800) * env_exp(d, 0.09, 0.001) * (0.6 if not soft else 0.25)
    return np.tanh((boom + noise) * 1.4) * 0.9


def riser(d):
    n = int(d * SR)
    t = np.arange(n) / n
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    zi = np.zeros((2, 2))
    for s in range(0, n, blk):
        fc = 300 + 7000 * t[s] ** 2.2
        sos = signal.butter(2, [fc * 0.6, min(20000, fc * 1.5)], btype="band", fs=SR, output="sos")
        out[s:s + blk], zi = signal.sosfilt(sos, x[s:s + blk], zi=zi)
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * t ** 2) / SR) * 0.15
    e = t ** 2.4 * np.clip((1 - t) / 0.02, 0, 1)
    return (out + tone) * e


def chime(freqs, d=0.6):
    t = t_(d)
    return sum(np.sin(2 * np.pi * f * t) * env_exp(d, 0.18, 0.002) * (0.8 ** i) for i, f in enumerate(freqs)) * 0.4


def scroll(d):
    x = np.zeros(int(d * SR))
    tt = 0.0
    while tt < d:
        p = tt / d
        gap = 0.035 + 0.09 * (1 - np.sin(np.pi * p))       # fast in the middle
        c = tick() * 0.6
        i = int(tt * SR)
        x[i:i + len(c)] += c[: len(x) - i]
        tt += gap
    return x


for c in cues["cues"]:
    k, at, g = c["type"], c["t"], c.get("gain", 0.5)
    pan = c.get("pan", 0.0)
    if k == "whoosh":
        place(sfx, whoosh(c.get("dur", 0.45), c.get("up", False)), at, g * 0.55, pan)
    elif k == "tick":
        place(sfx, tick(), at, g * 0.35)
    elif k == "tap":
        place(sfx, reverb(tap(), 0.15), at, g * 0.6)
    elif k == "pop":
        place(sfx, reverb(pop(c.get("pitch", 1.0)), 0.2), at, g * 0.45, pan)
    elif k == "impact":
        place(sfx, reverb(impact(c.get("soft", False)), 0.3), at, g * 0.8)
    elif k == "riser":
        place(sfx, riser(c.get("dur", 4.0)), at, g * 0.6)
    elif k == "confirm":
        place(sfx, reverb(chime([note(88), note(95)]), 0.35), at, g * 0.5)
        place(sfx, reverb(chime([note(95)]), 0.35), at + 0.09, g * 0.4)
    elif k == "coin":
        place(sfx, reverb(chime([1900, 2850, 3800], 0.5), 0.3), at, g * 0.45)
    elif k == "scroll":
        place(sfx, scroll(c.get("dur", 1.8)), at, g * 0.5)
    elif k == "shimmer":
        for i, n in enumerate([84, 87, 91, 94, 96]):
            place(sfx, reverb(chime([note(n)], 0.8), 0.45), at + i * 0.06, g * 0.35 * (0.9 ** i), pan=-0.4 + 0.2 * i)

# ------------------------------------------------------------------ mix + master
mix = music * 0.62 + sfx * 0.9
fade = np.ones(N)
fo = int(1.1 * SR)
fade[-fo:] = np.linspace(1, 0, fo) ** 2
mix *= fade[:, None]
mix = hp(mix.T, 25).T
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25) * 0.89   # gentle saturation + -1 dBFS ceiling
out = os.path.join(OUTD, "soundtrack.wav")
from scipy.io import wavfile
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("soundtrack", out, f"{DUR:.2f}s", "cues", len(cues["cues"]))
