export async function onRequestPost({ request, env }) {
	const url = new URL(request.url).origin;
	const formData = await request.formData();
	
	try {
		const response = await env.EMAIL.send({
			to: "carlosnacherabeledo@proton.me",
			from: {name: `Formulario de donación de materiales de la web: ${formData.get("nombre")}`, email: "carlos@imprentanacher.es"},
			subject: `CONTACTO DONACIÓN DE MATERIALES: ${formData.get("asunto")}`,
			replyTo: formData.get("email"),
			text: `TELÉFONO APORTADO: ${formData.get("telefono")}
MATERIAL QUE PUEDE DONAR:
${formData.get("mensaje")}`
		});

		return new Response(
			JSON.stringify({
				success: true,
				emailId: response.messageId,
			}),
		);

	/* copiapegada gorda de los docs de cloudflare */
	} catch (error) {
		// A malformed send() argument throws a TypeError without a code
		if (error instanceof TypeError) {
			return new Response(
				JSON.stringify({
					success: false,
					error: error.message,
				}),
				{ status: 400 },
			);
		}

		// Email Service errors have .code and .message properties
		console.error("Email sending failed:", error.code, error.message);

		// Handle specific error types
		switch (error.code) {
			case "E_SENDER_DOMAIN_NOT_AVAILABLE":
				return new Response(
					JSON.stringify({
						success: false,
						error: "Onboard your sender domain to Email Service first",
					}),
					{ status: 400 },
				);

			case "E_RATE_LIMIT_EXCEEDED":
				return new Response(
					JSON.stringify({
						success: false,
						error: "Rate limit exceeded. Please try again later",
					}),
					{ status: 429 },
				);

			default:
				return new Response(
					JSON.stringify({
						success: false,
						error: error.message,
					}),
					{ status: 500 },
				);
		}
	}
}
