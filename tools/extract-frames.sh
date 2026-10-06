#!/usr/bin/env bash
# Extract hero frames from a video for the scroll sequence.
# Usage: tools/extract-frames.sh path/to/video.mp4 [start_seconds] [end_seconds]
# Writes frames/frame_0001.webp… (≤1920px), frames/mobile/… (≤960px, fewer frames) and frames/manifest.json.
set -euo pipefail

video="${1:?Usage: tools/extract-frames.sh path/to/video.mp4 [start] [end]}"
start="${2:-0}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/frames"

end="${3:-$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")}"
duration=$(awk -v s="$start" -v e="$end" 'BEGIN { print e - s }')
# Aim for ~200 frames on desktop and ~100 on mobile, never above the source frame rate.
src_fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$video" | awk -F/ '{ print ($2 ? $1 / $2 : $1) }')
fps=$(awk -v d="$duration" -v m="$src_fps" 'BEGIN { f = 200 / d; if (f > m) f = m; printf "%.3f", f }')
mfps=$(awk -v d="$duration" -v m="$src_fps" 'BEGIN { f = 100 / d; if (f > m) f = m; printf "%.3f", f }')

rm -rf "$out"
mkdir -p "$out/mobile"
ffmpeg -v error -ss "$start" -to "$end" -i "$video" -vf "fps=$fps,scale='min(1920,iw)':-2" -c:v libwebp -quality 80 "$out/frame_%04d.webp"
ffmpeg -v error -ss "$start" -to "$end" -i "$video" -vf "fps=$mfps,scale='min(960,iw)':-2" -c:v libwebp -quality 75 "$out/mobile/frame_%04d.webp"

count=$(ls "$out"/frame_*.webp | wc -l)
mcount=$(ls "$out"/mobile/frame_*.webp | wc -l)
printf '{ "count": %d, "mobile": true, "mobileCount": %d, "ext": "webp" }\n' "$count" "$mcount" > "$out/manifest.json"
echo "Desktop frames: $count, mobile frames: $mcount"
