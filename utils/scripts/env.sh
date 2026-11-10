while getopts "h" opt; do
	case "$opt" in 
		h)
			printf "Exporta algunas variables de entorno útiles:

- HTML_EDITABLES: Archivos .html que no se sobreescriben durante la compilación. Los que se pueden editar.
"
			exit
			;;
	esac
done

shopt -s extglob
export HTML_EDITABLES='pages/boletines/*/laudate-*.html pages/boletines/header.html pages/boletines/footer.html pages/!(boletin).html templates/page/*.html template-boletin/seccion.html/*.html utils/html/*.html'
