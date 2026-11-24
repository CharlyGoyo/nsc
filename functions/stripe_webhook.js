const encoder = new TextEncoder();

export async function onRequestPost({ request, env }) {
	const rawBody = await request.text();
	const sigHeader = request.headers.get("stripe-signature");
	const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=")));

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(env.STRIPE_WEBHOOK_SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);
	const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${parts.t}.${rawBody}`));
	const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

	if (expected !== parts.v1) {
		return new Response("Firma inválida", { status: 400 });
	}

	const evento = JSON.parse(rawBody);
	const session = evento.data?.object;
	if (!session?.metadata) {
		return new Response(JSON.stringify({ received: true }), { status: 200 });
	}
	console.log(session);

	const inscritoId = Number(session.metadata.inscrito_id);
	const tipo = session.metadata.tipo;

	if (evento.type === "checkout.session.completed" && session.payment_status === "paid") {
		console.log("ha pagao yay")
		switch (tipo) {
			case "retiros":
				console.log("bro está inscrito del todo");
				await env.DB
					.prepare("UPDATE inscritos_retiros SET inscrito = 1 WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break
			case "musicasacra":
				console.log("bro está inscrito del todo");
				await env.DB
					.prepare("UPDATE inscritos_musicasacra SET inscrito = 1 WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break
		}
	}

	if (evento.type === "checkout.session.async_payment_succeeded"){
		console.log("ha pagao asincrono yay")
		switch (tipo) {
			case "retiros":
				console.log("bro está inscrito del todo");
				await env.DB
					.prepare("UPDATE inscritos_retiros SET inscrito = 1 WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break
			case "musicasacra":
				console.log("bro está inscrito del todo");
				await env.DB
					.prepare("UPDATE inscritos_musicasacra SET inscrito = 1 WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break
		}
	}

	if (evento.type === "checkout.session.expired") {
		switch (tipo) {
			case "retiros":
				console.log("bro se va fuera de la db");
				await env.DB
					.prepare("DELETE FROM inscritos_retiros WHERE id = ?1 AND inscrito = 0")
					.bind(inscritoId)
					.run();
				break
			case "musicasacra":
				console.log("bro se va fuera de la db");
				await env.DB
					.prepare("DELETE FROM inscritos_musicasacra WHERE id = ?1 AND inscrito = 0")
					.bind(inscritoId)
					.run();
				break
		}
	}

	if (evento.type === "checkout.session.async_payment_failed") {
		switch (tipo) {
			case "retiros":
				console.log("bro se va fuera de la db");
				await env.DB
					.prepare("DELETE FROM inscritos_retiros WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break
			case "musicasacra":
				console.log("bro se va fuera de la db");
				await env.DB
					.prepare("DELETE FROM inscritos_musicasacra WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break
		}
	}

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}
