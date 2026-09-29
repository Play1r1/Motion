#!/usr/bin/env bash
# Join rendered segments, add film grain + a touch of sharpening, mux the soundtrack.
#   bash tools/finalize.sh [master.mp4] [out-dir]  -> master (~14 Mbps) + *_preview.mp4 (~6.5 Mbps, < 25 MB, for chats)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-out/incpt_wallet_reel.mp4}
D=${2:-out}
ffmpeg -v error -y -f concat -safe 0 -i "$D/seg/list.txt" -i "$D/soundtrack.wav" \
  -vf "unsharp=5:5:0.35:5:5:0,noise=c0s=4:c0f=t,format=yuv420p" \
  -c:v libx264 -preset slow -crf 19 -maxrate 14M -bufsize 28M -profile:v high -level 4.2 -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT"
ffmpeg -v error -y -i "$OUT" -c:v libx264 -preset slow -b:v 6500k -maxrate 7500k -bufsize 15M -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a copy -movflags +faststart "${OUT%.mp4}_preview.mp4"
for f in "$OUT" "${OUT%.mp4}_preview.mp4"; do
  echo "$f"; ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$f"
done
