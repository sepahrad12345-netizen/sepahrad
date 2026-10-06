#!/usr/bin/env bash
# Extract hero frames from a video for the scroll sequence.
# Usage: tools/extract-frames.sh path/to/video.mp4
# Writes frames/frame_0001.webp… (≤1920px), frames/mobile/… (≤1280px, fewer frames) and frames/manifest.json.
set -euo pipefail

video="${1:?Usage: tools/extract-frames.sh path/to/video.mp4}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/frames"

duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")
# Aim for ~200 frames on desktop and ~120 on mobile.
fps=$(awk -v d="$duration" 'BEGIN { f = 200 / d; if (f > 30) f = 30; printf "%.3f", f }')
mfps=$(awk -v d="$duration" 'BEGIN { f = 120 / d; if (f > 30) f = 30; printf "%.3f", f }')

rm -rf "$out"
mkdir -p "$out/mobile"
ffmpeg -v error -i "$video" -vf "fps=$fps,scale='min(1920,iw)':-2" -c:v libwebp -quality 80 "$out/frame_%04d.webp"
ffmpeg -v error -i "$video" -vf "fps=$mfps,scale='min(1280,iw)':-2" -c:v libwebp -quality 75 "$out/mobile/frame_%04d.webp"

count=$(ls "$out"/frame_*.webp | wc -l)
mcount=$(ls "$out"/mobile/frame_*.webp | wc -l)
printf '{ "count": %d, "mobile": true, "mobileCount": %d, "ext": "webp" }\n' "$count" "$mcount" > "$out/manifest.json"
echo "Desktop frames: $count, mobile frames: $mcount"
