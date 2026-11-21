#!/bin/bash

set -e

langs="pt en fr"
pot_dir="pot"
po_base="po"
pages_dir="pages"

do_pots=false
do_pos=false
do_compile=false
do_links=false

usage() {
	printf "Gestiona el flujo de traducción (.pot / .po) y compilación a pages/<idioma>.
Esto me lo ha hecho gemini y no lo he revisado aún.

USO:
\ttraducir.sh [opciones] [archivos_html...]

OPCIONES:
\t-p        Actualiza las plantillas .pot desde pages/*.html
\t-u        Actualiza los .po por idioma a partir de los .pot
\t-c        Compila las traducciones a pages/<idioma>/ (y genera/actualiza .cfg)
\t-l        Arregla los enlaces internos en pages/<idioma>/*.html tras compilar
\t-a        Ejecuta todo en orden: -p -u -c -l
\t-i LANGS  Idiomas a procesar (por defecto: \"pt en fr\", ej. -i \"pt en\")
\t-h        Muestra esta ayuda y finaliza

Si no pasas archivos concretos, toma los .html de %s/ (excluyendo subdirectorios).
" "$pages_dir"
	exit 0
}

while getopts "puc lahi:" opt 2>/dev/null; do
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

# Lista de HTML base en español
if [ "$#" -gt 0 ]; then
	html_files=("$@")
else
	shopt -s nullglob
	html_files=("$pages_dir"/*.html)
	shopt -u nullglob
fi

# 1. Actualizar .pot desde pages/*.html
if $do_pots; then
	mkdir -p "$pot_dir"
	for html in "${html_files[@]}"; do
		[ -f "$html" ] || continue
		base=$(basename "$html" .html)
		html2po -P "$html" "$pot_dir/${base}.pot"
	done
fi

# 2. Actualizar .po por idioma desde los .pot
if $do_pos; then
	for lang in $langs; do
		mkdir -p "$po_base/$lang"
		for pot in "$pot_dir"/*.pot; do
			[ -f "$pot" ] || continue
			base=$(basename "$pot" .pot)
			po_file="$po_base/$lang/${base}.po"
			if [ -f "$po_file" ]; then
				msgmerge --update --backup=none "$po_file" "$pot"
			else
				msginit --no-translator -l "$lang" -i "$pot" -o "$po_file"
			fi
		done
	done
fi

# 3. Compilar .po a pages/<idioma>/
if $do_compile; then
	for lang in $langs; do
		out_dir="$pages_dir/$lang"
		mkdir -p "$out_dir"
		for html in "${html_files[@]}"; do
			[ -f "$html" ] || continue
			base=$(basename "$html" .html)
			po_file="$po_base/$lang/${base}.po"
			target_html="$out_dir/${base}.html"

			if [ -f "$po_file" ]; then
				po2html -t "$html" -i "$po_file" -o "$target_html"
			else
				cp "$html" "$target_html"
			fi

			# Asegura que exista un .cfg para que compilar.sh procese pages/<lang>/*.cfg
			cfg_src="$pages_dir/${base}.cfg"
			cfg_dst="$out_dir/${base}.cfg"
			if [ -f "$cfg_src" ] && [ ! -f "$cfg_dst" ]; then
				sed -E "s|^(filename[[:space:]]*=[[:space:]]*).*|\1${base}.html|" "$cfg_src" > "$cfg_dst"
			fi
		done
	done
fi

# 4. Arreglar enlaces internos en pages/<idioma>/*.html
if $do_links; then
	for lang in $langs; do
		out_dir="$pages_dir/$lang"
		[ -d "$out_dir" ] || continue
		for html in "$out_dir"/*.html; do
			[ -f "$html" ] || continue
			# Convierte enlaces locales a /<archivo>.html en /<lang>/<archivo>.html
			# sin tocar recursos (/pages-content), anclas (#) ni enlaces ya prefijados
			sed -i -E \
				-e "s|(href=[\"'])/([^\"'/#?:]+)\.html(#[^\"']*)?\1|\1/${lang}/\2.html\3\1|g" \
				-e "s|(href=[\"'])/([^\"'/#?:]+)(#[^\"']*)?\1|\1/${lang}/\2\3\1|g" \
				"$html"
			# Limpia posibles dobles prefijos si ya existían
			sed -i -E "s|(href=[\"'])/${lang}/${lang}/|\1/${lang}/|g" "$html"
		done
	done
fi
