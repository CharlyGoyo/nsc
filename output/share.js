document.addEventListener("DOMContentLoaded", () => {
	const url	= encodeURIComponent(window.location.href);
	const title	= encodeURIComponent(document.title);

	const links = {
		a13: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
		a14: `https://x.com/intent/post?url=${url}&text=${title}`,
		a15: `https://t.me/share/url?url=${url}&text=${title}`,
		a16: `https://api.whatsapp.com/send?text=${title}%20${url}`,
		a17: `mailto:?subject=${title}&body=${url}`
	};

	for (const [id, href] of Object.entries(links)) {
		const el = document.getElementById(id);
		if (el) el.href = href;
	}
});
