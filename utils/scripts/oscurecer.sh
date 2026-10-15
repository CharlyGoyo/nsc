#!/bin/sh

a=0.375

while getopts "a:h" opt; do
	case "$opt" in 
		a)
			a=$OPTARG
			;;
		h)
			printf "Oscurece imágenes. Por defecto el valor del alfa de 0.375"
	esac
done
shift $((OPTIND - 1))

for arg in "$@"; do
	filename=$(basename -- "$arg")
	name="${filename%.*}"
	ext="${filename##*.}"
	magick $arg -fill "rgba(0, 0, 0, $a)" -draw "rectangle 0,0 %[w],%[h]" "${name}-dark.${ext}"
done
