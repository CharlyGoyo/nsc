// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const containers = document.querySelectorAll('.div30');

	containers.forEach((container) => {
		container.setAttribute('tabindex', '0');
		const wrapper = container.querySelector('.div32');
		const rightBtn = container.querySelector('.svg19');
		const leftBtn = container.querySelector('.svg20');
		const dots = container.querySelectorAll('.span11 > .span12');
		let autoscroll_activado = true;

		let aux = wrapper.lastElementChild;
		wrapper.appendChild(wrapper.firstElementChild.cloneNode(true));
		wrapper.prepend(aux.cloneNode(true));
		wrapper.scrollLeft = wrapper.clientWidth;

		wrapper.addEventListener('scrollend', () => {
			if (wrapper.scrollLeft >= wrapper.scrollWidth - (wrapper.clientWidth + 1)) { 
				wrapper.scrollTo({
					left:		wrapper.clientWidth,
					behavior:	'instant'
				});
			} else if (wrapper.scrollLeft <= 1) { 
				wrapper.scrollTo({
					left:		wrapper.scrollWidth - (wrapper.clientWidth * 2),
					behavior:	'instant'
				});
			}

			let ind = (Math.round(wrapper.scrollLeft / wrapper.clientWidth) - 1) % (wrapper.childElementCount - 2);
			dots.forEach((dot, index) => {
				let op = '0.2';
				if (ind == index) {
					op = '1';
				}
				dot.style.opacity = op;
			});
		});

		rightBtn.addEventListener('click', () => {
			wrapper.scrollTo({
				left: 		wrapper.scrollLeft + wrapper.clientWidth,
				behavior:	'smooth'
			});
		}, {passive: true});

		leftBtn.addEventListener('click', () => {
			wrapper.scrollTo({
				left: 		wrapper.scrollLeft - wrapper.clientWidth,
				behavior:	'smooth'
			});
		}, {passive: true});

		dots.forEach((dot, index) => {
			dot.addEventListener('click', () => {
				wrapper.scrollTo({
					left:		(wrapper.clientWidth * (index + 1)),
					behavior:	'smooth'
				});
			});
		});

		setInterval(() => {
			if (autoscroll_activado) {
				wrapper.scrollTo({
					left:		wrapper.scrollLeft + wrapper.clientWidth,
					behavior:	'smooth'
				});
			}
		}, 5500);

		container.addEventListener('mouseenter', () => {
			autoscroll_activado = false;
		});

		container.addEventListener('mouseleave', () => {
			autoscroll_activado = true;
		});

		container.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				wrapper.scrollTo({
					left: wrapper.scrollLeft + wrapper.clientWidth,
					behavior: 'smooth'
				});
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				wrapper.scrollTo({
					left: wrapper.scrollLeft - wrapper.clientWidth,
					behavior: 'smooth'
				});
			}
		});
	});
});
