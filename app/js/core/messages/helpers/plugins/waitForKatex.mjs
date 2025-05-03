// On attend que la librairie de gestion de Latex soit disponible (avec un maximum d'essais pour éviter une boucle infinie)
export function waitForKaTeX() {
	return new Promise((resolve) => {
		let attempts = 0;
		const interval = setInterval(() => {
			if (window.katex || attempts > 10) {
				clearInterval(interval);
				resolve();
			} else {
				attempts++;
			}
		}, 100);
	});
}
