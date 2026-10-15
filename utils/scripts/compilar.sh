#!/bin/sh

b=false
B=false
n=5
v=
i=

while getopts "bBhin:v" opt; do
	case "$opt" in 
		h)
			printf "Compila todo el html a /output

IMPORTANTE
Este script: 
- Sobreescribe /pages/boletines/*/config.cfg a partir de /config.cfg 
- Sobreescribe /pages/boletines/*/seccion.html
- Sobreescribe /pages/boletin.html
- Crea o elimina directorios en /pages/boletines según necesite.
- Añade el número de sección automáticamente a /pages/boletines/*/config.cfg 
a partir del nombre del directorio

OPCIONES:
\t-b: Sólo actualiza /pages/boletín.html. No compila /pages/*.cfg
\t-B: Evita actualizar /pages/boletin.html. Compila /pages/*.cfg
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

if ! $B; then
	# reorganiza para que haya n boletines por sección
	boletines=($(printf '%s\n' pages/boletines/*/laudate*.cfg | sort -t '-' -k2Vr))
	d=0
	for ((i=0; i<${#boletines[@]}; i+=$n)); do
		((d++))
		mkdir -p $v pages/boletines/$d
		for e in ${boletines[@]:i:$n}; do
			mv $v $e ${e%%.*}.html pages/boletines/$d 2>/dev/null
		done
		cp $v config.cfg pages/boletines/$d/config.cfg
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
		ls -rv $dir/laudate*.cfg | xargs saait -t template-boletin -c $dir/config.cfg
		mv -f $v output/seccion.html $dir
	done

	# compila pages/boletin.html
	cat pages/boletines/header.html $(ls -v pages/boletines/*/seccion.html) pages/boletines/footer.html > pages/boletin.html
	sed -i 's/"${num_paginas}"/'"$d"'/' pages/boletin.html
fi

# compila el resto
$b || saait pages/*.cfg
