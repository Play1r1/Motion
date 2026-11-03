"""Cut a soundtrack from generated music: pieces of the source placed on the reel's beat grid.

    python3 tools/music_edit.py <edit.json> <out.wav>

edit.json: {"duration": 26.0, "fade_out": 0.8, "pieces": [{"src": "a.wav", "from": 0.07, "to": 4.07,
            "at": 0.0, "stretch": 1.0, "gain_db": 0}, ...]}
Each piece is time-stretched (pitch kept, via ffmpeg atempo) by `stretch` (reel seconds per source
second), placed at `at` and joined with 25 ms equal-power crossfades; the last piece rings out.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile

SR = 48000
cfg = json.load(open(sys.argv[1]))
base = os.path.dirname(os.path.abspath(sys.argv[1]))
N = int(cfg["duration"] * SR)
out = np.zeros((N, 2))
X = int(0.025 * SR)
for k, p in enumerate(cfg["pieces"]):
    src = os.path.join(base, p["src"])
    st = p.get("stretch", 1.0)
    pre = X / SR                                 # a little extra on both sides for the crossfades
    a = max(0.0, p["from"] - pre)
    b = p["to"] + (pre if k < len(cfg["pieces"]) - 1 else 0)
    with tempfile.TemporaryDirectory() as d:
        o = os.path.join(d, "p.wav")
        af = [f"atrim={a:.4f}:{b:.4f}", "asetpts=PTS-STARTPTS"]
        if abs(st - 1) > 1e-4:
            af.append(f"atempo={1 / st:.6f}")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", ",".join(af), "-ar", str(SR), "-ac", "2", "-c:a", "pcm_f32le", o], check=True)
        sr, x = wavfile.read(o)
    x = x.astype(np.float64) * 10 ** (p.get("gain_db", 0) / 20)
    lead = int((p["from"] - a) * st * SR)       # samples of pre-roll before the piece's start
    i0 = int(p["at"] * SR) - lead
    if i0 < 0:
        x, i0 = x[-i0:], 0
    env = np.ones(len(x))
    if k > 0:                                    # fade in over the crossfade window (centred on the cut)
        f = np.arange(min(2 * lead, len(x))) / max(1, 2 * lead)
        env[:len(f)] = np.sin(f * np.pi / 2)
    if k < len(cfg["pieces"]) - 1:
        tail = int(pre * st * SR)
        f = np.arange(2 * tail) / (2 * tail)
        env[-2 * tail:] = np.minimum(env[-2 * tail:], np.cos(f * np.pi / 2))
    j = min(N, i0 + len(x))
    out[i0:j] += (x * env[:, None])[: j - i0]
fo = int(cfg.get("fade_out", 0.8) * SR)
out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
out /= max(1e-9, np.abs(out).max()) / 0.89      # -1 dBFS
wavfile.write(sys.argv[2], SR, out.astype(np.float32))
print("music", sys.argv[2], f"{cfg['duration']:.2f}s", len(cfg["pieces"]), "pieces")
