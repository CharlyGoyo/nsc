export async function onRequestPost({ request, env }) {
	const url = new URL(request.url).origin;
	const formData = await request.formData().catch(() => null);
	if (!formData) {
		return new Response(JSON.stringify({ error: "Los datos introducidos son inválidos." }), { status: 400 });
	}

	const nombre = String(formData.get("nombre") ?? "").trim();
	const apellidos = String(formData.get("apellidos") ?? "").trim();
	const correo = String(formData.get("email") ?? "").trim().toLowerCase();
	const edad = Number(formData.get("edad"));
	const intolerancia = String(formData.get("intolerancia") ?? "").trim() || null;
	const donacion = Number(formData.get("donacion"));
	const habitacion = String(formData.get("habitacion") ?? "").trim() || null;

	if (!nombre) {
		return new Response(JSON.stringify({ error: "Por favor, introduce el nombre." }), { status: 400 });
	}
	if (!apellidos) {
		return new Response(JSON.stringify({ error: "Por favor, introduce los apellidos." }), { status: 400 });
	}
	if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
		return new Response(JSON.stringify({ error: "Por favor, introduce un correo válido." }), { status: 400 });
	}
	if (!Number.isInteger(edad) || edad < 0 || edad > 120) {
		return new Response(JSON.stringify({ error: "Por favor, introduce una edad válida." }), { status: 400 });
	}
	if (!Number.isFinite(donacion) || donacion < 1) {
		return new Response(JSON.stringify({ error: "La donación mínima es de 1 €." }), { status: 400 });
	}
	if (formData.get("casa") !== "1" || formData.get("checkin") !== "1" || formData.get("privacidad") !== "1") {
		return new Response(JSON.stringify({ error: "Debes confirmar el pago, el check-in y la política de privacidad." }), { status: 400 });
	}

	try {
		const unitAmount = Math.round(donacion * 100);
		const params = new URLSearchParams({
			mode:												'payment',
			success_url:										`${url}/retiros?success=true`,
			cancel_url:											`${url}/retiros?success=false`,
			locale:												'auto',
			'adaptive_pricing[enabled]':						true,
			"line_items[0][quantity]":							1,
			"line_items[0][price_data][currency]":				"eur",
			"line_items[0][price_data][unit_amount]":			String(unitAmount),
			"line_items[0][price_data][product_data][name]":	"Donación"
		});

		const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.STRIPE_API_KEY}`
			},
			body: params
		});

		const session = await res.json();

		await env.DB
			.prepare("INSERT INTO inscritos_retiros (nombre, apellidos, correo, edad, intolerancia, donacion, habitacion) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
			.bind(nombre, apellidos, correo, edad, intolerancia, donacion, habitacion)
			.run();

		return Response.redirect(session.url, 303);
	} catch (err) {
		const msg = String(err?.message || "");
		return new Response(JSON.stringify({ error: "Se ha producido un error." }), { status: 500 });
	}
}
