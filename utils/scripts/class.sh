#!/bin/bash

shopt -s extglob
c=false
[ -z "$HTML_EDITABLES" ] && source utils/scripts/env.sh ""
f=$HTML_EDITABLES
e=false
i=class
I=false
l=false

while getopts "acef:hiIl" opt; do
	case "$opt" in 
		a)
			f=$EDITABLES_NO_ARTICULOS
			;;
		c)
			c=true
			;;
		e)
			e=true
			;;
		f)
			f=$OPTARG
			;;
		h)
			printf "USO: class [opciones] argumentos (por defecto interpretados como clases)
POR DEFECTO: Muestra los archivos que contienen la clase argumento

OPCIONES:
\t-a: busca en \$EDITABLES_NO_ARTICULOS
\t-c: devuelve el número de veces que se usa la clase argumento.
\t-e: interpreta como argumento lo que se interpretaba como clase.
Devuelve todos los elementos de ese tipo que no tienen clase ni id.
\t-f ARCHIVO: archivo(s) donde buscar. Por defecto busca en \$HTML_EDITABLES
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

f="$f $a"

shift $((OPTIND - 1))
[ "$#" -gt 1 ] && masdeuno=true || masdeuno=false

for arg in "$@"
do
	$masdeuno && printf '+ %s:\n' $arg
	if $l; then
		xmllint --html --xpath "//${arg}/@${i}" $f 2>/dev/null | sed -En 's/[^"]*"([^"]*)"[^"]*/\1/p' | sort -Vu
	elif $c; then
		xmllint --html --xpath "count(//*[@${i}='${arg}'])" $f 2>/dev/null | awk '{s+=$0} END {print s}'
	elif $I; then
		xmllint --html --xpath "//*[@class='${arg}']/@id" $f 2>/dev/null | sed -En 's/[^"]*"([^"]*)".*/\1/p' | sort -Vu
	elif $e; then
		for file in $f; do
			xmllint --html --xpath "//${arg}[not(@class) and not(@id)]" $file >/dev/null 2>&1 && printf '%s\n' "$file"
		done
	else
		for file in $f; do
			xmllint --html --xpath "//*[@${i}='${arg}']" "$file" >/dev/null 2>&1 && printf '%s\n' "$file"
		done
	fi
done
