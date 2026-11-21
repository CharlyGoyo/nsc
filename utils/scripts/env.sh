while getopts "h" opt; do
	case "$opt" in 
		h)
			printf "Exporta algunas variables de entorno útiles:
- HTML_EDITABLES: Archivos .html que no se sobreescriben durante la compilación. Los que se pueden editar.
- EDITABLES_NO_ARTICULOS: \$HTML_EDIDATBLES excluyendo pages/articulos/*.html
- ARTICULOS: pages/articulos/*.html
- NOVENAS: pages/novena-{1..9}.html
- BOLETINES: pages/boletines/*/laudate-*.html
- FOTOS: pages/fotos-20*.html

utils/scripts/class.sh lanza este script si encuentra vacía \$HTML_EDITABLES o \$EDITABLES_NO_ARTICULOS
"
			exit
			;;
	esac
done

shopt -s extglob
export HTML_EDITABLES='pages/pt/*.html pages/fr/*.html pages/en/*.html pages/boletines/*/laudate-*.html pages/boletines/header.html pages/boletines/footer.html pages/!(boletin).html pages/articulos/*.html templates/page/*.html template-boletin/seccion.html/*.html utils/html/*.html utils/html/formularios/*.html'
export ARTICULOS='pages/articulos/*.html'
export NOVENAS='pages/novena-1.html pages/novena-2.html pages/novena-3.html pages/novena-4.html pages/novena-5.html pages/novena-6.html pages/novena-7.html pages/novena-8.html pages/novena-9.html'
export BOLETINES='pages/boletines/*/laudate-*.html'
export FOTOS='pages/fotos-20*.html'
export EDITABLES_NO_ARTICULOS='pages/pt/*.html pages/fr/*.html pages/en/*.html pages/boletines/*/laudate-*.html pages/boletines/header.html pages/boletines/footer.html pages/!(boletin).html templates/page/*.html template-boletin/seccion.html/*.html utils/html/*.html utils/html/formularios/*.html'
