#!/bin/bash

b=false
B=false
n=5
v=
i=

while getopts "bBhin:v" opt; do
	case "$opt" in 
		h)
			printf "Compila todo el html de /pages y /template* a /output

IMPORTANTE
Este script: 
- Sobreescribe /pages/boletines/*/config.cfg a partir de /configs/es.cfg 
- Sobreescribe /pages/boletines/*/seccion.html
- Sobreescribe /pages/boletin.html
- Crea o elimina directorios en /pages/boletines según necesite.
- Añade el número de sección automáticamente a /pages/boletines/*/config.cfg 
a partir del nombre del directorio

OPCIONES:
\t-b: Sólo actualiza /pages/boletín.html. No compila /pages/{*,{articulos,en,fr,pt}/*}.cfg
\t-B: Evita actualizar /pages/boletin.html. Compila /pages/{*,{articulos,en,fr,pt}/*}.cfg
\t-h: Muestra este mensaje
\t-n: Que haya n boletines por cada sección de /pages/boletin.html (por defecto 5). 
\t-v: Modo verboso
\t-i: Pregunta antes de eliminar un archivo/directorio
"
			exit
			;;
		b)
			b=true
			;;
		B)
			B=true
			;;
		i)
			i="-i"
			;;
		n)
			n=$OPTARG
			;;
		v)
			v="-v"
			;;
	esac
done

# prepara y compila /pages/boletin.html
if ! $B; then
	boletines=($(printf '%s\n' pages/boletines/*/laudate*.cfg | sort -t '-' -k2Vr))
	# reorganiza para que haya n boletines por sección
	d=0
	for ((i=0; i<${#boletines[@]}; i+=$n)); do
		((d++))
		mkdir -p $v pages/boletines/$d
		for e in ${boletines[@]:i:$n}; do
			mv $v $e ${e%%.*}.html pages/boletines/$d 2>/dev/null
		done
		cp $v configs/es.cfg pages/boletines/$d/config.cfg
		printf "pagina = $d" >> pages/boletines/$d/config.cfg
	done

	# elimina los directorios sobrantes en /pages/boletines 
	for dir in pages/boletines/*; do
		[ -d "$dir" ] || continue
		ls $dir | grep -q laudate || rm -rf $i $v $dir
	done

	# compila cada /pages/boletines/*/seccion.html y cada /output/laudate-*
	for dir in pages/boletines/*; do
		[ -d "$dir" ] || continue
		ls -rv $dir/laudate*.cfg | xargs saait -t templates/boletin -c $dir/config.cfg
		mv -f $v output/seccion.html $dir
	done

	# compila pages/boletin.html
	cat pages/boletines/header.html $(ls -v pages/boletines/*/seccion.html) pages/boletines/footer.html > pages/boletin.html

	# chapucilla
	sed -i 's/"${num_paginas}"/'"$d"'/' pages/boletin.html
fi

# compila los artículos:
$b || saait -t templates/default -c configs/es.cfg -o output/articulos pages/articulos/*.cfg 
# compila los distintos idiomas:
shopt -s extglob
$b || saait -t templates/default -c configs/pt.cfg -o output/pt pages/pt/*.cfg
$b || saait -t templates/default -c configs/en.cfg -o output/en pages/en/*.cfg
$b || saait -t templates/default -c configs/fr.cfg -o output/fr pages/fr/*.cfg
# compila el resto:
$b || saait -t templates/default -c configs/es.cfg pages/*.cfg
