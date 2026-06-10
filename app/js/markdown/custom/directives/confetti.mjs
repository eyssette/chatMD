function randomInRange(min, max) {
	return Math.random() * (max - min) + min;
}

// Confettis en forme de feu d'artifice
function firework() {
	const duration = 2000;
	const animationEnd = Date.now() + duration;
	const defaults = {
		startVelocity: 30,
		spread: 360,
		ticks: 60,
		zIndex: 0,
		scalar: 1.25,
	};

	const interval = setInterval(function () {
		const timeLeft = animationEnd - Date.now();

		if (timeLeft <= 0) {
			return clearInterval(interval);
		}

		const particleCount = 50 * (timeLeft / duration);
		window.confetti({
			...defaults,
			particleCount,
			origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
		});
		window.confetti({
			...defaults,
			particleCount,
			origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
		});
	}, 250);
}

// Confettis en forme d'étoiles
function stars() {
	const defaults = {
		spread: 360,
		ticks: 50,
		gravity: 0,
		decay: 0.94,
		startVelocity: 30,
		colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
	};

	function shoot() {
		window.confetti({
			...defaults,
			particleCount: 40,
			scalar: 1.2,
			shapes: ["star"],
		});

		window.confetti({
			...defaults,
			particleCount: 10,
			scalar: 0.75,
			shapes: ["circle"],
		});
	}

	setTimeout(shoot, 0);
	setTimeout(shoot, 100);
	setTimeout(shoot, 200);
}

// Confettis à partir d'un texte
function shapeFromText(text) {
	const scalar = 2;
	const shape = window.confetti.shapeFromText({ text: text, scalar });

	const defaults = {
		spread: 100,
		shapes: [shape],
		scalar,
		origin: { y: 0.6 },
	};

	function shoot() {
		window.confetti({
			...defaults,
			particleCount: 40,
		});

		window.confetti({
			...defaults,
			particleCount: 5,
			flat: true,
		});

		window.confetti({
			...defaults,
			particleCount: 10,
			scalar: scalar / 2,
		});
	}

	setTimeout(shoot, 0);
	setTimeout(shoot, 100);
	setTimeout(shoot, 200);
}

// Confettis par défaut
function defaultConfetti() {
	window.confetti({
		particleCount: 100,
		spread: 70,
		origin: { y: 0.6 },
		scalar: 1.25,
	});
}

// Fonction pour lancer les confettis
function launchConfetti(options = "") {
	if (options) {
		if (options == "firework") {
			firework();
			return;
		}
		if (options == "stars") {
			stars();
			return;
		}
		shapeFromText(options);
		return;
	}
	defaultConfetti();
}

// Gestion de la directive !Confetti
export function processDirectiveConfetti(message) {
	// Gestion de la directive !Confetti ou !Confettis
	message = message.replaceAll(/!Confettis?:?(.*)?/g, function () {
		const options = arguments[1] ? arguments[1].trim() : "";
		const confettiScriptAlreadyLoaded =
			document.querySelector("#confettiScript");
		const confettiScript =
			confettiScriptAlreadyLoaded || document.createElement("script");
		if (!confettiScriptAlreadyLoaded) {
			confettiScript.src = "js/plugins/canvas-confetti.min.js";
			confettiScript.id = "confettiScript";
			document.head.appendChild(confettiScript);
			confettiScript.onload = () => {
				launchConfetti(options);
			};
		} else {
			launchConfetti(options);
		}
		return "";
	});

	return message;
}
