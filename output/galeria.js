/* como cocina mi pana el gemini */
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
			height:			'36px',
			justifyContent:	'center',
			padding:		'8px',
			width:			'36px'
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

	// Obtiene los activadores de un elemento (en el propio input o en un ancestro cercano)
	const obtenerActivadores = (el) => {
		const nodo = el.closest('[data-activated-by]') || el;
		const raw = nodo.dataset.activatedBy || '';
		return raw.trim().split(/\s+/).filter(Boolean);
	};

	// Detecta el filtro activo actual (ej. "todos", "sabado", "voluntarios", etc.)
	const obtenerFiltroActivo = () => {
		const filtro = document.querySelector(
			'input[data-input]:checked, input[data-input-name]:checked'
		);
		if (!filtro) return null;
		return filtro.dataset.input || filtro.dataset.inputName || null;
	};

	// Devuelve todos los inputs[data-galeria] que corresponden al filtro actual
	const obtenerInputsActivos = (inputPulsado = null) => {
		const todosInputs = Array.from(document.querySelectorAll('input[data-galeria]'));
		const filtroActivo = obtenerFiltroActivo();

		// 1. Si "todos" está marcado, devuelve toda la galería sin filtrar
		if (filtroActivo === 'todos') {
			return todosInputs;
		}

		// 2. Si hay un filtro específico marcado, filtra por data-activated-by ~= filtroActivo
		if (filtroActivo) {
			const filtrados = todosInputs.filter(inp => obtenerActivadores(inp).includes(filtroActivo));
			if (filtrados.length) return filtrados;
		}

		// 3. Fallback si no hay filtro externo: usa el primer activador del input pulsado (o todos)
		if (inputPulsado) {
			const activadores = obtenerActivadores(inputPulsado);
			if (activadores.length) {
				return todosInputs.filter(inp => obtenerActivadores(inp).includes(activadores[0]));
			}
		}

		return todosInputs;
	};

	const mapearInputAItem = (input) => {
		const enlace = input.closest('a');
		const img = enlace?.querySelector('img') || input.parentElement?.querySelector('img');
		return {
			src:	enlace?.getAttribute('href') || img?.dataset.galeriaImg || img?.currentSrc || img?.src || '',
			alt:	img?.alt || '',
			titulo:	enlace?.dataset.galeriaTitulo || ''
		};
	};

	const obtenerElementos = (setId = null, inputPulsado = null) => {
		// Modo 1: Contenedor explícito [data-galeria-set] (fichas de producto / carrusel)
		if (setId) {
			const setContenedor = document.querySelector(`[data-galeria-set~="${setId}"]`);
			if (setContenedor) {
				let imgs = Array.from(setContenedor.querySelectorAll('img'));
				const carruselPadre = setContenedor.closest('[data-carrusel-container]');
				if (carruselPadre?.dataset.carruselContainer.includes('infinito') && imgs.length > 2) {
					imgs = imgs.slice(1, -1);
				}
				return imgs.map(img => ({
					src:	img.dataset.galeriaImg || img.currentSrc || img.src,
					alt:	img.alt || '',
					titulo:	img.closest('[data-galeria-titulo]')?.dataset.galeriaTitulo || ''
				}));
			}
		}

		// Modo 2: Rejilla de inputs[data-galeria] guiada por data-activated-by
		return obtenerInputsActivos(inputPulsado)
			.map(mapearInputAItem)
			.filter(item => item.src);
	};

	const activarGaleria = ({ setId = null, inputPulsado = null, indiceForzado = null } = {}) => {
		const elementos = obtenerElementos(setId, inputPulsado);
		if (!elementos.length) return;

		let indiceActual = 0;
		if (indiceForzado !== null && indiceForzado >= 0) {
			indiceActual = indiceForzado;
		} else {
			const inputs = obtenerInputsActivos(inputPulsado);
			const indiceActivo = inputs.findIndex(inp => inp.checked);
			indiceActual = indiceActivo >= 0 ? indiceActivo : 0;
		}

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
			display:		'flex',
			flexDirection:	'row',
			gap:			'8px',
			position:		'absolute',
			right:			'20px',
			top:			'16px',
			width:			'auto',
			zIndex:			'2'
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

		// 5. Pie de foto opcional (si existe data-galeria-titulo)
		const pieTitulo = document.createElement('div');
		Object.assign(pieTitulo.style, {
			bottom:			'20px',
			color:			'#ffffff',
			fontFamily:		'"Montserrat", sans-serif',
			fontSize:		'14px',
			left:			'50%',
			opacity:		'0.85',
			pointerEvents:	'none',
			position:		'absolute',
			transform:		'translateX(-50%)',
			zIndex:			'2'
		});

		// 6. Imagen en primer plano
		const visorImg = document.createElement('img');
		visorImg.draggable = false;
		Object.assign(visorImg.style, {
			cursor:		'zoom-in',
			maxHeight:	'82vh',
			maxWidth:	'84vw',
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
			const item = elementos[indiceActual];
			visorImg.src = item.src;
			visorImg.alt = item.alt;
			contador.textContent = `${indiceActual + 1} / ${elementos.length}`;
			pieTitulo.textContent = item.titulo;
			pieTitulo.style.display = item.titulo ? 'block' : 'none';
		};

		const irAnterior = () => {
			indiceActual = (indiceActual - 1 + elementos.length) % elementos.length;
			renderizarImagen();
		};

		const irSiguiente = () => {
			indiceActual = (indiceActual + 1) % elementos.length;
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

		const manejarFullscreen = () => {
			imgExpand.src = (document.fullscreenElement === overlay) ? SVG.compress : SVG.expand;
		};

		document.addEventListener('keydown', manejarTeclado);
		document.addEventListener('fullscreenchange', manejarFullscreen);

		// Montaje en el DOM
		overlay.append(contador, barraDerecha, btnPrev, visorImg, btnNext, pieTitulo);
		document.body.style.overflow = 'hidden';
		document.body.appendChild(overlay);
		renderizarImagen();
	};

	// 1. Disparadores explícitos (botones sin ser input, ej. la lupa en productos)
	document.querySelectorAll('[data-galeria]:not(input)').forEach(disparador => {
		disparador.addEventListener('click', () => {
			const setId = disparador.dataset.galeria || null;
			activarGaleria({ setId });
		});
	});

	// 2. Disparadores directos en rejilla (inputs[data-galeria])
	document.querySelectorAll('input[data-galeria]').forEach(input => {
		const zonaClic = input.closest('a') || input.closest('label') || input;
		zonaClic.addEventListener('click', (e) => {
			e.preventDefault();
			input.checked = true;
			const inputsActivos = obtenerInputsActivos(input);
			const indice = inputsActivos.indexOf(input);
			activarGaleria({ inputPulsado: input, indiceForzado: indice });
		});
	});
});
