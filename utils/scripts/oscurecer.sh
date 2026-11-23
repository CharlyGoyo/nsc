#!/bin/sh

a=0.375
d=-dark
o=.
r=0
g=0
b=0

while getopts "r:g:b:a:d:ho:" opt; do
	case "$opt" in 
		r)
			r=$OPTARG
			;;
		g)
			g=$OPTARG
			;;
		b)
			b=$OPTARG
			;;
		a)
			a=$OPTARG
			;;
		d)
			d=$OPTARG
			;;
		h)
			printf "Pinta un cuadrado (por defecto oscuro) sobre la(s) imagen(es) que le pases como argumento.
Échale un vistazo a /utils/imagenes_oscurecidas.sh

OPCIONES:
\t-r: Valor r. Por defecto es 0.
\t-g: Valor g. Por defecto es 0.
\t-b: Valor b. Por defecto es 0.
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
	magick $arg -fill "rgba($r, $g, $b, $a)" -draw "rectangle 0,0 %[w],%[h]" "${o}/${name}${d}.${ext}" 
done
