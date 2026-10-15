#!/bin/sh
for arg in "$@"; do
	inkscape $arg --export-area-drawing --export-plain-svg -o - | usvg - -c | 
		sed ' s/ id="[^"]*"//g; s/ stroke="[^"]*"//g; s/ fill="[^"]*"//g;' |
		awk '
	/width="[0-9.]+"/ && /height="[0-9.]+"/ {
			w = $0; sub(/.*width="/, "", w); sub(/".*/, "", w)
			h = $0; sub(/.*height="/, "", h); sub(/".*/, "", h)

			sub(/ width="[0-9.]+"/, "")
			sub(/height="[0-9.]+"/, "viewBox=\"0 0 " w " " h "\"")
		}
	{ print }
	'
done
