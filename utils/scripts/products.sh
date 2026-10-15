#!/bin/sh

f=utils/stripe/products.json
i=false
I=false
p=false
y=false

name=true

while getopts "f:hiIpy" opt; do
	case "$opt" in 
		f)
			f=$OPTARG
			;;
		h)
			printf "Para gestionar los productos de stripe en local. Requiere stripe-cli.
Por defecto la lista de productos local es utils/stripe/products.json

OPCIONES:
\t-f: usa [argumento] como lista de productos local
\t-h: muestra este mensaje.
\t-i: devuelve la id de un producto seleccionado con fzf
\t-I: como -i pero redirige el output a xclip -selection clipboard
\t-p: actualiza la lista de productos real a partir la local
\t-y: copia la lista de productos real a la local
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
	name=$(jq -r '.data[].name' $f | fzf -m)
fi

$i && jq -r --arg name "$name" '.data[] | select(.name == $name) | .id' $f
$I && jq -r --arg name "$name" '.data[] | select(.name == $name) | .id' $f | xclip -selection clipboard
$y && stripe --color off products list > $f
