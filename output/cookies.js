// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const rechazarInp = document.querySelector("[data-cookies-rechazar]");
	const aceptarInp = document.querySelector("[data-cookies-aceptar]");
	const iframes = document.querySelectorAll("iframe[data-src]");

	rechazarInp.checked = false;
	aceptarInp.checked = false;

	rechazarInp.addEventListener("change", () => {
		if (rechazarInp.checked) {
			iframes.forEach((iframe) => iframe.removeAttribute("src"));
		}
	});

	aceptarInp.addEventListener("change", () => {
		if (aceptarInp.checked) {
			iframes.forEach((iframe) => iframe.src = iframe.dataset.src);
		}
	});
});
