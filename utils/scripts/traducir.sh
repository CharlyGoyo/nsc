#!/bin/bash

set -e

langs="pt en fr"
pot_dir="pot"
po_base="po"
pages_dir="pages"

# Lista exacta de páginas traducidas (sin extensión)
translated_pages=(
	angeles-de-la-guarda
	capitulos
	como-ayudar
	contacto
	donaciones
	index
	informacion-practica
	inscripcion
	peregrinacion
	que-llevar
	ruta-familias
	sacerdotes
	voluntariado
)

do_pots=false
do_pos=false
do_compile=false
do_links=false

usage() {
	printf "Gestiona el flujo de traducción (.pot / .po) y compilación a pages/<idioma> solo para las páginas traducidas.

USO:
\ttraducir.sh [opciones] [archivos_html...]

OPCIONES:
\t-p        Actualiza las plantillas .pot desde pages/<slug>.html
\t-u        Actualiza los .po por idioma a partir de los .pot
\t-c        Compila las traducciones a pages/<idioma>/
\t-l        Arregla los enlaces internos en pages/<idioma>/*.html tras compilar
\t-a        Ejecuta todo en orden: -p -u -c -l
\t-i LANGS  Idiomas a procesar (por defecto: \"pt en fr\", ej. -i \"pt en\")
\t-h        Muestra esta ayuda y finaliza

Si no pasas archivos concretos, usa la lista fija de 13 páginas traducidas.
"
	exit 0
}

while getopts "puclahi:" opt; do
	case "$opt" in
		p) do_pots=true ;;
		u) do_pos=true ;;
		c) do_compile=true ;;
		l) do_links=true ;;
		a)
			do_pots=true
			do_pos=true
			do_compile=true
			do_links=true
			;;
		i) langs="$OPTARG" ;;
		h) usage ;;
		*) usage ;;
	esac
done
shift $((OPTIND - 1))

if ! $do_pots && ! $do_pos && ! $do_compile && ! $do_links; then
	usage
fi

# Construye la lista de slugs a procesar
slugs=()
if [ "$#" -gt 0 ]; then
	for arg in "$@"; do
		b=$(basename "$arg")
		slugs+=("${b%.html}")
	done
else
	slugs=("${translated_pages[@]}")
fi

# 1. Actualizar .pot desde pages/<slug>.html
if $do_pots; then
	mkdir -p "$pot_dir"
	for slug in "${slugs[@]}"; do
		html="$pages_dir/${slug}.html"
		[ -f "$html" ] || { echo "Aviso: no existe $html, se omite" >&2; continue; }
		html2po -P "$html" "$pot_dir/${slug}.pot"
	done
fi

# 2. Actualizar .po por idioma desde los .pot de las páginas seleccionadas
if $do_pos; then
	for lang in $langs; do
		mkdir -p "$po_base/$lang"
		for slug in "${slugs[@]}"; do
			pot="$pot_dir/${slug}.pot"
			[ -f "$pot" ] || continue
			po_file="$po_base/$lang/${slug}.po"
			if [ -f "$po_file" ]; then
				msgmerge --update --backup=none "$po_file" "$pot"
			else
				msginit --no-translator -l "$lang" -i "$pot" -o "$po_file"
			fi
		done
	done
fi

# 3. Compilar .po a pages/<idioma>/<slug>.html
if $do_compile; then
	for lang in $langs; do
		out_dir="$pages_dir/$lang"
		mkdir -p "$out_dir"
		for slug in "${slugs[@]}"; do
			html="$pages_dir/${slug}.html"
			[ -f "$html" ] || continue
			po_file="$po_base/$lang/${slug}.po"
			target_html="$out_dir/${slug}.html"

			if [ -f "$po_file" ]; then
				po2html -t "$html" -i "$po_file" -o "$target_html"
			else
				cp "$html" "$target_html"
			fi
		done
	done
fi

# 4. Arreglar enlaces internos solo en los HTML traducidos de pages/<idioma>/
if $do_links; then
	for lang in $langs; do
		out_dir="$pages_dir/$lang"
		[ -d "$out_dir" ] || continue
		for slug in "${slugs[@]}"; do
			html="$out_dir/${slug}.html"
			[ -f "$html" ] || continue
			sed -i -E \
				-e "s|(href=[\"'])/([^\"'/#?:]+)\.html(#[^\"']*)?\1|\1/${lang}/\2.html\3\1|g" \
				-e "s|(href=[\"'])/([^\"'/#?:]+)(#[^\"']*)?\1|\1/${lang}/\2\3\1|g" \
				"$html"
			sed -i -E "s|(href=[\"'])/${lang}/${lang}/|\1/${lang}/|g" "$html"
		done
	done
fi
