// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web

// angeles-de-la-guarda.html
// index.html
// informacion-practica.html
// ruta-familias.html
// voluntariado.html

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const parallax_sections = document.querySelectorAll('.section2, .section9');
	let ticking = false;

	const updateParallax = () => {
		ticking = false;

		parallax_sections.forEach((section) => {
			let rect = section.getBoundingClientRect();

			let p = (rect.top + rect.height) / (window.innerHeight + rect.height);

			// normaliza a [-0.5, 0.5]
			p = Math.max(0, Math.min(1, p)) - 0.5;

			section.style.backgroundPositionY = `calc(50% + ${p * 200}px)`; // ajusta ese 200
		});
	};

	window.addEventListener('scroll', () => {
		if (!ticking) {
			ticking = true;
			window.requestAnimationFrame(updateParallax);
		}
	}, { passive: true });
	updateParallax();
});
