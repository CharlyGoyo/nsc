sed 's/<\/p>/<\/p>\n/g' -i *.html
sed -i '1d;$d' *.html 
sed 's/nscristiandad.es\//nscristiandad.es\/articulos\//' *.cfg -i
for file in *.cfg; do mv $file ${file%*html.cfg}cfg; done
