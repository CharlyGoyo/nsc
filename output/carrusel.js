// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const containers = document.querySelectorAll('[data-carrusel-container]');

	containers.forEach((container) => {
		container.setAttribute('tabindex', '0');
		const wrapper = container.querySelector('[data-carrusel-wrapper]');
		const rightBtn = container.querySelector('[data-carrusel-right]');
		const leftBtn = container.querySelector('[data-carrusel-left]');
		const selectores = container.querySelectorAll('[data-carrusel-selector]');
		const esInfinito = container.dataset.carruselContainer.includes("infinito");
		const esAutoScroll = container.dataset.carruselContainer.includes("autoscroll");
		const esAlturaDinamica = container.dataset.carruselContainer.includes("altura_dinamica");
		let autoscroll_activado = true;
		let leftLimit = false;
		let rightLimit = false;

		const scrollDerecha = () => {
			if (rightLimit) {
				wrapper.scrollTo({
					left: 		0,
					behavior:	'smooth'
				});
			}
			else {
				wrapper.scrollTo({
					left: 		wrapper.scrollLeft + wrapper.clientWidth,
					behavior:	'smooth'
				});
			}
		}
		const scrollIzquierda = () => {
			if (leftLimit) {
				wrapper.scrollTo({
					left:		wrapper.scrollWidth - wrapper.clientWidth,
					behavior:	'smooth'
				});
			}
			else {
				wrapper.scrollTo({
					left: 		wrapper.scrollLeft - wrapper.clientWidth,
					behavior:	'smooth'
				});
			}
		}
		const ajustarAltura = () => {
			const imgActiva = wrapper.children[Math.round(wrapper.scrollLeft / wrapper.clientWidth)];
			if (imgActiva.offsetHeight > 0) {
				wrapper.style.height = `${imgActiva.offsetHeight}px`;
			}
		};

		if (esInfinito) {
			let aux = wrapper.lastElementChild;
			wrapper.appendChild(wrapper.firstElementChild.cloneNode(true));
			wrapper.prepend(aux.cloneNode(true));
			wrapper.scrollLeft = wrapper.clientWidth;
		}
		else {
			wrapper.scrollLeft = 0;
		}

		wrapper.addEventListener('scrollend', () => {
			if (esAlturaDinamica) {
				ajustarAltura();
			}
			leftLimit = false;
			rightLimit = false;
			if (wrapper.scrollLeft >= wrapper.scrollWidth - (wrapper.clientWidth + 1)) { 
				if (esInfinito) {
					wrapper.scrollTo({
						left:		wrapper.clientWidth,
						behavior:	'instant'
					});
				}
				else {
					rightLimit = true;
				}
			} else if (wrapper.scrollLeft <= 1) { 
				if (esInfinito) {
					wrapper.scrollTo({
						left:		wrapper.scrollWidth - (wrapper.clientWidth * 2),
						behavior:	'instant'
					});
				}
				else {
					leftLimit = true;
				}
			}
			else {

			}

			const offset = esInfinito ? 1 : 0;
			const totalReales = wrapper.childElementCount - (offset * 2);
			let ind = (Math.round(wrapper.scrollLeft / wrapper.clientWidth) - offset) % totalReales;

			if (wrapper.hasAttribute('data-cursor-zoom')) {
				wrapper.dataset.cursorZoom = ind;
			}

			/* esto es un poco chapucilla. Feel free to improve */
			selectores?.forEach((selector, index) => {
				let op = '0.2';
				if (ind == index) {
					op = '1';
					selector.checked = true;
				}
				selector.style.opacity = op;
			});
		});

		rightBtn?.addEventListener('click', () => {
			scrollDerecha();
		}, {passive: true});

		leftBtn?.addEventListener('click', () => {
			scrollIzquierda();
		}, {passive: true});

		selectores?.forEach((selector, index) => {
			/* otra chapucilla que se puede mejorar */
			selector.addEventListener('click', () => {
				wrapper.scrollTo({
					left:		(wrapper.clientWidth * (index + (esInfinito ? 1 : 0))),
					behavior:	'smooth'
				});
			});
			selector.addEventListener('change', (e) => {
				if (e.target.checked) {
					wrapper.scrollTo({
						left:		(wrapper.clientWidth * (index + (esInfinito ? 1 : 0))),
						behavior:	'smooth'
					});
				}
			});
		});

		if (esAutoScroll) {
			setInterval(() => {
				if (autoscroll_activado) {
					scrollDerecha();
				}
			}, 5500);

			container.addEventListener('mouseenter', () => {
				autoscroll_activado = false;
			});

			container.addEventListener('mouseleave', () => {
				autoscroll_activado = true;
			});
		}

		container.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				scrollDerecha();
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				scrollIzquierda();
			}
		});
		if (esAlturaDinamica) {
			ajustarAltura();
			new ResizeObserver(() => ajustarAltura()).observe(wrapper);
		}
	});
});

