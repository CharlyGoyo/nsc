while getopts "h" opt; do
	case "$opt" in 
		h)
			printf "Exporta algunas variables de entorno útiles:

- HTML_EDITABLES: Archivos .html que no se sobreescriben durante la compilación. Los que se pueden editar.
- ARTICULOS: pages/articulos/*.html
- NOVENAS: pages/novena-{1..9}.html
"
			exit
			;;
	esac
done

shopt -s extglob
export HTML_EDITABLES='pages/boletines/*/laudate-*.html pages/boletines/header.html pages/boletines/footer.html pages/!(boletin).html pages/articulos/*.html templates/page/*.html template-boletin/seccion.html/*.html utils/html/*.html'
export ARTICULOS='pages/articulos/*.html'
export NOVENAS='pages/novena-1.html pages/novena-2.html pages/novena-3.html pages/novena-4.html pages/novena-5.html pages/novena-6.html pages/novena-7.html pages/novena-8.html pages/novena-9.html'
