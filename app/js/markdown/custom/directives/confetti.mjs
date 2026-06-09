// Fonction pour lancer les confettis
function launchConfetti() {
	window.confetti({
		particleCount: 100,
		spread: 70,
		origin: { y: 0.6 },
	});
}

// Gestion de la directive !Confetti
export function processDirectiveConfetti(message) {
	// Gestion de la directive !Confetti ou !Confettis
	message = message.replaceAll(/!Confettis?/g, function () {
		const confettiScriptAlreadyLoaded =
			document.querySelector("#confettiScript");
		const confettiScript =
			confettiScriptAlreadyLoaded || document.createElement("script");
		if (!confettiScriptAlreadyLoaded) {
			confettiScript.src = "js/plugins/canvas-confetti.min.js";
			confettiScript.id = "confettiScript";
			document.head.appendChild(confettiScript);
			// On attend que le script soit chargé avant de lancer les confettis
			confettiScript.onload = () => {
				launchConfetti();
			};
		} else {
			launchConfetti();
		}
		return "";
	});

	return message;
}
