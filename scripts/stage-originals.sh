#!/usr/bin/env bash
# Stages the GitHub Pages copy of every tracked image in src/assets.
# Paths must match src/utils/originals.ts.
set -euo pipefail

out="${1:-_site}"
if [ -e "$out" ]; then
    echo "$out already exists" >&2
    exit 1
fi
mkdir -p "$out"

pngs="$(mktemp)"
git ls-files -z src/assets | while IFS= read -r -d '' src; do
    dest="$out/${src#src/assets/}"
    case "$src" in
        *.png | *.PNG)
            mkdir -p "$(dirname "$dest")"
            printf '%s\0%s\0' "$src" "${dest%.*}.webp" >> "$pngs"
            ;;
        *.jpg | *.jpeg | *.JPG | *.JPEG | *.webp)
            mkdir -p "$(dirname "$dest")"
            cp "$src" "$dest"
            ;;
    esac
done

# Lossless with the colour profile kept, so pixels match the PNG exactly.
xargs -0 -n 2 -P "$(getconf _NPROCESSORS_ONLN)" \
    sh -c 'cwebp -quiet -lossless -exact -metadata icc "$1" -o "$2"' _ < "$pngs"
rm "$pngs"
