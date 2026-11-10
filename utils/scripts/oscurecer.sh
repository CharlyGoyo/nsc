#!/bin/sh

a=0.375
d=-dark
o=

while getopts "a:d:ho:" opt; do
	case "$opt" in 
		a)
			a=$OPTARG
			;;
		d)
			d=$OPTARG
			;;
		h)
			printf "Oscurece la imagen que le pases como argumento. 
Échale un vistazo a /utils/imagenes_oscurecidas.sh

OPCIONES:
\t-a: Valor del alfa. Por defecto es 0.375.
\t-d: cadena que se añade al nombre del archivo. Por defecto \"-dark\"
\t-o: Directorio de salida. Por defecto el actual.
"
			exit
			;;
		o)
			o=$OPTARG
			;;
	esac
done
shift $((OPTIND - 1))

for arg in "$@"; do
	filename=$(basename -- "$arg")
	name="${filename%.*}"
	ext="${filename##*.}"
	magick $arg -fill "rgba(0, 0, 0, $a)" -draw "rectangle 0,0 %[w],%[h]" "${o}/${name}${d}.${ext}" 
done
