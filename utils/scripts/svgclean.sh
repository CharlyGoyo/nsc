#!/bin/sh
while getopts "h" opt; do
	case "$opt" in
		h)
			printf 'Arregla svgs que vienen con la bounding-box deformada y les reduce el tamaño 
'
			exit
			;;
	esac
done

for arg in "$@"; do
	cleansvg=$(inkscape $arg --export-area-drawing --export-plain-svg -o - | usvg - -c | 
		sed ' s/ id="[^"]*"//g; s/ stroke="[^"]*"//g; s/ fill="[^"]*"//g;' |
		awk '
	/width="[0-9.]+"/ && /height="[0-9.]+"/ {
			w = $0; sub(/.*width="/, "", w); sub(/".*/, "", w)
			h = $0; sub(/.*height="/, "", h); sub(/".*/, "", h)

			sub(/ width="[0-9.]+"/, "")
			sub(/height="[0-9.]+"/, "viewBox=\"0 0 " w " " h "\"")
		}
	{ print }
	')
	echo $cleansvg > $arg
done
