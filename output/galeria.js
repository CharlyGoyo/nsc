/* gemini cocina que da gusto eh */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const SVG = {
		prev:		'/pages-content/extra/svg/arrow-left-solid-full.svg',
		next:		'/pages-content/extra/svg/arrow-right-solid-full.svg',
		zoomIn:		'/pages-content/extra/svg/magnifying-glass-plus-solid-full.svg',
		zoomOut:	'/pages-content/extra/svg/magnifying-glass-minus-solid-full.svg',
		expand:		'/pages-content/extra/svg/expand-solid-full.svg',
		compress:	'/pages-content/extra/svg/compress-solid-full.svg',
		close:		'/pages-content/extra/svg/xmark-solid-full.svg'
	};

	const crearBotonIcono = (srcIcono, ariaLabel) => {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.setAttribute('aria-label', ariaLabel);
		Object.assign(btn.style, {
			alignItems:		'center',
			background:		'transparent',
			border:			'none',
			borderRadius:	'4px',
			cursor:			'pointer',
			display:		'flex',
			height:			'30px',
			justifyContent:	'center',
			padding:		'8px',
			width:			'30px'
		});

		const img = document.createElement('img');
		img.src = srcIcono;
		img.alt = '';
		img.draggable = false;
		Object.assign(img.style, {
			filter:			'invert(1)',
			height:			'100%',
			pointerEvents:	'none',
			width:			'100%'
		});

		btn.appendChild(img);
		return { btn, img };
	};

	const activarGaleria = (setId) => {
		const setContenedor = document.querySelector(`[data-galeria-set="${setId}"]`);
		if (!setContenedor) return;

		// Obtener imágenes reales del set (descartando posibles clones de carrusel infinito)
		let imagenes = Array.from(setContenedor.querySelectorAll('img'));
		const carruselPadre = setContenedor.closest('[data-carrusel-container]');
		if (carruselPadre?.dataset.carruselContainer.includes('infinito') && imagenes.length > 2) {
			imagenes = imagenes.slice(1, -1);
		}
		if (!imagenes.length) return;

		// Índice n del input con data-galeria activo en ese momento
		const inputs = Array.from(document.querySelectorAll(`input[data-galeria="${setId}"]`));
		const indiceActivo = inputs.findIndex(input => input.checked);
		let indiceActual = indiceActivo >= 0 ? indiceActivo : 0;

		// Estado de zoom y arrastre
		let zoomActivo = false;
		let arrastrando = false;
		let seHaMovido = false;
		let startX = 0;
		let startY = 0;
		let posX = 0;
		let posY = 0;
		const FACTOR_ZOOM = 2.5;

		// 1. Fondo negro semiopaco (Overlay)
		const overlay = document.createElement('div');
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		Object.assign(overlay.style, {
			alignItems:			'center',
			backgroundColor:	'rgba(0, 0, 0, 0.9)',
			display:			'flex',
			inset:				'0',
			justifyContent:		'center',
			overflow:			'hidden',
			position:			'fixed',
			touchAction:		'none',
			userSelect:			'none',
			zIndex:				'9999'
		});

		// 2. Contador arriba a la izquierda: [actual] / [total]
		const contador = document.createElement('div');
		Object.assign(contador.style, {
			color:			'#ffffff',
			fontFamily:		'"Montserrat", sans-serif',
			fontSize:		'15px',
			left:			'20px',
			letterSpacing:	'1px',
			pointerEvents:	'none',
			position:		'absolute',
			top:			'20px',
			zIndex:			'2'
		});

		// 3. Barra superior derecha: magnifying-plus, expand, xmark
		const barraDerecha = document.createElement('div');
		Object.assign(barraDerecha.style, {
			display:	'flex',
			gap:		'8px',
			position:	'absolute',
			right:		'20px',
			top:		'16px',
			zIndex:		'2',
			width:		'auto'
		});

		const { btn: btnZoom, img: imgZoom } = crearBotonIcono(SVG.zoomIn, 'Ampliar imagen');
		const { btn: btnExpand, img: imgExpand } = crearBotonIcono(SVG.expand, 'Pantalla completa');
		const { btn: btnClose } = crearBotonIcono(SVG.close, 'Cerrar galería');
		barraDerecha.append(btnZoom, btnExpand, btnClose);

		// 4. Flechas laterales centradas verticalmente
		const { btn: btnPrev } = crearBotonIcono(SVG.prev, 'Imagen anterior');
		Object.assign(btnPrev.style, {
			left:		'20px',
			position:	'absolute',
			top:		'50%',
			transform:	'translateY(-50%)',
			zIndex:		'2'
		});

		const { btn: btnNext } = crearBotonIcono(SVG.next, 'Imagen siguiente');
		Object.assign(btnNext.style, {
			position:	'absolute',
			right:		'20px',
			top:		'50%',
			transform:	'translateY(-50%)',
			zIndex:		'2'
		});

		// 5. Imagen en primer plano
		const visorImg = document.createElement('img');
		visorImg.draggable = false;
		Object.assign(visorImg.style, {
			cursor:		'zoom-in',
			maxHeight:	'80vh',
			maxWidth:	'80vw',
			objectFit:	'contain',
			transition:	'none',
			willChange:	'transform',
			zIndex:		'1'
		});

		// Funciones de control interno
		const aplicarTransform = () => {
			visorImg.style.transform = zoomActivo
				? `translate(${posX}px, ${posY}px) scale(${FACTOR_ZOOM})`
				: 'translate(0px, 0px) scale(1)';
		};

		const resetearZoom = () => {
			zoomActivo = false;
			arrastrando = false;
			posX = 0;
			posY = 0;
			imgZoom.src = SVG.zoomIn;
			visorImg.style.cursor = 'zoom-in';
			aplicarTransform();
		};

		const toggleZoom = () => {
			if (zoomActivo) {
				resetearZoom();
			} else {
				zoomActivo = true;
				posX = 0;
				posY = 0;
				imgZoom.src = SVG.zoomOut;
				visorImg.style.cursor = 'grab';
				aplicarTransform();
			}
		};

		const renderizarImagen = () => {
			resetearZoom();
			const origen = imagenes[indiceActual];
			visorImg.src = origen.dataset.galeriaImg || origen.currentSrc || origen.src;
			visorImg.alt = origen.alt || '';
			contador.textContent = `${indiceActual + 1} / ${imagenes.length}`;
		};

		const irAnterior = () => {
			indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
			renderizarImagen();
		};

		const irSiguiente = () => {
			indiceActual = (indiceActual + 1) % imagenes.length;
			renderizarImagen();
		};

		const cerrarGaleria = () => {
			if (document.fullscreenElement === overlay) {
				document.exitFullscreen().catch(() => {});
			}
			document.removeEventListener('keydown', manejarTeclado);
			document.removeEventListener('fullscreenchange', manejarFullscreen);
			document.body.style.overflow = '';
			overlay.remove();
		};

		// Eventos de navegación y controles
		btnPrev.addEventListener('click', (e) => {
			e.stopPropagation();
			irAnterior();
		});

		btnNext.addEventListener('click', (e) => {
			e.stopPropagation();
			irSiguiente();
		});

		btnZoom.addEventListener('click', (e) => {
			e.stopPropagation();
			toggleZoom();
		});

		btnExpand.addEventListener('click', (e) => {
			e.stopPropagation();
			if (!document.fullscreenElement) {
				overlay.requestFullscreen().catch(() => {});
			} else {
				document.exitFullscreen().catch(() => {});
			}
		});

		btnClose.addEventListener('click', (e) => {
			e.stopPropagation();
			cerrarGaleria();
		});

		// Cerrar al pulsar sobre el fondo negro
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				cerrarGaleria();
			}
		});

		// Zoom por clic y desplazamiento por arrastrar (Click & Drag)
		visorImg.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			if (e.button !== 0) return;
			seHaMovido = false;

			if (zoomActivo) {
				arrastrando = true;
				startX = e.clientX - posX;
				startY = e.clientY - posY;
				visorImg.style.cursor = 'grabbing';
				visorImg.setPointerCapture(e.pointerId);
			}
		});

		visorImg.addEventListener('pointermove', (e) => {
			if (!arrastrando || !zoomActivo) return;
			const dx = (e.clientX - startX) - posX;
			const dy = (e.clientY - startY) - posY;
			if (Math.hypot(dx, dy) > 4) {
				seHaMovido = true;
			}
			posX = e.clientX - startX;
			posY = e.clientY - startY;
			aplicarTransform();
		});

		const finalizarArrastre = (e) => {
			if (arrastrando) {
				arrastrando = false;
				visorImg.style.cursor = zoomActivo ? 'grab' : 'zoom-in';
				if (visorImg.hasPointerCapture(e.pointerId)) {
					visorImg.releasePointerCapture(e.pointerId);
				}
			}
		};

		visorImg.addEventListener('pointerup', finalizarArrastre);
		visorImg.addEventListener('pointercancel', finalizarArrastre);

		visorImg.addEventListener('click', (e) => {
			e.stopPropagation();
			// Solo alterna el zoom si fue un clic limpio y no el final de un arrastre
			if (!seHaMovido) {
				toggleZoom();
			}
			seHaMovido = false;
		});

		// Teclado (Flechas y Escape)
		const manejarTeclado = (e) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				irAnterior();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				irSiguiente();
			} else if (e.key === 'Escape' && !document.fullscreenElement) {
				cerrarGaleria();
			}
		};

		// Sincronizar icono expand/compress al entrar/salir de fullscreen
		const manejarFullscreen = () => {
			imgExpand.src = (document.fullscreenElement === overlay) ? SVG.compress : SVG.expand;
		};

		document.addEventListener('keydown', manejarTeclado);
		document.addEventListener('fullscreenchange', manejarFullscreen);

		// Montaje en el DOM
		overlay.append(contador, barraDerecha, btnPrev, visorImg, btnNext);
		document.body.style.overflow = 'hidden';
		document.body.appendChild(overlay);
		renderizarImagen();
	};

	// Vincular disparadores (botones o elementos no-input con data-galeria)
	document.querySelectorAll('[data-galeria]:not(input)').forEach(disparador => {
		disparador.addEventListener('click', () => {
			activarGaleria(disparador.dataset.galeria);
		});
	});
});
