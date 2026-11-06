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
META = cues.get("meta") or {}
DROP = META.get("drop", DROP)
END_CARD = META.get("end", END_CARD)
BPM = META.get("bpm", BPM)
BEAT = 60 / BPM
BAR = 4 * BEAT
STYLE = META.get("music", "tech")      # "tech": 96 BPM minimal tech; "drive": 120 BPM electro; "calm": warm keys;
                                       # "pulse": bass house (promo); "liquid": liquid drum & bass at 2x the film tempo
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

def epiano(freqs, d, bright=1.0):
    """Rhodes-like electric piano: sine body + a decaying bell tine + slow tremolo."""
    t = t_(d)
    out = np.zeros((len(t), 2))
    for k, f in enumerate(freqs):
        ph = 2 * np.pi * f * t
        tine = np.sin(ph * 2 + 1.2 * np.exp(-t / 0.06) * np.sin(ph * 7)) * np.exp(-t / 0.35) * 0.35 * bright
        body = np.sin(ph + 0.4 * np.exp(-t / 0.15) * np.sin(ph * 2))
        x = (body + tine) * np.minimum(1, t / 0.006) * np.exp(-t / 1.4) * np.minimum(1, (d - t) / 0.08)
        x *= 1 + 0.1 * np.sin(2 * np.pi * 4.6 * t + k)
        p = -0.35 + 0.7 * k / max(1, len(freqs) - 1)
        out[:, 0] += x * np.cos((p + 1) * np.pi / 4)
        out[:, 1] += x * np.sin((p + 1) * np.pi / 4)
    return out * 0.32


def bell(f, d=1.4):
    t = t_(d)
    x = sum(np.sin(2 * np.pi * f * m * t) * a * np.exp(-t / (0.9 / m ** 0.5)) for m, a in ((1, 1), (2.76, 0.35), (5.4, 0.12)))
    return x * np.minimum(1, t / 0.003) * 0.4


def soft_kick():
    return lp(kick(), 900) * 0.8


def rim():
    d = 0.12
    t = t_(d)
    x = bp(rng.standard_normal(len(t)), 1500, 5000) * env_exp(d, 0.018, 0.0005) + np.sin(2 * np.pi * 1850 * t) * env_exp(d, 0.012) * 0.4
    return x * 0.5


def shaker():
    d = 0.09
    t = t_(d)
    return hp(rng.standard_normal(len(t)), 6000, 4) * np.minimum(1, t / 0.012) * np.exp(-t / 0.03) * 0.35


def bass(f, d):
    t = t_(d)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.2)
    return np.tanh(x * 1.2) * np.minimum(1, t / 0.012) * np.minimum(1, (d - t) / 0.06) * 0.5


MEDIT = META.get("musicEdit")              # a cut of generated music (tools/music_edit.py) instead of a synth bed
if MEDIT:
    import subprocess, tempfile
    from scipy.io import wavfile as _wf
    with tempfile.TemporaryDirectory() as _d:
        _o = os.path.join(_d, "m.wav")
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "music_edit.py"), os.path.join(ROOT, MEDIT), _o], check=True)
        _sr, _x = _wf.read(_o)
    _x = _x.astype(np.float64)
    _n = min(N, len(_x))
    music[:_n] = _x[:_n]
elif STYLE == "tech":
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



