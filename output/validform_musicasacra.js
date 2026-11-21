// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('form10');

	const PRECIO_BASE = 85;
	const formato = new Intl.NumberFormat('es-ES', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const actualizarPrecio = () => {
		const donacion = Math.max(0, parseFloat(form.elements.donacion.value) || 0);
		form.elements.precio.value = `${formato.format(PRECIO_BASE + donacion)} €`;
	};

	form.elements.donacion.addEventListener('input', actualizarPrecio);
	actualizarPrecio();
});
