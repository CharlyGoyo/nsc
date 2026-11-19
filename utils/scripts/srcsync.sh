#!/bin/bash
while getopts "h" opt; do
	case "$opt" in
		h)
			printf "Comprueba si los recursos enlazados en un documento html/css existen en local.
Si no existen, los descarga de nscristiandad.es/wp-content (conservando la ruta)
Los mete en output/pages-content

USO:
srcsync [opciones] [archivos]

OPCIONES:
-h: muestra este mensaje y finaliza.
"
			exit
			;;
	esac
done

descargar=()
for arg in "$@"; do
	case "${arg,,}" in
        *.html|*.htm)
			resources=$(xmllint --html --xpath '//*[@src]/@src' $arg 2>/dev/null | 
				sed -En 's/ *src="(\/pages-content)([^"]*)"/\1\2/p';
			xmllint --html --xpath '//*[@data-galeria-img]/@data-galeria-img' $arg 2>/dev/null |
				sed -En 's/ *data-galeria-img="(\/pages-content)([^"]*)"/\1\2/p';
			xmllint --html --xpath '//*[@srcset]/@srcset' $arg 2>/dev/null | cut -d '"' -f 2 | tr -s ' ' '\n' |
				sed -En 's/(\/pages-content)(.*)/\1\2/p')
            ;;
        *.css)
			resources=$(sed -En "s/.*(\/pages-content)([^']*)'.*/\1\2/p" $arg)
            ;;
        *)
            echo "Tipo de archivo no soportado: $arg" >&2
            ;;
    esac

	for resource in $resources; do
		if [[ $resource =~ (/pages-content)/uploads/.* ]]; then
			trim="/uploads/${resource#*/uploads/}"
		elif [[ $resource =~ (/pages-content)/extra/.* ]]; then
			trim="/extra/${resource#*/extra/}"
		fi
		[ -f output/pages-content$trim ] || descargar+=(https://nscristiandad.es/wp-content$trim)
	done

done

printf '%s\n' ${descargar[@]}
read -r -p "¿Descargar? [y/N]: " resp
[[ "$resp" =~ ^[Yy]$ ]] && xargs wget -x -nH --cut-dirs=1 -P output/pages-content <<< ${descargar[@]}