elif STYLE == "drive":
    # ---------------- drive: 120 BPM driving electro (promo). F minor i-VI-III-VII, four-on-the-floor,
    # rolling 16th bass, supersaw stabs, 16th hats + open offbeats, an arp that joins halfway
    def supersaw(freqs, d, cutoff=5200, decay=0.16):
        x = sum(saw(f, d, dt) for f in freqs for dt in (-0.012, -0.006, 0.0, 0.006, 0.012)) / (5 * len(freqs))
        out = np.zeros_like(x)
        blk, zi = 480, None
        for s in range(0, len(x), blk):
            fc = 700 + cutoff * np.exp(-s / SR / 0.07)
            b, a = signal.butter(2, min(fc, 18000), fs=SR)
            if zi is None:
                zi = signal.lfilter_zi(b, a) * 0
            out[s:s + blk], zi = signal.lfilter(b, a, x[s:s + blk], zi=zi)
        return out * env_exp(d, decay, 0.002)

    def snare():
        d = 0.3
        t = t_(d)
        body = np.sin(2 * np.pi * (190 + 60 * np.exp(-t / 0.02)) * t) * env_exp(d, 0.07, 0.001)
        noise = bp(rng.standard_normal(len(t)), 1200, 9000) * env_exp(d, 0.09, 0.0008)
        return np.tanh((body * 0.7 + noise) * 1.5) * 0.6

    def roll_bass(f, d):
        t = t_(d)
        x = lp(saw(f, d) * 0.8 + np.sin(2 * np.pi * f / 2 * t) * 0.9, 900)
        return np.tanh(x * 1.6) * np.minimum(1, t / 0.004) * np.exp(-t / 0.09) * 0.55

    KEY = META.get("key", 0)                     # transpose the whole drive arrangement (semitones)
    CHORDS = [[n + KEY for n in c] for c in CHORDS]
    ROOTS = [n + KEY for n in ROOTS]
    side = np.ones(N)
    # intro (hook): filtered stabs on the offbeats, hats rising, a snare roll into the drop
    n_in = int(round(DROP / BAR))
    for b in range(n_in):
        ch = CHORDS[b % 4]
        place(music, reverb(pad([note(n) for n in ch], BAR + 0.2, 700 + 900 * b), 0.3), b * BAR, 0.7)
        for k in range(4):
            tb = b * BAR + (k + 0.5) * BEAT
            if tb < DROP - 0.05:
                place(music, reverb(supersaw([note(n + 12) for n in ch], 0.25, 900 + 1500 * (b * 4 + k) / (4 * n_in)), 0.25), tb, 0.32)
        for k in range(4):
            tk = b * BAR + k * BEAT
            place(kicks, lp(kick(), 300 + 500 * b), tk, 0.55 + 0.15 * b)
    for k in range(int(DROP / (BEAT / 2))):
        place(music, hat(), k * BEAT / 2, 0.08 + 0.2 * k * BEAT / 2 / DROP, pan=0.25)
    roll_t = DROP - BAR / 2
    k, tt = 0, roll_t
    while tt < DROP - BEAT / 4:
        place(music, snare(), tt, 0.18 + 0.4 * (tt - roll_t) / (BAR / 2))
        tt += BEAT / 4 if tt < DROP - BEAT else BEAT / 8
        k += 1
    # groove
    n_bars = int(np.ceil((END_CARD - DROP) / BAR))
    STAB = [0, 0.75, 1.5, 2.5, 3.0]
    for b in range(n_bars):
        t0 = DROP + b * BAR
        ch = CHORDS[b % 4]
        root = ROOTS[b % 4] + 12
        for beat in range(4):
            tb = t0 + beat * BEAT
            if tb >= END_CARD:
                break
            place(kicks, kick(), tb, 1.0)
            i = int(tb * SR)
            dk = int(0.24 * SR)
            side[i:i + dk] = np.minimum(side[i:i + dk], 1 - 0.65 * np.exp(-np.arange(min(dk, N - i)) / SR / 0.08))
            if beat in (1, 3):
                place(music, reverb(snare(), 0.22), tb, 0.55)
                place(music, reverb(clap(), 0.3), tb, 0.35)
            for h in range(4):
                th = tb + h * BEAT / 4
                if th < END_CARD:
                    place(music, hat(open_=(h == 2)), th, 0.3 if h == 2 else (0.12 if h % 2 else 0.18), pan=0.3 if h % 2 else -0.15)
            for h in (1, 2, 3):                      # rolling bass between the kicks
                th = tb + h * BEAT / 4
                if th < END_CARD:
                    place(music, roll_bass(note(root + (7 if (beat == 3 and h == 3) else 0)), BEAT / 4 + 0.02), th, 0.75)
        for rb in STAB:
            tp = t0 + rb * BEAT
            if tp < END_CARD:
                place(music, reverb(supersaw([note(n + 12) for n in ch], 0.32, 5200 if rb == 0 else 3800), 0.28), tp, 0.38, pan=-0.15)
        if b >= 2:                                    # arp joins on the third bar
            for s16 in range(16):
                tp = t0 + s16 * BEAT / 4
                if tp < END_CARD:
                    n = ch[[0, 1, 2, 3, 2, 1][s16 % 6]] + 24
                    place(music, reverb(pluck([note(n)], 0.18, 0.7), 0.3), tp, 0.13, pan=0.35 if s16 % 2 else -0.35)
        d = min(BAR, END_CARD - t0)
        place(music, reverb(pad([note(n) for n in ch], d + 0.2, 1800), 0.3), t0, 0.22)
    music *= side[:, None] ** 0.85
    music += kicks
    # end card: one big stab, then the chord rings out over muted pulses
    fin = [note(n + KEY) for n in (41, 53, 56, 60, 63, 67)]
    place(music, reverb(supersaw([note(n + 12 + KEY) for n in (53, 56, 60, 67)], 1.2, 6000, 0.5), 0.45), END_CARD + 0.4, 0.8)
    place(music, reverb(pad(fin, 5.4, 2600), 0.5), END_CARD + 0.4, 1.8)
    place(music, sub(note(29 + KEY), 2.4) * np.exp(-t_(2.4) / 0.9), END_CARD + 0.42, 1.0)
    for k in range(1, 9):
        place(music, reverb(pluck([note(n + 12 + KEY) for n in (53, 60, 63)], 0.3, 0.5), 0.45), END_CARD + 0.42 + k * BEAT, 0.45 * 0.86 ** k, pan=(-0.3 if k % 2 else 0.3))

