export function onRequest(context) {
	return new Response(env.ASSETS.fetch("/peregrinacion"));
}
