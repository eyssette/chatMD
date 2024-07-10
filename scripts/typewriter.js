const chatContainer = document.getElementById("chat");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
const isMobile =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
const autoFocus = isMobile ? false : true;

const thresholdMouseMovement = 5;
const regexPre = /(<pre(.|\n)*<\/pre>)/gm;
const regexMessageOptions = /(<ul class="messageOptions"\>[\s\S]*<\/ul>)/gm
const regexIframe = /(<iframe(.|\n)*<\/iframe>)/gm

// Configuration de MutationObserver
const observerConfig = {
	childList: true,
	subtree: true,
};

const messageTypeEnterToStopTypeWriter = window.innerWidth > 880 ? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement" : "“Enter” pour stopper l'effet “machine à écrire”";

let typed;
const pauseTypeWriter = "^300 ";
const stopTypeWriterExecutionTimeThreshold = 800;
// Effet machine à écrire
function typeWriter(content, element) {
	// Pour stopper l'effet machine à écrire (en appuyant sur “Enter”)
	function stopTypeWriter(slowContent) {
		typed.stop();
		typed.reset();
		slowContent = slowContent.replaceAll('`','')
		slowContent = slowContent.replace(
			regexMessageOptions,
			"`$1`"
		);
		// On doit conserver les retours à la ligne dans les blocs "pre"
		const contentKeepReturnInCode = slowContent.replaceAll(
			regexPre,
			function (match) {
				return match.replaceAll("\n", "RETURNCHARACTER");
			}
		);
		const contentArray = contentKeepReturnInCode.split("\n");
		// On découpe chaque paragraphe pour pouvoir ensuite l'afficher d'un coup
		const contentArrayFiltered = contentArray.map((element) =>
			element.startsWith(pauseTypeWriter)
				? element
						.replace(pauseTypeWriter, "")
						.replaceAll("RETURNCHARACTER", "\n") + "`"
				: element.endsWith("`")
				? "`" + element.replaceAll("RETURNCHARACTER", "\n")
				: "`" + element.replaceAll("RETURNCHARACTER", "\n") + "`"
		);
		typed.strings = [contentArrayFiltered.join(" ")];
		typed.start();
		typed.destroy();
	}

	function keypressHandler(event) {
		if (event.key === "Enter") {
			mutationObserver.disconnect();
			observerConnected = false;
			stopTypeWriter(content);
		}
	}

	let counter = 0;
	const start = Date.now();
	let observerConnected = true;
	function handleMutation() {
		// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
		const executionTime = Date.now() - start;
		if (
			counter == 50 &&
			executionTime > stopTypeWriterExecutionTimeThreshold &&
			observerConnected
		) {
			stopTypeWriter(content);
			observerConnected = false;
			mutationObserver.disconnect();
		}
		// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
		scrollWindow();
		counter++;
	}

	// S'il y a des options en fin de message, on les fait apparaître d'un coup, sans effet typeWriter
	content = content.replace(
		regexMessageOptions,
		pauseTypeWriter + "`$1`"
	);

	// On fait apparaître d'un coup les iframes
	content = content.replaceAll(regexIframe,"`$1`")

	// Effet machine à écrire
	typed = new Typed(element, {
		strings: [content],
		typeSpeed: -5000,
		startDelay: 100,
		showCursor: false,
		onBegin: () => {
			// Quand l'effet démarre, on refocalise sur userInput (sauf sur les smartphones)
			if (autoFocus) {
				userInput.focus();
			}
			// On détecte un appui sur Enter pour stopper l'effet machine à écrire
			userInput.addEventListener("keypress", keypressHandler);
			userInput.setAttribute("placeholder", messageTypeEnterToStopTypeWriter);

			// On détecte le remplissage petit à petit du DOM pour scroller automatiquement la fenêtre vers le bas
			mutationObserver = new MutationObserver(handleMutation);
			function enableAutoScroll() {
				mutationObserver.observe(chatContainer, observerConfig);
			}
			enableAutoScroll();

			setTimeout(() => {
				// Arrêter le scroll automatique en cas de mouvement de la souris ou de contact avec l'écran
				document.addEventListener("mousemove", function (e) {
					if (Math.abs(e.movementX) > thresholdMouseMovement || Math.abs(e.movementY) > thresholdMouseMovement) {
						observerConnected = false;
						mutationObserver.disconnect();
					}
				});
				document.addEventListener("wheel", function (e) {
					if (e.deltaY > 0) {
						// On détecte si on a fait un mouvement vers le bas
						if (
							window.scrollY + window.innerHeight >=
							document.body.offsetHeight
						) {
							// On remet le scroll automatique si on a scrollé jusqu'au bas de la page
							enableAutoScroll();
						} else {
							observerConnected = false;
							mutationObserver.disconnect();
						}
					} else {
						observerConnected = false;
						mutationObserver.disconnect();
					}
				});
				document.addEventListener("touchstart", function () {
					observerConnected = false;
					mutationObserver.disconnect();
					setTimeout(() => {
						if (
							window.scrollY + window.innerHeight + 200 >=
							document.documentElement.scrollHeight
						) {
							// On remet le scroll automatique si on a scrollé jusqu'au bas de la page
							enableAutoScroll();
						}
					}, 5000);
				});
			}, 1000);
		},
		onComplete: () => {
			// Gestion de textFit pour les éléments en Latex
			if (yamlUseAddOns && yamlUseAddOns.includes("textFit")) {
				textFit(element.querySelectorAll(".katex-display"));
			}
			// Quand l'effet s'arrête on supprime la détection du bouton Enter pour stopper l'effet
			userInput.removeEventListener("keypress", keypressHandler);
			if (
				userInput.getAttribute("placeholder") ==
				messageTypeEnterToStopTypeWriter
			) {
				userInput.setAttribute("placeholder", "Écrivez votre message");
			}
			observerConnected = false;
			mutationObserver.disconnect();
		},
	});
}


function displayMessage(html, isUser, chatMessage) {
	// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
	// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
	chatContainer.appendChild(chatMessage);
	if (
		isUser ||
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
		yamlTypeWriter === false
	) {
		chatMessage.innerHTML = html;
	} else {
		typeWriter(html, chatMessage);
	}
}