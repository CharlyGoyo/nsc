#!/bin/bash

while getopts "h" opt; do
	case "$opt" in
		h)
			printf 'Script rudimentario para descargar y parsear páginas de la web original.
Es más una colección de comandos útiles que un script.
Está pensado para ser editado antes de ejecutarlo.
Lo dejo por si algo sirve. No lo invoques, que a lo mejor rompes cosas.
'
			exit
			;;
	esac
done

urls='
https://nscristiandad.es/significacion/
https://nscristiandad.es/normativa-general/
https://nscristiandad.es/aviso-legal/
https://nscristiandad.es/politica-de-cookies/
https://nscristiandad.es/mas-informacion-sobre-las-cookies/
https://nscristiandad.es/politica-de-privacidad/
'

shopt -s extglob

for url in $urls; do
	page=$(sed -E 's/https:\/\/nscristiandad.es(.*)\//pages\1\.html/' <<< $url)
	config=$(sed -E 's/https:\/\/nscristiandad.es(.*)\//pages\1\.cfg/' <<< $url)

	# curl $url > $page

	# # echo "canonical = $url" >> $config
	# # echo "title = $(sed -En 's#.*<title>([^<]*)</title>#\1#p' $page)" >> $config
	# # echo "description = $(sed -En 's#.*<meta name="description" content="([^"]*)".*#\1#p' $page)" >> $config
	# # echo "filename = $(sed 's#pages/##g' <<< $page)" >> $config
	# # echo "extrafooter = pages/extrafooter.html" >> $config
	# 
	# sed -E '0,/<\/header/d' -i $page
	# sed -E '/<footer/,$d' -i $page
	# sed -i -E 's/<\/?span[^>]*>//g; s/<\/?section[^>]*>//g; s/<\/?div[^>]*>//g' $page
	# sed -E 's#(</p>)(<p)#\1\n\2#g' -i $page
	# sed -E 's/(class|height|style)="[^"]*"//g' -i $page 
	# sed 's#https://nscristiandad.es/wp-content#/pages-content#g' -i $page
	# sed 's/<!--.*-->//g' $page -i
	# sed -i '/^[[:space:]]*$/d' $page
	# sed '1i<script src=/scroll-animacion.js></script>\n<header class=header3 data-animation=top data-animation-group=1>\n</header>\n<main>\n<article class="article4">' $page -i
	# printf "</article>\n</main>\n" >> $page

	# h1=$(sed -n '6p' $page)
	# sed '6d' -i $page 
	# xargs -I_ sed '3i_' -i $page <<< $h1 
	# sed -E '3s#<[^>]*>([^<]*)<[^>]*>#<h1 class="h13">\1</h1>#' -i $page 

	# sed -E 's/[[:space:]]*>/>/g' $page -i
	# sed -E 's/<([^>]*)>[[:space:]]*<\/\1>//g' $page -i

	# sed -E 's/<em>/<i>/g' $page -i
	# sed -E 's/<\/em>/<\/i>/g' $page -i

	# sed -E 's/<p[^c>]*>/<p class="p21">/g' $page -i
	# sed -E 's/<a[^r]([^>]*)>/<a class="a5" \1>/g' $page -i
	# sed -E 's/<h4>/<h4 class="h46">/g' $page -i
	# sed -E 's/<h3>/<h3 class="h39">/g' $page -i
	# sed -E 's/<ul>/<ul class="ul5">/g' $page -i
	# sed -E 's/<li>/<li class="li6">/g' $page -i
	# sed '/<li class="li6">/{s/<p class="p21">//; s/<\/p>//}' $page -i
	# sed -E 's/<blockquote>/\n<blockquote class="blockquote1">/g' $page -i
	# sed -E 's/<\/blockquote>/\n<\/blockquote>\n/g' $page -i
	# sed -E 's/(<blockquote[^>]*>)/\n\1\n/g' $page -i
	# awk -i inplace '
	# /<blockquote/ { dentro = 1 }
	# dentro { gsub(/<p class="p21">/, "<p class=\"p24\"><i>"); gsub(/<\/p>/, "</i></p>") }
	# {print}
	# /<\/blockquote>/ { dentro = 0 }
	# ' $page
done
