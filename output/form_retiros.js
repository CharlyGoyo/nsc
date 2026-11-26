// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('[data-form="retiros"]');
	if (!form) return;

	const formato = new Intl.NumberFormat('es-ES', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const actualizarAportacion = () => {
		const donacion = Math.max(0, parseFloat(form.elements.donacion.value) || 0);
		form.elements.precio.value = `${formato.format(donacion)} €`;
	};

	form.elements.donacion.addEventListener('input', actualizarAportacion);
	actualizarAportacion();

	const msg = document.createElement('p');
	msg.style.display = 'none';
	msg.style.width = '100%';
	msg.style.color = 'green';
	msg.className = 'p1';

	const successParam = new URLSearchParams(window.location.search).get('success');
	if (successParam === 'true') {
		form.appendChild(msg);
		msg.style.color = 'green';
		msg.style.display = 'flex';
		msg.textContent = 'El formulario se ha subido correctamente.';
		window.scrollTo({
			top: document.documentElement.scrollHeight,
			behavior: 'smooth' 
		});
		form.reset();
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const res = await fetch(form.action, {
			method: form.method,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(new FormData(form)),
		});

		const data = await res.json().catch(() => ({}));
		if (res.ok && data.url && !data.url.startsWith(window.location.origin)) {
			window.location.href = data.url;
			return;
		}
		console.log(data.url);

		form.appendChild(msg);
		msg.style.color = 'red';
		msg.style.display = 'flex';
		msg.textContent = data.error || `Error (${res.status}).`;
	});
});
