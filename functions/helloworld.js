export function onRequest(context) {
	return new Response("Hello, World" + context.dir);
}
