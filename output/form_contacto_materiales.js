// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web

document.addEventListener('DOMContentLoaded', () => {
	let msg = document.createElement('p');
	msg.style.display = 		'none';
	msg.style.padding =			'20px';
	msg.style.border =			'solid 1px green';
	msg.style.borderRadius =	'20px';
	msg.style.width =			'100%';
	msg.style.color =			'green';
	msg.className =				'p1';

	document.querySelector('[data-form="contacto_materiales"]').addEventListener("submit", async (e) =>{
		e.preventDefault();
		const form = e.currentTarget;
		const res = await fetch(form.action, {
			method: form.method,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams(new FormData(form)),
		});

		form.after(msg);
		const data = await res.json().catch(() => ({}));

		let content = "Mensaje enviado.";

		if (!res.ok) {
			content = data.error || `Error (${res.status}).`;
			msg.style.borderColor = 'red';
			msg.style.color = 'red';
		} /* else { form.reset(); } */

		msg.style.display = 'flex';
		msg.textContent = content;
	});
});
