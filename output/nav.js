// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const nav = document.querySelector('nav');
	const original_style = nav.style.backgroundColor;
	let ticking = false;

	const updateNavbar = () => {
		ticking = false;
		if ((window.scrollY ?? document.documentElement.scrollTop) > 75){
			nav.style.backgroundColor = original_style;
		} else {
			nav.style.backgroundColor = "transparent";
		}
	}

	window.addEventListener('scroll', () => {
		if (!ticking) {
			ticking = true;
			updateNavbar();
		}
	}, { passive: true });
	updateNavbar();
});
