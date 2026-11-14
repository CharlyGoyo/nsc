// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const inputIframeMap = new Map();

	document.querySelectorAll('[data-yt-input]').forEach(input => {
		inputIframeMap.set(input, document.querySelector(`[data-yt-iframe="${input.dataset.ytInput}"]`));
	});

	inputIframeMap.forEach((iframe, input) => {
		input.addEventListener('change', () => {
			if (input.checked) {
				if (iframe.src !== input.dataset.ytSrc) {
					iframe.src = input.dataset.ytSrc; 
				}
			}
			else {
				iframe.contentWindow.postMessage(
					JSON.stringify({
						event: 'command',
						func: 'pauseVideo',
						args: []
					}),
					'*'
				);
			}
		});
	});
});
