// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const [anterior, siguiente] = document.querySelectorAll('.label13');
	const numberInput = document.querySelector('#input17');
	const inputs = Array.from(document.querySelectorAll('.input12'));
	const last = inputs.length - 1;
	let checked_input = inputs[0];
	
	numberInput.addEventListener('change', () => {
		checked_input.checked = false;
		checked_input = inputs[numberInput.value - 1];
		checked_input.checked = true;
	});

	anterior.onclick = () => {
		numberInput.stepDown();
		numberInput.dispatchEvent(new Event('change'));
	};

	siguiente.onclick = () => {
		numberInput.stepUp();
		numberInput.dispatchEvent(new Event('change'));
	};

	inputs[0].checked = true;
});
