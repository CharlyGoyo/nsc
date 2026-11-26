import { AwsClient } from "aws4fetch";

const encoder = new TextEncoder();

const enviarSes = async (aws, to, subject, text) => {
	await aws.fetch(`https://email.${aws.region}.amazonaws.com/v2/email/outbound-emails`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			FromEmailAddress: "carlos@imprentanacher.es",
			Destination: { ToAddresses: [to] },
			Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } } },
		}),
	});
};

const correoAutomatico = async (aws, tipo, d) => {
	console.log("EYYYYYYYYYYY");
	switch (tipo) {
		case "retiros":
			await enviarSes(
				aws,
				d.correo,
				"Inscripción recibida - Retiro de Adviento NSC-España",
				`Estimado/a ${d.nombre}:

Hemos recibido su inscripción para el Retiro de Adviento de Nuestra Señora de la Cristiandad - España que tendrá lugar del 11 al 13 de diciembre. 
Si todavía no ha realizado el pago del retiro a la casa de ejercicios, debe hacerlo lo antes posible mediante transferencia, así como el check-in online.

IBAN: ES69 2100 1650 6602 0038 6605
Titular:  PROVINCIA ESPAÑA CONGREGACION RELIGIOSAS SAGRADO CORAZON DE JESUS
Concepto: Retiro NSC-España
Cantidad: 120 €

Check-in: https://checkin.datahotel.net/casasantamariadehuerta.es/RegistroReserva/5f5c585b-851e-474f-97d8-ca18eed7aa70

Unos días previos al Retiro recibirá un correo con información práctica.

Reciba un cordial saludo en Cristo,
Asoc. Nuestra Señora de la Cristiandad - España`
			);
			break;

		case "musicasacra":
			await enviarSes(
				aws,
				d.correo,
				"Inscripción recibida - Música Sacra NSC-España",
				`Estimado/a ${d.nombre}:

Hemos recibido su inscripción para el encuentro de Música Sacra de Nuestra Señora de la Cristiandad - España que tendrá lugar del 29 al 31 de enero en Aibar (Navarra).
Unos día antes del encuentro recibirá información sobre los horarios y otros detalles prácticos.

Reciba un cordial saludo en Cristo,
Asoc. Nuestra Señora de la Cristiandad - España`
			);
			break;
	}
};

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

	const inscritoId = Number(session.metadata.inscrito_id);
	const tipo = session.metadata.tipo;

	const confirmado =
		(evento.type === "checkout.session.completed" && session.payment_status === "paid") ||
		evento.type === "checkout.session.async_payment_succeeded";

	if (confirmado) {
		const aws = new AwsClient({
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
			region: env.AWS_REGION,
			service: "ses"
		});

		switch (tipo) {
			case "retiros":
				await env.DB
					.prepare("UPDATE inscritos_retiros SET inscrito = 1 WHERE id = ?1")
					.bind(inscritoId)
					.run();
				await correoAutomatico(
					aws,
					tipo,
					await env.DB.prepare("SELECT * FROM inscritos_retiros WHERE id = ?1").bind(inscritoId).first()
				);
				break;

			case "musicasacra":
				await env.DB
					.prepare("UPDATE inscritos_musicasacra SET inscrito = 1 WHERE id = ?1")
					.bind(inscritoId)
					.run();
				await correoAutomatico(
					aws,
					tipo,
					await env.DB.prepare("SELECT * FROM inscritos_musicasacra WHERE id = ?1").bind(inscritoId).first()
				);
				break;
		}
	}

	if (evento.type === "checkout.session.expired") {
		switch (tipo) {
			case "retiros":
				await env.DB
					.prepare("DELETE FROM inscritos_retiros WHERE id = ?1 AND inscrito = 0")
					.bind(inscritoId)
					.run();
				break;
			case "musicasacra":
				await env.DB
					.prepare("DELETE FROM inscritos_musicasacra WHERE id = ?1 AND inscrito = 0")
					.bind(inscritoId)
					.run();
				break;
		}
	}

	if (evento.type === "checkout.session.async_payment_failed") {
		switch (tipo) {
			case "retiros":
				await env.DB
					.prepare("DELETE FROM inscritos_retiros WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break;
			case "musicasacra":
				await env.DB
					.prepare("DELETE FROM inscritos_musicasacra WHERE id = ?1")
					.bind(inscritoId)
					.run();
				break;
		}
	}

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}
