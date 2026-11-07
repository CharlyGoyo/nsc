export async function onRequestPost(context) {
	const url = new URL(context.request.url).origin;

	const params = new URLSearchParams({
		mode:							'payment',
		success_url:					`${url}/donaciones?success=true`,
		cancel_url:						`${url}/donaciones?success=false`,
		locale:							'auto',
		'adaptive_pricing[enabled]':	true,
		'line_items[0][quantity]': 		1,
		'line_items[0][price]':			'price_1UYWTICNOpaMFlfC2vwyXCuc'
	});

	const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${context.env.STRIPE_API_KEY}`
		},
		body: params
	});

	const session = await res.json();
	console.log(session);

	return Response.redirect(session.url, 303);
}
