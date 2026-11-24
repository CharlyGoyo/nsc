// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web

document.addEventListener('DOMContentLoaded', () => {
	let msg = document.createElement('p');
	msg.style.display = 		'none';
	msg.style.borderRadius =	'20px';
	msg.style.width =			'100%';
	msg.style.color =			'white';
	msg.className =				'p1';
	msg.alignSelf =				'end';

	document.querySelector('[data-form="boletin"]').addEventListener("submit", async (e) =>{
		e.preventDefault();
		const form = e.currentTarget;
		const res = await fetch(form.action, {
			method: form.method,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams(new FormData(form)),
		});

		form.appendChild(msg);
		const data = await res.json().catch(() => ({}));

		let content = "Formulario enviado.";

		if (!res.ok) {
			content = data.error || `Error (${res.status}).`;
			msg.style.color = 'red';
		}
		else{
			form.reset();
		}

		msg.style.display = 'flex';
		msg.textContent = content;
	});
});
