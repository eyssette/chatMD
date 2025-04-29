import { chatContainer } from "../../../shared/selectors.mjs";

const thresholdMouseMovement = 10;

// Active ou désactive la détection des mouvements pour l’auto-scroll
export function manageScrollDetection(enable, observer) {
	function scrollHandler(event) {
		if (
			// On désactive l'autoscroll dans 3 cas
			// 1er cas : si on a déplacé la souris (on évite les petits mouvements avec un treshold)
			(event.type === "mousemove" &&
				(Math.abs(event.movementX) > thresholdMouseMovement ||
					Math.abs(event.movementY) > thresholdMouseMovement)) ||
			// 2e cas : si on fait un mouvement vers le haut ou bien vers le bas, mais sans aller jusqu'au bas de la fenêtre
			(event.type === "wheel" &&
				(event.deltaY <= 0 ||
					(event.deltaY > 0 &&
						window.scrollY + window.innerHeight <
							document.body.offsetHeight))) ||
			// 3e cas, sur un portable ou une tablette, si on touche l'écran
			event.type === "touchstart"
		) {
			observer.connected = false;
			observer.mutationObserver.disconnect();
			removeScrollListeners();
			// Sur un portable ou une tablette, on réactive le scroll si finalement on est revenu en bas de la page
			if (event.type === "touchstart") {
				setTimeout(() => {
					if (
						window.scrollY + window.innerHeight + 200 >=
						document.documentElement.scrollHeight
					) {
						observer.connected = true;
						observer.mutationObserver.observe(chatContainer, observer.config);
					}
				}, 5000);
			}
		} else if (
			// On réactive l'autoscroll si on se déplace vers le bas jusqu'au bas de la fenêtre
			event.type === "wheel" &&
			event.deltaY > 0 &&
			window.scrollY + window.innerHeight >= document.body.offsetHeight
		) {
			observer.connected = true;
			observer.mutationObserver.observe(chatContainer, observer.config);
		}
	}

	function addScrollListeners() {
		document.addEventListener("mousemove", (event) => {
			scrollHandler(event);
		});
		document.addEventListener("wheel", (event) => {
			scrollHandler(event);
		});
		document.addEventListener("touchstart", (event) => {
			scrollHandler(event);
		});
	}

	function removeScrollListeners() {
		document.removeEventListener("mousemove", scrollHandler);
		document.removeEventListener("wheel", scrollHandler);
		document.removeEventListener("touchstart", scrollHandler);
	}

	if (enable) {
		addScrollListeners();
	} else {
		removeScrollListeners();
	}
}
