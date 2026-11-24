export async function onRequestPost({ request, env }) {
	const formData = await request.formData().catch(() => null);
	if (!formData) return Response(JSON.stringify({ error: "Los datos introducidos inválidos." }), {status: 400});
	const nombre = String(formData.get("nombre") ?? "").trim();
	const correo = String(formData.get("email") ?? "").trim().toLowerCase();

	if (!nombre) {
		return new Response(JSON.stringify({ error: "Por favor, introduce el nombre" }), {status: 400});
	}

	if (!correo) {
		return new Response(JSON.stringify({ error: "Por favor, introduce un correo válido" }), {status: 400});
	}

	try {
		await env.DB
			.prepare("INSERT INTO inscritos_boletin (nombre, correo) VALUES (?1, ?2)")
			.bind(nombre, correo)
			.run();

		return new Response(JSON.stringify({success: true}), {status: 200});
	} catch (err) {
		const msg = String(err?.message || "");
		if (msg.includes("UNIQUE")) {
			return new Response(JSON.stringify({ success: true}), {status: 200});
		}
		return new Response(JSON.stringify({ error: "Se ha producido un error." }), {status: 500});
	}
}
