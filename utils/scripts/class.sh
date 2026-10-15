#!/bin/sh

c=false
f='pages/*.html templates/page/*.html' 
i=class
I=false
l=false

while getopts "cf:hiIl" opt; do
	case "$opt" in 
		c)
			c=true
			;;
		f)
			f=$OPTARG
			;;
		h)
			printf "USO: class [opciones] argumentos (por defecto interpretados como clases)
POR DEFECTO: Muestra los archivos que contienen la clase argumento

OPCIONES:
\t-c: devuelve el número de veces que se usa la clase argumento.
\t-f: archivo en el que buscar. Por defecto en todos estos:
\tpages/*.html
\ttemplates/page/*.html 
\ttemplate-boletin/seccion.html/*.html
\t-h: muestra este mensaje.
\t-i: interpreta como id lo que se interpretaba como clase
\t-l: devuelve todas las clases (o ids si es usa -i) en uso del elemento argumento
\t-I: devuelve todas las ids asociadas a la clase argumento
"
			exit
			;;
		i)
			i=id
			;;
		I)
			I=true
			;;
		l)
			l=true
			;;
	esac
done

shift $((OPTIND - 1))
[ "$#" -gt 1 ] && masdeuno=true || masdeuno=false

for arg in "$@"
do
	if $l; then
		grep -Eoh "$i=\"${arg}[0-9]+\"" $f | cut -d '"' -f 2 | sort -Vu
	elif $c; then
		$masdeuno && printf '%s:\t' $arg
		grep -ch "$i=\"${arg}\"" $f | awk '{s+=$0} END {print s}'
	elif $I; then
		$masdeuno && printf 'n\t%s:\n' $arg 
		grep -Eh "$i=\"${arg}\"" $f | grep -Eo 'id=".*"' | cut -d '"' -f 2 | sort -Vu
	else
		$masdeuno && printf '\t%s:\n' $arg
		grep -ln "$i=\"${arg}\"" $f 
	fi
done
