const SEXOS = new Set(["hombre", "mujer"]);
const NIVELES = new Set(["poca", "media", "alta", "profesional", "nose"]);
const VOCES = new Set(["soprano", "alto", "tenor", "bajo", "nose"]);
const CORO = new Set(["si", "no"]);

export async function onRequestPost({ request, env }) {
	const url = new URL(request.url).origin;
	const formData = await request.formData().catch(() => null);
	if (!formData) {
		return new Response(JSON.stringify({ error: "Los datos introducidos son inválidos." }), { status: 400 });
	}

	const nombre = String(formData.get("nombre") ?? "").trim();
	const apellidos = String(formData.get("apellidos") ?? "").trim();
	const correo = String(formData.get("email") ?? "").trim().toLowerCase();
	const telefono = String(formData.get("tel") ?? "").trim();
	const edad = Number(formData.get("edad"));
	const sexo = String(formData.get("sexo") ?? "").trim();
	const nivel = String(formData.get("nivel") ?? "").trim();
	const voz = String(formData.get("voz") ?? "").trim();
	const coro = String(formData.get("coro") ?? "").trim();
	const donacion = Number(String(formData.get("donacion") ?? "").trim());
	const intolerancia = String(formData.get("intolerancia") ?? "").trim() || null;

	if (!nombre) {
		return new Response(JSON.stringify({ error: "Por favor, introduce el nombre." }), { status: 400 });
	}
	if (!apellidos) {
		return new Response(JSON.stringify({ error: "Por favor, introduce los apellidos." }), { status: 400 });
	}
	if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
		return new Response(JSON.stringify({ error: "Por favor, introduce un correo válido." }), { status: 400 });
	}
	console.log(donacion)
	if (!Number.isFinite(donacion) || donacion < 0) {
		return new Response(JSON.stringify({ error: "La donación mínima es de 0 €." }), { status: 400 });
	}
	if (!telefono) {
		return new Response(JSON.stringify({ error: "Por favor, introduce un teléfono." }), { status: 400 });
	}
	if (!Number.isInteger(edad) || edad < 0 || edad > 120) {
		return new Response(JSON.stringify({ error: "Por favor, introduce una edad válida." }), { status: 400 });
	}
	if (!SEXOS.has(sexo) || !NIVELES.has(nivel) || !VOCES.has(voz) || !CORO.has(coro)) {
		return new Response(JSON.stringify({ error: "Selecciona opciones válidas en el formulario." }), { status: 400 });
	}

	try {
		const db_res = await env.DB
			.prepare("INSERT INTO inscritos_musicasacra (nombre, apellidos, correo, telefono, edad, sexo, nivel, voz, coro, intolerancia) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)")
			.bind(nombre, apellidos, correo, telefono, edad, sexo, nivel, voz, coro, intolerancia)
			.run();

		const unitAmount = Math.round(8500 + donacion * 100);
		const inscritoId = db_res.meta.last_row_id;
		const expiresAt = Math.floor(Date.now() / 1000) + 3600; 

		const params = new URLSearchParams({
			mode:												'payment',
			success_url:										`${url}/musicasacra?success=true`,
			cancel_url:											`${url}/musicasacra?success=false`,
			locale:												'auto',
			expires_at:											String(expiresAt),
			'adaptive_pricing[enabled]':						true,
			"metadata[inscrito_id]": 							String(inscritoId),
			"metadata[tipo]": 									"retiros",
			"line_items[0][quantity]":							1,
			"line_items[0][price_data][currency]":				"eur",
			"line_items[0][price_data][unit_amount]":			String(unitAmount),
			"line_items[0][price_data][product_data][name]":	"Donación"
		});

		const stripe_res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.STRIPE_API_KEY}`
			},
			body: params
		});

		console.log(stripe_res);
		const session = await stripe_res.json();
		if (!stripe_res.ok || !session.url) {
			throw new Error();
		}
		console.log(session);

		return Response.json({ url: session.url });
	} catch (err) {
		const msg = String(err?.message || "");
		return new Response(JSON.stringify({ error: msg }), { status: 500 });
	}
}
