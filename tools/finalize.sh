#!/usr/bin/env bash
# Join rendered segments, add film grain + a touch of sharpening, mux the soundtrack.
#   bash tools/finalize.sh [master.mp4] [out-dir]  -> master (~14 Mbps) + *_preview.mp4 (~22 MB, for chats)
#   MAXRATE=9 caps the master (Mbps) so long 9:16 cuts stay well under GitHub's 100 MB file limit
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-out/incpt_wallet_reel.mp4}
D=${2:-out}
MR=${MAXRATE:-14}
ffmpeg -v error -y -f concat -safe 0 -i "$D/seg/list.txt" -i "$D/soundtrack.wav" \
  -vf "unsharp=5:5:0.35:5:5:0,noise=c0s=4:c0f=t,format=yuv420p" \
  -c:v libx264 -preset slow -crf 19 -maxrate ${MR}M -bufsize $((MR * 2))M -profile:v high -level 4.2 -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT"
# preview: aim for ~22 MB whatever the length (chat uploads cap at 30 MB)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
VB=$(python3 -c "print(min(6500, int(22 * 8192 / $DUR) - 260))")
ffmpeg -v error -y -i "$OUT" -c:v libx264 -preset slow -b:v ${VB}k -maxrate $((VB * 115 / 100))k -bufsize $((VB * 2))k -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a copy -movflags +faststart "${OUT%.mp4}_preview.mp4"
for f in "$OUT" "${OUT%.mp4}_preview.mp4"; do
  echo "$f"; ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$f"
done