elif STYLE in ("pulse", "liquid"):
    # ---------------- the energetic styles. pulse: 120-128 BPM bass house (promo cuts); liquid: liquid drum &
    # bass at double the film's tempo (90 BPM film -> 180 BPM). Both: a hook, a breakdown + build into a second
    # drop, stutter edits, a groove that keeps going under the end card and the INCPT sound logo.
    # META: drop, end, bpm, key, build (start of the build), drop2 (second drop), stutter: [times].
    from scipy.ndimage import maximum_filter1d

    def lp_sweep(x, fc, blk=256, btype="low"):
        """2-pole filter whose cutoff follows fc(seconds into x)."""
        out = np.zeros_like(x)
        zi = np.zeros(2)
        for s in range(0, len(x), blk):
            b, a = signal.butter(2, float(np.clip(fc(s / SR), 30, 18000)), btype=btype, fs=SR)
            out[s:s + blk], zi = signal.lfilter(b, a, x[s:s + blk], zi=zi)
        return out

    def square(f, d, detune=0.0):
        return np.sign(saw(f, d, detune))

    def kick_punch(d=0.4, tone=52, decay=0.15, drive=2.0):
        t = t_(d)
        f = tone + 170 * np.exp(-t / 0.026) + 60 * np.exp(-t / 0.003)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.0006) * np.exp(-t / decay)
        click = hp(rng.standard_normal(len(t)), 3500) * env_exp(d, 0.0025, 0.0003) * 0.5
        return np.tanh((body + click) * drive) * 0.8

    def snare_crack(d=0.3, tone=190, tau=0.11):
        t = t_(d)
        body = np.sin(2 * np.pi * np.cumsum(tone + 80 * np.exp(-t / 0.012)) / SR) * env_exp(d, 0.055, 0.0006)
        nz = rng.standard_normal(len(t))
        noise = bp(nz, 1800, 11000) * env_exp(d, tau, 0.0006)
        crack = hp(nz, 5000) * env_exp(d, 0.012, 0.0003) * 0.6
        return np.tanh((body * 0.8 + noise + crack) * 1.8) * 0.55

    MET = (205.3, 304.4, 369.6, 522.7, 540.0, 800.0)          # 808 cymbal oscillators

    def hat2(open_=False, tone=1.0):
        d = 0.32 if open_ else 0.07
        t = t_(d)
        x = sum(np.sign(np.sin(2 * np.pi * f * 1.6 * tone * t + k)) for k, f in enumerate(MET)) / 6
        x = hp(x, 7000, 4) * 0.8 + hp(rng.standard_normal(len(t)), 8000, 2) * 0.5
        return x * env_exp(d, 0.085 if open_ else 0.016, 0.0004) * 0.45

    def ride2(d=1.0):
        t = t_(d)
        x = sum(np.sign(np.sin(2 * np.pi * f * 2.3 * t + k)) for k, f in enumerate(MET)) / 6
        x = bp(x, 4500, 14000) * env_exp(d, 0.35, 0.0005) + np.sin(2 * np.pi * 5100 * t) * env_exp(d, 0.25) * 0.08
        return x * 0.3

    def tom(f=150, d=0.35):
        t = t_(d)
        return np.tanh(np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t / 0.03))) / SR) * env_exp(d, 0.12, 0.001) * 1.5) * 0.5

    def stab(freqs, d=0.3, cutoff=5000, tau=0.12, env_tau=0.14):
        x = sum(saw(f, d, dt) for f in freqs for dt in (-0.011, -0.005, 0.0, 0.005, 0.011)) / (5 * len(freqs))
        return lp_sweep(x, lambda s: 500 + cutoff * np.exp(-s / tau)) * env_exp(d, env_tau, 0.002)

    def wide(fn):                       # two takes with different random phases = a stereo image
        return np.stack([fn(), fn()], 1)

    def wub(f, d, open_=2400, tau=0.07, drive=2.2):
        t = t_(d)
        x = saw(f, d) * 0.7 + square(f * 0.5, d) * 0.45 + saw(f, d, 0.007) * 0.5
        x = np.tanh(lp_sweep(x, lambda s: 180 + open_ * np.exp(-s / tau), blk=128) * drive)
        return hp(x, 70) * np.minimum(1, t / 0.003) * np.minimum(1, (d - t) / 0.015) * 0.5

    def reese(f, d, cut=520, lfo=0.6):
        t = t_(d)
        x = saw(f, d, -0.0045) + saw(f, d, 0.0045) + 0.4 * saw(2 * f, d, 0.002)
        ph = rng.random() * 6.283
        x = hp(np.tanh(lp_sweep(x, lambda s: cut * (1 + 0.55 * np.sin(2 * np.pi * lfo * s + ph))) * 1.6), 110)
        e = np.minimum(1, t / 0.012) * np.minimum(1, (d - t) / 0.04)
        return (x * 0.42 + np.tanh(np.sin(2 * np.pi * f * t) * 1.2) * 0.55) * e

    def lead(f, d, bright=1.0):
        t = t_(d)
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, np.maximum(0, t - 0.12) / 0.2)
        ph = np.cumsum(f * vib) / SR
        x = sum(2 * ((ph * (1 + dt) + rng.random()) % 1) - 1 for dt in (-0.006, 0.0, 0.006)) / 3
        x += 0.35 * np.sign(np.sin(np.pi * ph))
        x = lp_sweep(x, lambda s: 900 + 4200 * bright * np.exp(-s / 0.18))
        e = np.minimum(1, t / 0.004) * (0.55 + 0.45 * np.exp(-t / 0.12)) * np.minimum(1, (d - t) / 0.03)
        return x * e * 0.5

    VOW = {"a": (800, 1150, 2900), "o": (450, 800, 2830), "e": (400, 1700, 2600), "u": (330, 700, 2500)}

    def vox(f, d, v="a", bend=0.0, tau=0.25):
        """a synthetic vocal chop: a buzz through three formant band-passes"""
        t = t_(d)
        fr = f * (1 + bend * np.exp(-t / 0.05)) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t))
        src = 2 * ((np.cumsum(fr) / SR + rng.random()) % 1) - 1
        x = sum(bp(src, F * 0.9, F * 1.1) * g for F, g in zip(VOW[v], (1.0, 0.6, 0.3)))
        x += hp(rng.standard_normal(len(t)), 6000) * 0.04
        e = np.minimum(1, t / 0.008) * np.exp(-t / tau) * np.minimum(1, (d - t) / 0.02)
        return np.tanh(x * 3) * e * 0.5

    def nriser(d, f0=300, f1=9000):
        t = t_(d)
        x = lp_sweep(rng.standard_normal(len(t)), lambda s: f0 * (f1 / f0) ** (s / d))
        ph = np.cumsum(note(60) * 2 ** (t / d * 1.0)) / SR
        tone = (2 * (ph % 1) - 1) * 0.12
        return (x * 0.5 + lp(tone, 3000)) * (t / d) ** 2

    def subdrop(d=0.9, f0=110, f1=44):
        t = t_(d)
        return np.tanh(np.sin(2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t / 0.18)) / SR) * 1.4) * np.exp(-t / 0.5) * 0.7

    def limit(x, ceil=0.92, rel=0.06, blk=32):
        a = maximum_filter1d(np.abs(x).max(1), int(0.003 * SR))
        a = a[: len(a) // blk * blk].reshape(-1, blk).max(1)
        g = np.minimum(1.0, ceil / np.maximum(a, 1e-9))
        c = np.exp(-blk / SR / rel)
        for i in range(1, len(g)):
            g[i] = min(g[i], g[i - 1] * c + (1 - c))
        g = np.repeat(g, blk)
        g = np.concatenate([g, np.full(len(x) - len(g), g[-1])])
        return np.tanh(x * g[:, None] / ceil) * ceil

    KEY = META.get("key", 0)
    BUILD = META.get("build")
    DROP2 = META.get("drop2")
    BAR_ = BAR if STYLE == "pulse" else 2 * BEAT                 # liquid: a bar at double tempo
    S16 = BAR_ / 16
    side = np.ones(N)
    gate = np.ones(N)
    drums = np.zeros((N, 2))
    revb = np.zeros((N, 2))
    dlyb = np.zeros((N, 2))
    outro = np.zeros((N, 2))

    def put(buf, x, at, g=1.0, pan=0.0, rv=0.0, dl=0.0):
        place(buf, x, at, g, pan)
        if rv:
            place(revb, x, at, g * rv, pan)
        if dl:
            place(dlyb, x, at, g * dl, pan)

    def duck(at, depth, tau):
        i = int((at - 0.003) * SR)
        m = min(int(0.35 * SR), N - i)
        if m <= 0 or i < 0:
            return
        n = np.arange(m)
        r = int(0.003 * SR)
        side[i:i + m] = np.minimum(side[i:i + m], 1 - depth * np.minimum(1, n / r) * np.exp(-np.maximum(0, n - r) / SR / tau))

    def gap(t0, t1):                    # a moment of silence before a drop
        i, j = int(t0 * SR), int(t1 * SR)
        r = int(0.004 * SR)
        gate[i:j] = 0
        gate[i - r:i] = np.minimum(gate[i - r:i], np.linspace(1, 0, r))
        gate[j:j + r] = np.minimum(gate[j:j + r], np.linspace(0, 1, r))

    def roll(t0, t1, buf, g0=0.15, g1=0.6):
        """snare roll: 8ths, then 16ths, then 32nds, rising"""
        tt = t0
        while tt < t1 - 1e-6:
            p = (tt - t0) / (t1 - t0)
            put(buf, snare_crack(0.2, 200 + 120 * p), tt, g0 + (g1 - g0) * p, rv=0.2)
            tt += S16 * (2 if p < 0.5 else 1 if p < 0.8 else 0.5)

    def section(t):
        if t < DROP:
            return "intro"
        if t >= END_CARD:
            return "end"
        if BUILD and DROP2 and BUILD <= t < DROP2:
            return "build"
        if STYLE == "liquid" and BUILD and DROP2 and BUILD > DROP2 and t >= BUILD:
            return "build"
        return "drop2" if DROP2 and t >= DROP2 else "drop"

    if STYLE == "pulse":
        CH = [[n + KEY for n in c] for c in CHORDS]             # Fm7 Dbmaj7 Abmaj7 Ebmaj7 (+KEY)
        RT = [n + KEY + 12 for n in ROOTS]
        HOOK = [[(0, 72, 3), (3, 75, 3), (6, 77, 4), (10, 75, 2), (12, 72, 2), (14, 70, 2)],
                [(0, 68, 3), (3, 70, 3), (6, 73, 4), (10, 72, 2), (12, 68, 4)],
                [(0, 72, 3), (3, 75, 3), (6, 80, 4), (10, 79, 2), (12, 75, 2), (14, 77, 2)],
                [(0, 79, 3), (3, 77, 3), (6, 75, 2), (8, 72, 2), (10, 70, 6)]]
        BASS_A = [(2, 0), (3, 0), (6, 12), (7, 0), (10, 0), (11, 12), (13, 0), (14, 7)]
        BASS_B = [(1, 0), (3, 12), (5, 0), (6, 0), (7, 12), (9, 0), (10, 7), (11, 12), (13, 0), (14, 19), (15, 12)]
        STABS = [0, 3, 6, 10, 12]
        LOGO = [(0, 72, 2), (2, 77, 2), (4, 75, 2), (6, 77, 10)]
        n_bars = int(np.ceil(DUR / BAR_)) + 1
        bar0 = DROP - round(DROP / BAR_) * BAR_                  # bars line up with the drop
        for b in range(-1, n_bars):
            t0 = bar0 + b * BAR_
            if t0 + BAR_ <= 0 or t0 >= END_CARD:
                continue
            ci = (b % 4)
            ch, root = CH[ci], RT[ci]
            for st in range(16):
                ts = t0 + st * S16
                if ts < 0 or ts >= END_CARD:
                    continue
                sec = section(ts)
                beat, sub16 = divmod(st, 4)
                k_in = (ts - DROP) / BAR_                        # bars since the drop
                if sec == "intro":
                    p = ts / DROP
                    if sub16 == 0:
                        put(drums, lp(kick_punch(), 220 + 900 * p), ts, 0.55 + 0.3 * p)
                    if sub16 == 2:
                        put(drums, hat2(True), ts, 0.08 + 0.2 * p, pan=0.2)
                    if st in (2, 6, 10, 14):
                        put(music, lp(stab([note(n + 12) for n in ch], 0.22, 1200 + 3000 * p), 900 + 4000 * p), ts, 0.34, pan=-0.1, rv=0.35)
                    if ts >= DROP - BAR_ and sub16 in (1, 3):
                        put(drums, hat2(), ts, 0.1, pan=-0.2)
                elif sec in ("drop", "drop2"):
                    hard = sec == "drop2"
                    if sub16 == 0:
                        put(drums, kick_punch(), ts, 1.0)
                        duck(ts, 0.72, 0.085)
                    if st in (4, 12):
                        put(drums, snare_crack(), ts, 0.5, rv=0.18)
                        put(drums, clap(), ts, 0.42, rv=0.3)
                    put(drums, hat2(open_=(sub16 == 2)), ts, (0.3 if sub16 == 2 else 0.14 if sub16 == 0 else 0.09), pan=0.25 if sub16 % 2 else -0.15)
                    if hard or k_in >= 2:
                        put(drums, shaker(), ts, 0.5 if sub16 % 2 else 0.3, pan=0.45)
                        if st in (3, 11):
                            put(drums, rim(), ts, 0.4, pan=-0.45, rv=0.2)
                    if st == 14 and int(k_in) % 2 == 1:
                        put(drums, tom(170), ts, 0.45, pan=0.3)
                        put(drums, tom(120), ts + S16, 0.5, pan=-0.3)
                    pat = BASS_B if (hard or k_in >= 2) else BASS_A
                    for s_, off in pat:
                        if s_ == st:
                            put(music, wub(note(root + 12 + off), S16 * 1.05, 2600 if hard else 2000), ts, 0.62)
                    if st in STABS:
                        put(music, wide(lambda: stab([note(n + 12) for n in ch], 0.26, 5200 if st == 0 else 3800)), ts, 0.3, rv=0.25)
                    if hard or k_in >= 2:                        # arp
                        n_ = ch[[0, 1, 2, 3, 2, 1][st % 6]] + 24
                        put(music, pluck([note(n_)], 0.16, 0.7), ts, 0.1, pan=0.35 if st % 2 else -0.35, dl=0.5)
                elif sec == "build":
                    into = (ts - BUILD) / (DROP2 - BUILD)
                    first = ts < BUILD + BAR_
                    if first:                                    # breakdown: half-time drums
                        if st in (0, 10):
                            put(drums, kick_punch(decay=0.25), ts, 0.9)
                            duck(ts, 0.5, 0.12)
                        if st == 8:
                            put(drums, snare_crack(0.4, 180, 0.16), ts, 0.6, rv=0.4)
                            put(drums, clap(), ts, 0.4, rv=0.4)
                        if sub16 == 2:
                            put(drums, hat2(True), ts, 0.16, pan=0.3)
                    else:
                        if sub16 == 0:
                            put(drums, lp(kick_punch(), 600 + 6000 * into ** 2), ts, 0.85)
                            duck(ts, 0.5, 0.1)
                        put(drums, hat2(), ts, 0.06 + 0.12 * into, pan=-0.2)
                # the hook (lead), from the drop; in the second drop doubled an octave up + vocal chops
                if sec in ("drop", "drop2", "build"):
                    for s_, n_, ln in HOOK[ci]:
                        if s_ != st:
                            continue
                        n_ += KEY
                        dd = ln * S16 * 0.95
                        if sec == "build" and ts < BUILD + BAR_:
                            put(music, vox(note(n_), dd + 0.15, "o" if s_ % 2 else "a", 0.02, 0.4), ts, 0.42, rv=0.5, dl=0.35)
                        elif sec == "build":
                            put(music, lp(lead(note(n_), dd), 600 + 5000 * ((ts - BUILD - BAR_) / BAR_) ** 2), ts, 0.4, rv=0.3)
                        else:
                            put(music, lead(note(n_), dd, 1.1 if sec == "drop2" else 0.8), ts, 0.34, pan=-0.05, rv=0.25, dl=0.3)
                            if sec == "drop2":
                                put(music, lead(note(n_ + 12), dd, 0.9), ts, 0.16, pan=0.2, rv=0.3)
                                put(music, vox(note(n_), dd + 0.05, "a" if s_ % 3 else "e", 0.015), ts, 0.22, pan=-0.25, rv=0.35)
                if sec == "intro" and ts < DROP - BAR_:              # the hook teased as vocal chops
                    for s_, n_, ln in HOOK[ci]:
                        if s_ == st and s_ < 10:
                            put(music, vox(note(n_ + KEY), ln * S16 + 0.12, "a" if s_ % 2 == 0 else "o", 0.03), ts, 0.32, rv=0.5, dl=0.4)
            sec0 = section(max(t0, 0) + 1e-3)
            d = min(BAR_, END_CARD - max(t0, 0))
            if d <= 0:
                continue
            if sec0 in ("drop", "drop2"):
                put(music, sub(note(root), d), max(t0, 0), 0.75)
                put(music, wide(lambda: pad([note(n) for n in ch], d + 0.2, 1500)), max(t0, 0), 0.16, rv=0.3)
            elif sec0 == "intro":
                p = max(t0, 0) / DROP
                put(music, wide(lambda: pad([note(n) for n in ch], d + 0.3, 700 + 1100 * p)), max(t0, 0), 0.4, rv=0.4)
            elif sec0 == "build":
                cut0 = 400 if t0 < BUILD + BAR_ - 1e-3 else 1200
                x = wide(lambda: lp_sweep(sum(saw(note(n + 12), d + 0.05, dt) for n in ch for dt in (-0.01, 0, 0.01)) / 12,
                                          lambda s: cut0 + 6000 * (s / d) ** 2 * (0 if t0 < BUILD + BAR_ - 1e-3 else 1)))
                put(music, x, max(t0, 0), 0.5, rv=0.35)
                put(music, sub(note(root), d), max(t0, 0), 0.5 if t0 < BUILD + BAR_ - 1e-3 else 0.0)
        # risers and rolls into each drop, then a 16th of silence
        put(music, nriser(BAR_), DROP - BAR_, 0.55)
        roll(DROP - BAR_ / 2, DROP - S16, drums, 0.12, 0.5)
        gap(DROP - S16, DROP - 0.004)
        if BUILD and DROP2:
            put(music, nriser(DROP2 - BUILD), BUILD, 0.6)
            roll(BUILD + BAR_, DROP2 - S16, drums, 0.12, 0.62)
            gap(DROP2 - S16, DROP2 - 0.004)
        # end card: the big chord, a sub drop, the groove keeps going under it and fades; the INCPT sound logo
        fin = [note(n + KEY + 12) for n in (53, 56, 60, 63, 67)]
        put(music, wide(lambda: stab(fin, 1.4, 6500, 0.4, 0.55)), END_CARD, 0.75, rv=0.5)
        put(music, subdrop(), END_CARD, 0.6)
        put(drums, kick_punch(decay=0.3), END_CARD, 1.0)
        put(music, wide(lambda: pad([note(n + KEY) for n in (41, 53, 56, 60, 63, 67)], DUR - END_CARD, 2200)), END_CARD + 0.05, 0.55, rv=0.5)
        k = 1
        while END_CARD + k * S16 * 4 < DUR - 1.0:
            ts = END_CARD + k * S16 * 4
            put(outro, kick_punch(), ts, 0.9)
            if k % 2:
                put(outro, clap(), ts, 0.35, rv=0.3)
            for h in range(4):
                put(outro, hat2(open_=(h == 2)), ts + h * S16, 0.25 if h == 2 else 0.09, pan=0.2)
            put(outro, wub(note(RT[0] + 12), S16 * 1.05, 1200), ts + 2 * S16, 0.5)
            k += 1
        for s_, n_, ln in LOGO:
            at = END_CARD + 1.5 + s_ * S16
            put(music, lead(note(n_ + KEY), ln * S16, 1.0), at, 0.3, rv=0.45, dl=0.45)
            put(music, bell(note(n_ + KEY + 12), 1.6), at, 0.2, rv=0.5)
        L_ = len(outro) - int(END_CARD * SR)
        for c in range(2):
            seg = outro[int(END_CARD * SR):, c]
            outro[int(END_CARD * SR):, c] = lp_sweep(seg, lambda s: 300 + 9000 * np.exp(-s / 1.4)) * np.exp(-np.arange(L_) / SR / 3.2)

    else:
        # liquid drum & bass: Dbmaj9 Fm7(11) Bbm9 Gbmaj9, one chord a bar, two-step drums, reese bass, rhodes
        LC = [[49, 53, 56, 60, 63], [53, 56, 60, 63, 70], [46, 49, 53, 56, 60], [54, 58, 61, 65, 68]]
        LR = [37, 41, 34, 42]
        LC = [[n + KEY for n in c] for c in LC]
        LR = [n + KEY for n in LR]
        LHOOK = [[(0, 80, 6), (6, 77, 2), (8, 75, 4), (12, 73, 4)],
                 [(0, 72, 6), (6, 75, 2), (8, 77, 6), (14, 80, 2)],
                 [(0, 82, 6), (6, 80, 2), (8, 77, 4), (12, 73, 4)],
                 [(0, 77, 6), (6, 75, 2), (8, 73, 4), (12, 68, 4)]]
        LOGO = [(0, 68, 3), (3, 73, 3), (6, 72, 3), (9, 73, 12)]
        n_bars = int(np.ceil(DUR / BAR_)) + 1
        bar0 = DROP - round(DROP / BAR_) * BAR_
        for b in range(-1, n_bars):
            t0 = bar0 + b * BAR_
            if t0 + BAR_ <= 0 or t0 >= END_CARD:
                continue
            ci = b % 4
            ch, root = LC[ci], LR[ci]
            for st in range(16):
                ts = t0 + st * S16
                if ts < 0 or ts >= END_CARD:
                    continue
                sec = section(ts)
                k_in = (ts - DROP) / BAR_
                if sec == "intro":
                    if ts >= DROP - 2 * BAR_:                    # the break, filtered, in the last two bars
                        if st in (0, 10):
                            put(drums, hp(kick_punch(0.3, 55, 0.12), 700), ts, 0.5)
                        if st in (4, 12):
                            put(drums, hp(snare_crack(), 900), ts, 0.4, rv=0.3)
                        if st % 2 == 0:
                            put(drums, hat2(), ts, 0.12, pan=0.25)
                    if st in (0, 8):
                        put(drums, shaker(), ts + S16 * 2, 0.18, pan=-0.35)
                elif sec in ("drop", "drop2"):
                    hard = sec == "drop2"
                    kp = (0, 7, 10) if int(k_in) % 4 == 3 else (0, 10)
                    if st in kp:
                        put(drums, kick_punch(0.35, 55, 0.13, 2.4), ts, 0.95)
                        duck(ts, 0.4, 0.09)
                    if st in (4, 12):
                        put(drums, snare_crack(0.3, 200, 0.12), ts, 0.62, rv=0.22)
                    if st in (7, 9, 15) or (st == 14 and int(k_in) % 2):
                        put(drums, lp(snare_crack(0.15, 210, 0.05), 5000), ts, 0.13, pan=0.15)
                    put(drums, hat2(open_=(st == 14 and int(k_in) % 2 == 0)), ts, (0.16 if st % 2 == 0 else 0.07), pan=0.25 if st % 4 else -0.1)
                    if hard and st % 4 == 0:
                        put(drums, ride2(), ts, 0.4, pan=-0.3)
                    if hard or k_in >= 2:
                        put(drums, shaker(), ts, 0.3 if st % 2 else 0.18, pan=0.45)
                    for s_, ln in ((0, 9.5), (10, 3.6), (14, 1.8)):
                        if s_ == st and (s_ != 14 or hard):
                            put(music, reese(note(root + (12 if s_ == 14 else 0)), ln * S16, 480 if hard else 380, 0.7), ts, 0.62)
                    if st == 10:
                        put(music, epiano([note(n + 12) for n in ch[:4]], 0.5, 1.1), ts, 0.34, rv=0.3)
                    if hard:
                        for s_, n_, ln in LHOOK[ci]:
                            if s_ == st:
                                put(music, pluck([note(n_)], ln * S16 + 0.2, 0.9), ts, 0.22, pan=0.1, rv=0.3, dl=0.35)
                                put(music, bell(note(n_), 1.0), ts, 0.16, pan=-0.2, rv=0.4)
                elif sec == "build":
                    if st % 4 == 0:
                        put(drums, lp(kick_punch(0.35, 55, 0.13), 900 + 6000 * ((ts - BUILD) / (END_CARD - BUILD)) ** 2), ts, 0.8)
                    put(drums, hat2(), ts, 0.08, pan=0.25)
            t0c = max(t0, 0)
            d = min(BAR_, END_CARD - t0c)
            if d <= 0:
                continue
            sec0 = section(t0c + 1e-3)
            # rhodes on the one, pad underneath, vocal oohs in the intro
            up = 0 if sec0 == "intro" else 12                 # in the drops the keys sit above the reese
            put(music, epiano([note(n + up) for n in ch], d + 0.5, 1.0), t0c, 0.5 if up else 0.62, rv=0.35)
            put(music, wide(lambda: pad([note(n) for n in ch[:4]], d + 0.3, 1800)), t0c, 0.16 if up else 0.28, rv=0.4)
            if sec0 == "intro":
                for k, n in enumerate(ch[1:4]):
                    put(music, vox(note(n + 12), d + 0.2, "u", 0.0, 0.9), t0c + k * 0.03, 0.16, pan=-0.3 + 0.3 * k, rv=0.6)
                if t0c < DROP - 2 * BAR_:
                    for s_, n_, ln in LHOOK[ci][:2]:
                        put(music, bell(note(n_), 1.6), t0c + s_ * S16, 0.18, pan=0.2, rv=0.5, dl=0.4)
            if sec0 == "build":
                put(music, sub(note(root), d), t0c, 0.4)
        put(music, nriser(2 * BAR_), DROP - 2 * BAR_, 0.5)
        roll(DROP - BAR_, DROP - S16, drums, 0.1, 0.5)
        gap(DROP - S16, DROP - 0.004)
        if BUILD:
            put(music, nriser(END_CARD - BUILD), BUILD, 0.55)
            roll(BUILD, END_CARD - S16, drums, 0.1, 0.6)
            gap(END_CARD - S16, END_CARD - 0.004)
        # end card: the chord rings, a sub drop, half-speed hats and ride under it; the INCPT sound logo
        fin = [note(n + KEY) for n in (49, 56, 60, 63, 65, 68)]
        put(music, epiano(fin, 4.5, 1.2), END_CARD, 0.75, rv=0.45)
        put(music, wide(lambda: pad([note(n + KEY) for n in (37, 49, 56, 60, 63)], DUR - END_CARD, 2200)), END_CARD + 0.02, 0.55, rv=0.5)
        put(music, subdrop(1.2, 120, 44), END_CARD, 0.6)
        put(drums, kick_punch(0.5, 50, 0.25), END_CARD, 1.0)
        put(drums, snare_crack(0.5, 180, 0.2), END_CARD, 0.4, rv=0.5)
        st = 1
        while END_CARD + st * S16 * 2 < DUR - 0.9:
            ts = END_CARD + st * S16 * 2
            put(outro, hat2(), ts, 0.14 if st % 2 == 0 else 0.07, pan=0.25)
            if st % 8 == 0:
                put(outro, kick_punch(0.35, 55, 0.13), ts, 0.7)
            if st % 8 == 4:
                put(outro, snare_crack(0.3, 200, 0.12), ts, 0.4, rv=0.3)
            if st % 4 == 0:
                put(outro, ride2(), ts, 0.3, pan=-0.3)
            st += 1
        for s_, n_, ln in LOGO:
            at = END_CARD + 0.7 + s_ * S16
            put(music, bell(note(n_ + KEY), 1.8), at, 0.34, rv=0.5, dl=0.4)
            put(music, pluck([note(n_ + KEY)], ln * S16 + 0.3, 1.0), at, 0.22, rv=0.4)
        L_ = len(outro) - int(END_CARD * SR)
        for c in range(2):
            seg = outro[int(END_CARD * SR):, c]
            outro[int(END_CARD * SR):, c] = lp_sweep(seg, lambda s: 900 + 9000 * np.exp(-s / 1.8)) * np.exp(-np.arange(L_) / SR / 3.6)

    # buses: reverb + dotted-8th ping-pong on the sends, sidechain on the tonal parts, the gaps, stutters
    for c in range(2):
        music[:, c] += signal.fftconvolve(revb[:, c], IR[:, c])[:N] * 0.9
    dly = lp(dlyb.T, 4200).T
    k_ = int(S16 * 3 * SR)
    for i in range(1, 6):
        if k_ * i >= N:
            break
        music[k_ * i:, i % 2] += dly[:N - k_ * i].sum(1) * 0.5 * 0.42 ** (i - 1)
    music *= side[:, None] ** 0.9
    music += drums + outro
    music *= gate[:, None]
    for ts in META.get("stutter", []):                        # beat-repeat into a cut: 8ths, 16ths, 32nds
        i0 = int(ts * SR)
        L8 = int(2 * S16 * SR)
        src = music[i0:i0 + L8].copy()
        pos, lens = i0, [1, 1, 0.5, 0.5, 0.25, 0.25, 0.25, 0.25]   # one beat
        for q, ln in enumerate(lens):
            L = int(ln * S16 * SR)
            seg = src[:L].copy()
            f = min(96, L // 4)
            seg[:f] *= np.linspace(0, 1, f)[:, None]
            seg[-f:] *= np.linspace(1, 0, f)[:, None]
            if pos + L > N:
                break
            music[pos:pos + L] = seg * (0.8 + 0.2 * q / len(lens))
            pos += L
    music = hp(music.T, 32, 4).T                               # nothing a phone can't play anyway
    music += 0.45 * hp(music.T, 3000).T                        # presence: about +3 dB above 3 kHz
    music /= np.abs(music).max() + 1e-9
    music = limit(music * 1.7, 0.92)
    # the drops hit harder than what leads into them
    lvl = {"intro": 0.78, "build": 0.8, "drop": 0.95, "drop2": 1.0, "end": 0.95}
    tt = np.arange(0, DUR, 0.01)
    e = np.array([lvl[section(x)] for x in tt])
    if BUILD and DROP2 and STYLE == "pulse":                   # the build itself climbs back up
        m = (tt >= BUILD + BAR_) & (tt < DROP2)
        e[m] = 0.8 + 0.15 * (tt[m] - BUILD - BAR_) / BAR_
    e = np.convolve(e, np.ones(4) / 4, mode="same")
    music *= np.interp(np.arange(N) / SR, tt, e)[:, None] * 0.9

else:
    # ---------------- calm: warm electric piano in D major, soft drums, bell motif
    CH = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 71]]   # Dmaj7 Bm7 Gmaj7 Aadd9
    RT = [50, 47, 43, 45]
    MOTIF = [[74, 78, 81, 78], [76, 74, 71, 74], [74, 78, 83, 81], [81, 78, 76, 74]]
    KEY = META.get("key", 0)                     # transpose the whole calm arrangement (semitones)
    CH = [[n + KEY for n in c] for c in CH]
    RT = [n + KEY for n in RT]
    MOTIF = [[n + KEY for n in m] for m in MOTIF]
    side = np.ones(N)
    # intro: chord + pad + bells, no drums
    for b in range(max(1, round(DROP / BAR))):
        ch = CH[b % 4]
        place(music, reverb(epiano([note(n) for n in ch], BAR + 0.6, 0.7), 0.4), b * BAR, 0.8)
        place(music, reverb(pad([note(n - 12) for n in ch], BAR + 0.4, 700 + 500 * b), 0.4), b * BAR, 0.5)
        for k, n in enumerate(MOTIF[b % 4]):
            place(music, reverb(bell(note(n)), 0.5), b * BAR + (0.5 + k * 0.75) * BEAT, 0.3, pan=-0.3 + 0.2 * k)
    n_bars = int(np.ceil((END_CARD - DROP) / BAR))
    for b in range(n_bars):
        t0 = DROP + b * BAR
        ch = CH[b % 4]
        d = min(BAR, END_CARD - t0)
        # keys: beat 1 (long), the "and" of 2, a short touch on 4
        for rb, dur, g in ((0, 2.2, 0.85), (1.5, 1.4, 0.55), (3.0, 0.9, 0.45)):
            tp = t0 + rb * BEAT
            if tp < END_CARD:
                place(music, reverb(epiano([note(n) for n in ch], min(dur * BEAT + 0.4, END_CARD - tp + 0.4), 1.0 + 0.2 * (rb == 0)), 0.32), tp, g)
        place(music, reverb(pad([note(n - 12) for n in ch], d + 0.3, 1100), 0.35), t0, 0.24)
        # bass: root, root on the "and" of 2, fifth on 4
        for rb, off, dur in ((0, 0, 1.4), (1.5, 0, 0.9), (3.0, 7, 0.8)):
            tp = t0 + rb * BEAT
            if tp < END_CARD:
                place(music, bass(note(RT[b % 4] + off), dur * BEAT), tp, 0.65)
        # drums: soft kick 1 & 3, rim 2 & 4, swung shaker eighths
        for beat in range(4):
            tb = t0 + beat * BEAT
            if tb >= END_CARD:
                break
            if beat in (0, 2):
                place(kicks, soft_kick(), tb, 0.8)
                i = int(tb * SR)
                dk = int(0.3 * SR)
                side[i:i + dk] = np.minimum(side[i:i + dk], 1 - 0.28 * np.exp(-np.arange(min(dk, N - i)) / SR / 0.12))
            if beat in (1, 3):
                place(music, reverb(rim(), 0.35), tb, 0.45, pan=0.15)
            for h, sw in ((0, 0.0), (1, 0.58)):
                th = tb + sw * BEAT
                if th < END_CARD:
                    place(music, shaker(), th, 0.7 if h else 0.42, pan=0.35)
        # bell motif every other bar
        if b % 2 == 1:
            for k, n in enumerate(MOTIF[(b // 2) % 4]):
                tp = t0 + (0.5 + k * 0.75) * BEAT
                if tp < END_CARD:
                    place(music, reverb(bell(note(n)), 0.5), tp, 0.3, pan=-0.3 + 0.2 * k)
    music *= side[:, None]
    music += kicks
    # end card: Dmaj9 rings out with a slow bell arpeggio
    fin = [note(n + KEY) for n in (50, 62, 66, 69, 73, 76)]
    place(music, reverb(epiano(fin, 5.0, 1.0), 0.5), END_CARD + 0.4, 1.0)
    place(music, reverb(pad([note(n + KEY) for n in (50, 57, 62, 66, 69)], 5.0, 1800), 0.5), END_CARD + 0.4, 0.8)
    for k, n in enumerate((74, 78, 81, 85, 86)):
        place(music, reverb(bell(note(n + KEY), 1.8), 0.55), END_CARD + 0.9 + k * 0.38, 0.22 * 0.9 ** k, pan=-0.4 + 0.2 * k)
    place(music, bass(note(38 + KEY), 2.4) * np.exp(-t_(2.4) / 1.0)[:, None].ravel(), END_CARD + 0.42, 0.8)

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
    f0 = 52 if STYLE in ("pulse", "liquid") else 38           # the new beds: tuned up so phones can play it
    ph = np.cumsum(f0 + 60 * np.exp(-t / 0.08)) / SR
    boom = (np.sin(2 * np.pi * ph) + (0.35 * np.sin(4 * np.pi * ph) if f0 > 40 else 0)) * env_exp(d, 0.55 if not soft else 0.8, 0.002)
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


SFX_ONLY = META.get("sfxOnly")         # with generated music: keep only the quiet, functional cues
for c in cues["cues"]:
    k, at, g = c["type"], c["t"], c.get("gain", 0.5)
    if SFX_ONLY and k not in SFX_ONLY:
        continue
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
    elif k == "crash":                       # cymbal on a section change
        d = 1.8
        tc = t_(d)
        x = hp(rng.standard_normal(len(tc)), 4500, 2) * env_exp(d, 0.55, 0.001)
        x += sum(np.sin(2 * np.pi * f * tc) for f in (3150, 4420, 5830)) * env_exp(d, 0.4, 0.001) * 0.04
        place(sfx, reverb(x, 0.35), at, g * 0.5, pan)
    elif k == "fill":                        # snare 16ths into a section change, rising
        n_ = c.get("n", 4)
        step = c.get("step", BEAT / 4)
        for i in range(n_):
            d = 0.25
            tc = t_(d)
            s = bp(rng.standard_normal(len(tc)), 1300 + 250 * i, 9000) * env_exp(d, 0.07, 0.0008)
            s += np.sin(2 * np.pi * (200 + 30 * i) * tc) * env_exp(d, 0.05, 0.001) * 0.6
            place(sfx, s, at + i * step, g * (0.45 + 0.55 * i / max(1, n_ - 1)) * 0.5)

# ------------------------------------------------------------------ mix + master
mix = music * 0.62 + sfx * 0.9 * META.get("sfxGain", 1.0)
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
