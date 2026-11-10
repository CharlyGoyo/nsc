#!/usr/bin/env python3
import sys
import os
import re
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup, Comment

CLASS_MAP = {
	# Bloques de texto y encabezados
    'p': 'p21',
    'h1': 'h13',
    'h2': 'h24',
    'h3': 'h315',
    'h4': 'h44',
    'h5': 'h54',
    'h6': 'h64',
    'blockquote': 'blockquote4',
    'cite': 'cite4',
    'hr': 'hr4',
    'br': 'br4',

    # Listas
    'ul': 'ul4',
    'ol': 'ol4',
    'li': 'li4',

    # Enlaces y Media
    'a': 'a4',
    'img': 'img4',
    'figure': 'figure4',
    'figcaption': 'figcaption4',
    'audio': 'audio4',
    'video': 'video4',

    # Formato en línea (Inline)
    'strong': 'strong4',
    'em': 'em4',
    'b': 'b4',
    'i': 'i4',
    'u': 'u4',
    'mark': 'mark4',
    'small': 'small4',
    'code': 'code4',
    'pre': 'pre4',

    # Tablas
    'table': 'table4',
    'thead': 'thead4',
    'tbody': 'tbody4',
    'tr': 'tr4',
    'th': 'th4',
    'td': 'td4'
}

ALLOWED_TAGS = set(CLASS_MAP.keys())

def find_main_container(soup):
    """Busca el contenedor principal probando selectores de Elementor, WP estándar y fallbacks."""
    candidates = [
        # Selectores específicos de Elementor (usados en nscristiandad.es)
        soup.select_one('.elementor-widget-theme-post-content'),
        soup.select_one('.elementor-location-single'),
        soup.select_one('.elementor-post__content'),
        # Selectores estándar de WordPress
        soup.find('div', class_=re.compile(r'entry-content|post-content|single-post')),
        soup.find('article'),
        soup.find('main'),
    ]
    
    for candidate in candidates:
        if candidate and candidate.find_all(['p', 'h2', 'h3']):
            return candidate
            
    # Fallback final: devolver el <body> si no coincide ningún selector
    return soup.body

def process_url(url):
    headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0'}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')

    # 1. Extraer Título y Canonical
    title_tag = soup.find('title')
    title_text = title_tag.get_text(strip=True) if title_tag else ''
    
    canonical_tag = soup.find('link', rel=lambda x: x and x.lower() == 'canonical')
    canonical_url = canonical_tag['href'] if canonical_tag and canonical_tag.has_attr('href') else url

    # 2. Localizar el contenedor del artículo
    main_content = find_main_container(soup)
    if not main_content:
        raise ValueError("No se pudo extraer ningún contenido HTML.")

    # 3. Eliminar elementos de basura de Elementor, WP, scripts, navs y footers
    UNWANTED_SELECTORS = [
        'script', 'style', 'header', 'footer', 'nav', 'form', 'iframe', 'noscript',
        '.elementor-location-header', '.elementor-location-footer',
        '.elementor-nav-menu', '.elementor-share-buttons', '.elementor-post-navigation',
        '.sharedaddy', '.jp-relatedposts', '.post-meta', '.sidebar', '.comments-area'
    ]
    for selector in UNWANTED_SELECTORS:
        for tag in main_content.select(selector):
            tag.decompose()

    for comment in main_content.find_all(text=lambda text: isinstance(text, Comment)):
        comment.extract()

    # 4. Desempaquetar tags no permitidos y limpiar atributos de los permitidos
    for tag in list(main_content.find_all(True)):
        if tag.name not in ALLOWED_TAGS:
            tag.unwrap()
        else:
            allowed_attrs = {}
            if tag.name == 'a' and tag.has_attr('href'):
                allowed_attrs['href'] = tag['href']
            elif tag.name == 'img':
                if tag.has_attr('src'):
                    allowed_attrs['src'] = tag['src']
                if tag.has_attr('alt'):
                    allowed_attrs['alt'] = tag['alt']
            
            tag.attrs = allowed_attrs
            tag['class'] = CLASS_MAP[tag.name]

    # 5. Desempaquetar divs vacíos o sin texto/imágenes propios que solo hacían de wrapper
    for div in list(main_content.find_all('div')):
        # Si el div no tiene imágenes y todos sus hijos son etiquetas permitidas (p, h*, etc), lo eliminamos manteniendo su contenido
        if not div.find_all('img') and not div.get_text(strip=True):
            div.decompose()
        elif len(div.find_all(True)) > 0 and not div.find('blockquote'):
            # Desempaquetar divs anidados que solo actúan de wrappers de párrafos
            div.unwrap()

    # 6. Guardar archivos de salida
    path_slug = urlparse(url).path.strip('/').split('/')[-1]
    if not path_slug:
        path_slug = 'index'

    html_filename = f"{path_slug}.html"
    cfg_filename = f"{path_slug}.html.cfg"

    with open(cfg_filename, 'w', encoding='utf-8') as f:
        f.write(f"title = {title_text}\n")
        f.write(f"canonical = {canonical_url}\n")

    cleaned_body = main_content.decode_contents().strip()
    cleaned_body = re.sub(r'\n\s*\n', '\n', cleaned_body)

    with open(html_filename, 'w', encoding='utf-8') as f:
        f.write(cleaned_body)

    print(f"[+] Procesado: {html_filename} y {cfg_filename}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: ./process_article.py <URL>")
        sys.exit(1)

    for target_url in sys.argv[1:]:
        try:
            process_url(target_url)
        except Exception as e:
            print(f"[-] Error en {target_url}: {e}")
