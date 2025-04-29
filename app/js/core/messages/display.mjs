import { scrollWindow } from "../../utils/ui.mjs";
import { yaml } from "../../markdown/custom/yaml.mjs";
import Typed from "../../lib/typed.js";
import { processCopyCode } from "../../markdown/custom/directivesAndBlocks.mjs";
import { splitHtmlIntoChunks } from "../../utils/strings.mjs";
import {
	chatContainer,
	sendButton,
	userInput,
} from "../../shared/selectors.mjs";
import {
	pauseTypeWriter,
	autoFocus,
	isMobile,
	isFirefoxOnWindows,
	regex,
} from "../../shared/constants.mjs";
import { formatContentStopTypeWriter } from "./typewriter/stopTypewriter.mjs";

const thresholdMouseMovement = 10;

// Configuration de MutationObserver
let mutationObserver;
const observerConfig = {
	childList: true,
	subtree: true,
};
let observerConnected;

const messageTypeEnterToStopTypeWriter = isMobile
	? "Clic sur “Envoyer” pour stopper l'effet “machine à écrire”"
	: window.innerWidth > 880
		? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement"
		: "“Enter” pour stopper l'effet “machine à écrire”";

// Active ou désactive la détection des mouvements pour l’auto-scroll
function manageScrollDetection(enable) {
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
			observerConnected = false;
			mutationObserver.disconnect();
			removeScrollListeners();
			// Sur un portable ou une tablette, on réactive le scroll si finalement on est revenu en bas de la page
			if (event.type === "touchstart") {
				setTimeout(() => {
					if (
						window.scrollY + window.innerHeight + 200 >=
						document.documentElement.scrollHeight
					) {
						observerConnected = true;
						mutationObserver.observe(chatContainer, observerConfig);
					}
				}, 5000);
			}
		} else if (
			// On réactive l'autoscroll si on se déplace vers le bas jusqu'au bas de la fenêtre
			event.type === "wheel" &&
			event.deltaY > 0 &&
			window.scrollY + window.innerHeight >= document.body.offsetHeight
		) {
			observerConnected = true;
			mutationObserver.observe(chatContainer, observerConfig);
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

// Pour stopper l'effet machine à écrire (en appuyant sur “Enter”)
function stopTypeWriter(content, typedElement) {
	typedElement.stop();
	typedElement.reset();
	content = formatContentStopTypeWriter(content);
	typedElement.strings = [content];
	typedElement.start();
	typedElement.destroy();
	scrollWindow({ scrollMode: "instant" });
	manageScrollDetection(false);
}

let typed;

// Effet machine à écrire
function typeWriter(content, element, accelerateFactor) {
	return new Promise((resolve) => {
		function keypressHandler(event) {
			if (event.key === "Enter") {
				mutationObserver.disconnect();
				observerConnected = false;
				stopTypeWriter(content, typed);
			}
		}

		// S'il y a des options en fin de message, on les fait apparaître d'un coup, sans effet typeWriter
		content = content.replace(regex.messageOptions, pauseTypeWriter + "`$1`");

		// On fait apparaître d'un coup les iframes
		content = content.replaceAll(regex.iframe, "`$1`");

		// On peut accéler l'effet machine à écrire en regroupant les caractères : au lieu de les afficher un par, on les affiche N par N (N = le facteur d'accélération)
		if (accelerateFactor) {
			content = splitHtmlIntoChunks(content, accelerateFactor);
		} else {
			// Accélération par défaut pour Firefox sur Windows
			if (isFirefoxOnWindows) {
				content = splitHtmlIntoChunks(content, 5);
			}
		}

		const start = Date.now();
		observerConnected = true;
		let watchExecutionTime = true;
		function handleMutation() {
			// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
			if (watchExecutionTime) {
				const executionTime = Date.now() - start;
				const checkpointTime = 1000;
				const minCharLength = 80;
				if (executionTime > checkpointTime && observerConnected) {
					if (element.innerHTML.length < minCharLength) {
						stopTypeWriter(content, typed);
						observerConnected = false;
						mutationObserver.disconnect();
					}
					watchExecutionTime = false;
				}
			}

			// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
			if (observerConnected) {
				scrollWindow({ scrollMode: "smooth" });
			}
		}

		// Effet machine à écrire
		typed = new Typed(element, {
			strings: [content],
			typeSpeed: 0,
			startDelay: 100,
			showCursor: false,
			onBegin: () => {
				// Si on a désactivé le clavier, on remet l'opacité du bouton à 1 pour pouvoir voir le bouton "Afficher tout"
				if (yaml.userInput == false) {
					sendButton.style.opacity = "1";
				}
				// Quand l'effet démarre, on refocalise sur userInput (sauf sur les smartphones)
				if (autoFocus) {
					userInput.focus();
				}
				// On détecte un appui sur Enter pour stopper l'effet machine à écrire
				userInput.addEventListener("keypress", keypressHandler);
				userInput.setAttribute("placeholder", messageTypeEnterToStopTypeWriter);

				// On détecte le remplissage petit à petit du DOM pour scroller automatiquement la fenêtre vers le bas
				mutationObserver = new MutationObserver(handleMutation);
				observerConnected = true;
				mutationObserver.observe(chatContainer, observerConfig);
				setTimeout(() => manageScrollDetection(true), 1000);
			},
			onComplete: () => {
				// Si on a désactivé le clavier, on remet l'opacité du bouton à 0.5 pour pouvoir voir en grisé le bouton "Afficher tout"
				if (
					yaml.userInput == false &&
					document.body.classList.contains("hideControls")
				) {
					sendButton.style.opacity = "0.5";
				}
				// Gestion de textFit pour les éléments en Latex
				if (yaml.addOns && yaml.addOns.includes("textFit")) {
					window.textFit(element.querySelectorAll(".katex-display"));
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
				manageScrollDetection(false);
				resolve();
			},
		});
	});
}

export function displayMessage(html, isUser, chatMessage, container) {
	return new Promise((resolve) => {
		// On affiche le message dans un container. Par défaut on affiche le message comme un nouveau message dans le chat, mais on peut définir un container (pour afficher le message comme un élément enfant d'un nouveau message en cas de génération de message à la fois via le markdown et un LLM : dans ce cas, il faut que le contenu des messages se suivent, dans un même message, au lieu d'ajouter un nouveau message à chaque fois)
		if (html) {
			if (container) {
				chatContainer.appendChild(container);
			} else {
				container = chatContainer;
			}
			container.appendChild(chatMessage);
			html = isUser ? html : processCopyCode(html);
			// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
			// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
			if (
				isUser ||
				window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
				yaml.typeWriter === false
			) {
				// La désactivation de l'effet typewriter avec les backticks n'est plus nécessaire : on les supprime, et on supprime également les pauses (par exemple : ^100)
				html = html.replaceAll("`", "").replace(/\^\d+/g, "");
				chatMessage.innerHTML = html;
				resolve();
			} else {
				typeWriter(html, chatMessage).then(() => resolve());
			}
		} else {
			resolve();
		}
	});
}
