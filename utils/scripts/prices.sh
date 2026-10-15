#!/bin/sh
f=utils/stripe/prices.json
i=false
I=false
p=false
y=false

name=true

while getopts "f:hiIp:y" opt; do
	case "$opt" in 
		f)
			f=$OPTARG
			;;
		h)
			printf "Para gestionar los precios de stripe en local. Requiere stripe-cli.
Por defecto la lista de precios local es utils/stripe/prices.json

OPCIONES:
\t-f: usa [argumento] como lista de precios local
\t-h: muestra este mensaje.
\t-i: devuelve la id de un producto seleccionado con fzf
\t-I: como -i pero redirige el output a xclip -selection clipboard
\t-p: actualiza una de las siguientes claves de la lista de precios real a partir la local:
active
currency-options
lookup-key
nickname
tax-behavior
transfer-lookup-key
\t-y: copia la lista de precios real a la local
"
			exit
			;;
		i)
			i=true
			name=
			;;
		I)
			I=true
			name=
			;;
		p)
			key=$OPTARG
			p=true
			y=false
			;;
		y)
			p=false
			y=true
			;;
	esac
done

if [[ -z ${name} ]]; then
	name=$(jq -r '.data[] | "\(.id)\t\(.lookup_key)\t\(.unit_amount)"' $f | fzf -m | cut -f1)
fi

$i && echo $name
$I && echo $name | xclip -selection clipboard
$y && stripe --color off prices list > $f
$p && 
	for id in $(jq -r '.data[].id' $f); do
		stripe prices update $id --$key="$(jq -Mr --arg id $id --arg param $(echo $key | sed 's/-/_/') '.data[] | select(.id == $id) | .[$param]' $f)"
	done
