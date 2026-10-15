// La revolución industrial y sus consecuencias han sido un desastre para el rendimiento web
document.documentElement.classList.add('js');
const getCssVar = (name) => window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();

document.addEventListener('DOMContentLoaded', () => {
	const observable = document.querySelectorAll('[data-animation]');
	const groupMap = new Map();
	let key = null;
	observable.forEach(el => {
		key = el.dataset.animationGroup;
		(groupMap.get(key) || groupMap.set(key, []).get(key)).push(el);
	});

	const onIntersect = (entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				groupMap.get(entry.target.dataset.animationGroup).forEach(element => {
					element.style.opacity = "1";
					element.style.scale = "1";
					element.style.translate = "0 0";
					element.style.visibility = "visible";
					observer.unobserve(element);
				});
			}
		});
	};
	
	const observers = {
		'bottom':         	new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia2")} 50%`, threshold: 0 }),
		'bottom-opacity': 	new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia3")} 50%`, threshold: 0 }),
		'bottom-opacity2': 	new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia")} 50%`, threshold: 0 }),
		'top':         		new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia4")} 50%`, threshold: 0 }),
		'top2':         	new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia5")} 50%`, threshold: 0 }),
		'top-opacity':		new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia6")} 50%`, threshold: 0 }),
		'top-opacity':		new IntersectionObserver(onIntersect, { rootMargin: `0px 50% ${getCssVar("--distancia5")} 50%`, threshold: 0 }),
		'default':        	new IntersectionObserver(onIntersect, { rootMargin: '0px 50% 0px 50%', threshold: 0 })
	};

	observable.forEach(el => {
		(observers[el.dataset.animation] || observers.default).observe(el);
	});
});
