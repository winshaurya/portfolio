param(
  [string]$OutDir = "public/videos",
  [string]$HlsUrl = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8"
)

if (!(Test-Path $OutDir)) {
  Write-Output "Creating directory $OutDir"
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$hd = Join-Path $OutDir "bg-hd.mp4"
$blur = Join-Path $OutDir "bg-blur.mp4"
$poster = Join-Path $OutDir "bg-poster.jpg"

Write-Output "Downloading HLS stream to $hd (requires ffmpeg installed and on PATH)..."
ffmpeg -y -i $HlsUrl -c copy $hd

Write-Output "Creating low-res blurred version $blur ..."
ffmpeg -y -i $hd -vf "scale=iw/6:ih/6,boxblur=10:1,scale=iw:ih" -c:v libx264 -crf 28 -preset veryfast $blur

Write-Output "Creating poster image $poster ..."
ffmpeg -y -i $hd -ss 00:00:00 -vframes 1 $poster

Write-Output "Done. Files created in $OutDir"
