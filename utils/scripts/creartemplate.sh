#!/usr/bin/env bash

p=""
t=""

while getopts "hp:t:" opt; do
	case "$opt" in
		p) p="$OPTARG" 
			;;
		t) t="$OPTARG" 
			;;
		h) printf 'Inserta el contenido de un archivo html en una plantilla en json
			
USO: createtemplate.sh -p PLANTILLA -t TEXTO ARCHIVO.html 

\t-p PLANTILLA: ruta al archivo json de la plantilla (por defecto mail/json/ARCHIVO.json)
\t-t TEXTO: versión en texto plano (Text, opcional)
\t-h muestra este mensaje
'
			exit
			;;
	esac
done

TMP_JSON="$(mktemp)"
trap 'rm -f "$TMP_JSON"' EXIT

shift $((OPTIND - 1))
if [[ -z "$p" ]]; then
	base_name="$(basename "$1")"
	p="mail/json/${base_name%.*}.json"
fi

jq \
	--rawfile html "$1" \
	--arg text "$t" \
	'
(.TemplateContent) |= (.Html = $html | if $text != "" then .Text = $text else . end)
	' "$p" > "$TMP_JSON"

mv "$TMP_JSON" "$p"
