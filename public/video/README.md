# Brand video assets

`FINAL1.mov` is the master (1920×1080, 24 fps, 100 s, ~273 MB, H.264 + PCM audio). It is
**gitignored** — never commit or deploy it; anything under `public/` is served verbatim.

The web renditions below are what the site loads. The 24-bit PCM audio is re-encoded (AAC in
MP4, Opus in WebM) so viewers can unmute from the controls — the section still starts muted,
because that is the only autoplay browsers allow. Subtitle and timecode tracks are dropped,
and every MP4 is `+faststart` so playback can begin before the download finishes.

| File | Size | Used by |
| --- | --- | --- |
| `brand-video-720.webm` | 12 MB | phones, AV1-capable browsers |
| `brand-video-720.mp4` | 18 MB | phones, fallback |
| `brand-video-1080.webm` | 20 MB | desktop, AV1-capable browsers |
| `brand-video-1080.mp4` | 37 MB | desktop, fallback (Safari) |
| `brand-video-poster.jpg` | 54 KB | poster frame, grabbed at 2 s (frame 0 is black) |

Regenerate after replacing the master:

```sh
cd public/video

# 1080p H.264 + AAC fallback
ffmpeg -y -i FINAL1.mov -sn -dn -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 -pix_fmt yuv420p -g 48 \
  -c:a aac -b:a 128k -ac 2 -ar 48000 -write_tmcd 0 -movflags +faststart \
  brand-video-1080.mp4

# 720p H.264 + AAC fallback
ffmpeg -y -i FINAL1.mov -sn -dn -map 0:v:0 -map 0:a:0 -vf scale=1280:720:flags=lanczos \
  -c:v libx264 -preset slow -crf 25 -profile:v main -level 3.1 -pix_fmt yuv420p -g 48 \
  -c:a aac -b:a 128k -ac 2 -ar 48000 -write_tmcd 0 -movflags +faststart \
  brand-video-720.mp4

# AV1 + Opus renditions — about half the bytes of H.264
ffmpeg -y -i FINAL1.mov -sn -dn -map 0:v:0 -map 0:a:0 \
  -c:v libsvtav1 -preset 6 -crf 34 -g 48 -pix_fmt yuv420p \
  -c:a libopus -b:a 96k -ac 2 brand-video-1080.webm

ffmpeg -y -i FINAL1.mov -sn -dn -map 0:v:0 -map 0:a:0 -vf scale=1280:720:flags=lanczos \
  -c:v libsvtav1 -preset 6 -crf 36 -g 48 -pix_fmt yuv420p \
  -c:a libopus -b:a 96k -ac 2 brand-video-720.webm

# Poster
ffmpeg -y -ss 2 -i FINAL1.mov -frames:v 1 -vf scale=1280:-2 -q:v 6 brand-video-poster.jpg
```

If the AV1 `level` changes (check with
`ffprobe -v error -select_streams v:0 -show_entries stream=level -of default=nw=1 <file>`),
update the `codecs="av01.0.<level>M.08"` strings in
`src/components/sections/video-section.tsx` — Safari relies on them to reject WebM it cannot
decode and fall through to the MP4.
