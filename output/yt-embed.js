// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const inputIframeMap = new Map();
	document.querySelectorAll('[data-yt-input]').forEach(input => {
		inputIframeMap.set(input, document.querySelector(`[data-yt-iframe="${input.dataset.ytInput}"]`));
	});

	inputIframeMap.forEach((iframe, input) => {
		const onChange = () => {
			if (input.checked) {
				if (!iframe.src) {
					iframe.src = iframe.dataset.ytSrc; 
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
		}

		input.addEventListener('change', onChange);
		onChange();
	});
});
